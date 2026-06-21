import { useState, useCallback, useMemo } from "react";
import type {
  Condition,
  GameConfig,
  InteractionEffect,
  EngineState,
  SaveData,
  PuzzleEngine,
  CellDef,
  InteractionStage,
  LockResult,
  LockUIInfo,
} from "./types";

export function checkCondition(
  cond: Condition,
  state: {
    inventory: string[];
    flags: Record<string, boolean>;
  }
): boolean {
  switch (cond.type) {
    case "hasItem":
      return cond.itemId ? state.inventory.includes(cond.itemId) : false;
    case "notHasItem":
      return cond.itemId ? !state.inventory.includes(cond.itemId) : true;
    case "flagTrue":
      return cond.flagId ? !!state.flags[cond.flagId] : false;
    case "flagFalse":
      return cond.flagId ? !state.flags[cond.flagId] : true;
    case "all":
      return cond.conditions
        ? cond.conditions.every((c) => checkCondition(c, state))
        : true;
    case "any":
      return cond.conditions
        ? cond.conditions.some((c) => checkCondition(c, state))
        : false;
    default:
      return false;
  }
}

function applyEffects(
  effects: InteractionEffect,
  state: EngineState,
  config: GameConfig
): {
  newInventory: string[];
  newFlags: Record<string, boolean>;
  newEscaped: boolean;
  newEndingId: string | null;
  collectedItemIds: string[];
} {
  let newInventory = [...state.inventory];
  const collectedItemIds: string[] = [];

  if (effects.giveItems) {
    for (const itemId of effects.giveItems) {
      if (!newInventory.includes(itemId) && config.items[itemId]) {
        newInventory.push(itemId);
        collectedItemIds.push(itemId);
      }
    }
  }

  const newFlags = { ...state.flags };
  if (effects.setFlags) {
    Object.assign(newFlags, effects.setFlags);
  }

  let newEscaped = state.escaped;
  let newEndingId = state.endingId;
  if (effects.triggerEnding) {
    newEscaped = true;
    newEndingId = effects.triggerEnding;
  }

  return { newInventory, newFlags, newEscaped, newEndingId, collectedItemIds };
}

export function usePuzzleEngine(config: GameConfig): PuzzleEngine {
  const initialState = useMemo((): EngineState => {
    const cellStageIds: Record<string, string> = {};
    for (const room of config.rooms) {
      for (const cell of room.cells) {
        cellStageIds[cell.id] = cell.initialStageId;
      }
    }
    return {
      inventory: [],
      investigatedCellIds: new Set(),
      cellStageIds,
      flags: {},
      flashlightActive: false,
      escaped: false,
      endingId: null,
      combineCount: 0,
      hintUsage: {},
      lastHint: "",
      gameStartTime: 0,
      currentRoomId: config.rooms[0]?.id ?? "",
    };
  }, [config]);

  const [state, setState] = useState<EngineState>(initialState);

  const getCell = useCallback(
    (cellId: string): CellDef | undefined => {
      for (const room of config.rooms) {
        const cell = room.cells.find((c) => c.id === cellId);
        if (cell) return cell;
      }
      return undefined;
    },
    [config]
  );

  const getCellStage = useCallback(
    (cellId: string): InteractionStage | undefined => {
      const cell = getCell(cellId);
      if (!cell) return undefined;
      const stageId = state.cellStageIds[cellId] ?? cell.initialStageId;
      return cell.stages[stageId];
    },
    [getCell, state.cellStageIds]
  );

  const checkCond = useCallback(
    (cond: Condition): boolean => {
      return checkCondition(cond, {
        inventory: state.inventory,
        flags: state.flags,
      });
    },
    [state.inventory, state.flags]
  );

  const hasItem = useCallback(
    (id: string) => state.inventory.includes(id),
    [state.inventory]
  );

  const _resolveStageItem = useCallback(
    (stage: InteractionStage): string | undefined => {
      if (!stage.onInteract?.giveItems) return undefined;
      const newItems = stage.onInteract.giveItems.filter(
        (id) => !state.inventory.includes(id)
      );
      return newItems[0];
    },
    [state.inventory]
  );

  const getCellContent = useCallback(
    (cellId: string) => {
      const stage = getCellStage(cellId);
      if (!stage) {
        return {
          description: "",
          clueDetail: "",
          nextHint: "",
        };
      }

      const reqSatisfied = stage.requires ? checkCond(stage.requires) : true;
      const isLocked = stage.isLocked && !reqSatisfied;
      const requiresText = stage.requires ? describeRequirement(stage.requires, state.inventory) : undefined;

      const override = reqSatisfied && stage.requiresMet ? stage.requiresMet : undefined;
      const description = override?.description ?? stage.description;
      const clueDetail = override?.clueDetail ?? stage.clueDetail;
      const nextHint = override?.nextHint ?? stage.nextHint;
      const lockReason = override?.lockReason ?? stage.lockReason;

      let alreadyChecked = stage.alreadyChecked ?? false;
      if (!alreadyChecked && stage.onInteract?.giveItems && stage.onInteract.giveItems.length > 0) {
        alreadyChecked = stage.onInteract.giveItems.every((id) => state.inventory.includes(id));
      }
      if (!alreadyChecked && stage.moveToStage && (stage.onInteract || stage.onUnlock)) {
        alreadyChecked = state.cellStageIds[cellId] !== stage.id;
      }

      return {
        description,
        clueDetail,
        nextHint,
        itemId: _resolveStageItem(stage),
        isLocked,
        lockReason,
        alreadyChecked,
        requiresText,
        lockTargetId: stage.lockTargetId,
      };
    },
    [getCellStage, checkCond, state.inventory, state.cellStageIds, _resolveStageItem]
  );

  function autoAdvanceCell(
    cellId: string,
    stateSnapshot: EngineState
  ): { advanced: boolean; stagesAdvanced: number; newState?: Partial<EngineState> } {
    const cell = getCell(cellId);
    if (!cell) return { advanced: false, stagesAdvanced: 0 };

    let currentState = { ...stateSnapshot };
    let stagesAdvanced = 0;
    let anyAdvanced = false;
    let safetyCounter = 0;
    const MAX_ADVANCES = 20;

    while (safetyCounter < MAX_ADVANCES) {
      safetyCounter++;
      const currentStageId = currentState.cellStageIds[cellId] ?? cell.initialStageId;
      const stage = cell.stages[currentStageId];
      if (!stage) break;

      if (!stage.isLocked || !stage.requires) break;
      if (!checkCondition(stage.requires, { inventory: currentState.inventory, flags: currentState.flags })) break;

      if (stage.onUnlock) {
        const result = applyEffects(stage.onUnlock, currentState, config);
        currentState = {
          ...currentState,
          inventory: result.newInventory,
          flags: result.newFlags,
          escaped: result.newEscaped,
          endingId: result.newEndingId,
          lastHint: stage.onUnlock.showMessage ?? currentState.lastHint,
        };
      }

      if (stage.moveToStage) {
        currentState = {
          ...currentState,
          cellStageIds: { ...currentState.cellStageIds, [cellId]: stage.moveToStage },
        };
        stagesAdvanced++;
        anyAdvanced = true;
      } else {
        anyAdvanced = true;
        break;
      }
    }

    if (!anyAdvanced) {
      return { advanced: false, stagesAdvanced: 0 };
    }

    const newState: Partial<EngineState> = {
      inventory: currentState.inventory,
      flags: currentState.flags,
      escaped: currentState.escaped,
      endingId: currentState.endingId,
      lastHint: currentState.lastHint,
      cellStageIds: currentState.cellStageIds,
    };

    return { advanced: true, stagesAdvanced, newState };
  }

  function autoAdvanceAllCells(
    stateSnapshot: EngineState
  ): { advanced: boolean; newState?: Partial<EngineState> } {
    if (!config.autoAdvanceCellIds || config.autoAdvanceCellIds.length === 0) {
      return { advanced: false };
    }
    let currentState = { ...stateSnapshot };
    let anyAdvanced = false;
    for (const cellId of config.autoAdvanceCellIds) {
      const result = autoAdvanceCell(cellId, currentState);
      if (result.advanced && result.newState) {
        currentState = { ...currentState, ...result.newState };
        anyAdvanced = true;
      }
    }
    if (!anyAdvanced) {
      return { advanced: false };
    }
    return {
      advanced: true,
      newState: {
        inventory: currentState.inventory,
        flags: currentState.flags,
        escaped: currentState.escaped,
        endingId: currentState.endingId,
        lastHint: currentState.lastHint,
        cellStageIds: currentState.cellStageIds,
      },
    };
  }

  const collectItem = useCallback(
    (itemId: string, customMessage?: string) => {
      setState((prev) => {
        if (prev.inventory.includes(itemId)) return prev;
        const nextState = {
          ...prev,
          inventory: [...prev.inventory, itemId],
          lastHint: customMessage ?? prev.lastHint,
        };
        const result = autoAdvanceAllCells(nextState);
        if (result.advanced && result.newState) {
          return { ...nextState, ...result.newState };
        }
        return nextState;
      });
    },
    []
  );

  const interactCell = useCallback(
    (cellId: string) => {
      const cell = getCell(cellId);
      if (!cell) return { effects: [] };

      const currentStageId = state.cellStageIds[cellId] ?? cell.initialStageId;
      const stage = cell.stages[currentStageId];
      if (!stage) return { effects: [] };

      const effectsList: InteractionEffect[] = [];
      let openLockId: string | undefined;
      let showClue: boolean | undefined;

      if (stage.isLocked && stage.requires && !checkCond(stage.requires)) {
        if (stage.onUnlock) {
          effectsList.push(stage.onUnlock);
        }
        return { effects: effectsList, showClue: true };
      }

      let stageAdvanced = false;
      let newInventory = [...state.inventory];
      let newFlags = { ...state.flags };
      let newEscaped = state.escaped;
      let newEndingId = state.endingId;
      let newLastHint = state.lastHint;
      let newCellStageIds = { ...state.cellStageIds };

      if (stage.isLocked && stage.requires && checkCond(stage.requires)) {
        if (stage.onUnlock) {
          const result = applyEffects(stage.onUnlock, state, config);
          newInventory = result.newInventory;
          newFlags = result.newFlags;
          newEscaped = result.newEscaped;
          newEndingId = result.newEndingId;
          newLastHint = stage.onUnlock.showMessage ?? newLastHint;
          effectsList.push(stage.onUnlock);
        }
        if (stage.moveToStage) {
          newCellStageIds[cellId] = stage.moveToStage;
          stageAdvanced = true;
        }
        if (stage.lockTargetId) {
          openLockId = stage.lockTargetId;
          showClue = true;
        } else {
          showClue = true;
        }
        setState((prev) => {
          const baseState: EngineState = {
            ...prev,
            inventory: newInventory,
            flags: newFlags,
            escaped: newEscaped,
            endingId: newEndingId,
            lastHint: newLastHint,
            cellStageIds: newCellStageIds,
          };
          const advResult = autoAdvanceAllCells(baseState);
          if (advResult.advanced && advResult.newState) {
            return { ...baseState, ...advResult.newState };
          }
          return baseState;
        });
        return { effects: effectsList, openLockId, showClue };
      }

      if (stage.lockTargetId && stage.isLocked) {
        openLockId = stage.lockTargetId;
        showClue = true;
        return { effects: effectsList, openLockId, showClue };
      }

      if (!stageAdvanced && stage.onInteract) {
        const result = applyEffects(stage.onInteract, state, config);
        const message = stage.collectMessage ?? stage.onInteract.showMessage;
        newInventory = result.newInventory;
        newFlags = result.newFlags;
        newEscaped = result.newEscaped;
        newEndingId = result.newEndingId;
        newLastHint = message ?? newLastHint;
        effectsList.push({
          ...stage.onInteract,
          showMessage: message ?? stage.onInteract.showMessage,
        });
      }

      if (!stageAdvanced && stage.moveToStage) {
        newCellStageIds[cellId] = stage.moveToStage;
        stageAdvanced = true;
      }

      setState((prev) => {
        const baseState: EngineState = {
          ...prev,
          inventory: newInventory,
          flags: newFlags,
          escaped: newEscaped,
          endingId: newEndingId,
          lastHint: newLastHint,
          cellStageIds: newCellStageIds,
        };
        const advResult = autoAdvanceAllCells(baseState);
        if (advResult.advanced && advResult.newState) {
          return { ...baseState, ...advResult.newState };
        }
        return baseState;
      });

      return { effects: effectsList, showClue: true };
    },
    [getCell, state, checkCond, config]
  );

  const findMatchingRecipe = useCallback(
    (selectedIds: string[]) => {
      for (const recipe of config.combineRecipes) {
        const allInputsSelected = recipe.inputs.every((id) =>
          selectedIds.includes(id)
        );
        const noExtraSelected = selectedIds.every((id) =>
          recipe.inputs.includes(id)
        );
        const countsMatch = recipe.inputs.length === selectedIds.length;
        const notAlreadyHave = !state.inventory.includes(recipe.output);
        if (allInputsSelected && noExtraSelected && countsMatch && notAlreadyHave) {
          return recipe;
        }
      }
      return null;
    },
    [config.combineRecipes, state.inventory]
  );

  const performCombine = useCallback(
    (recipe: { inputs: string[]; output: string; consumesInputs: boolean; successMessage: string }) => {
      setState((prev) => {
        let nextInventory = [...prev.inventory];
        if (recipe.consumesInputs) {
          nextInventory = nextInventory.filter((id) => !recipe.inputs.includes(id));
        }
        if (!nextInventory.includes(recipe.output)) {
          nextInventory.push(recipe.output);
        }
        const nextState = {
          ...prev,
          inventory: nextInventory,
          combineCount: prev.combineCount + 1,
          lastHint: recipe.successMessage,
        };
        const result = autoAdvanceAllCells(nextState);
        if (result.advanced && result.newState) {
          return { ...nextState, ...result.newState };
        }
        return nextState;
      });
    },
    []
  );

  const getLock = useCallback(
    (lockId: string) => {
      for (const room of config.rooms) {
        const lock = room.locks.find((l) => l.id === lockId);
        if (lock) return lock;
      }
      return undefined;
    },
    [config]
  );

  const submitLock = useCallback(
    (lockId: string, digits: string[]) => {
      const lock = getLock(lockId);
      if (!lock) return { success: false, errorMessage: "锁不存在" };

      const entered = digits.join("");

      if (lock.beforeSubmit && !checkCond(lock.beforeSubmit)) {
        return { success: false, errorMessage: lock.beforeSubmitMessage ?? "前置条件未满足" };
      }

      if (entered === lock.password) {
        const effects: InteractionEffect = {
          giveItems: lock.onSuccess.giveItems,
          setFlags: lock.onSuccess.setFlags,
          triggerEnding: lock.onSuccess.triggerEnding,
          showMessage: lock.onSuccess.successMessage,
          messageType: "collect",
        };
        setState((prev) => {
          const result = applyEffects(effects, prev, config);
          const cellStageIds = { ...prev.cellStageIds };
          if (lock.onSuccess.setCellStage) {
            cellStageIds[lock.onSuccess.setCellStage.cellId] = lock.onSuccess.setCellStage.stageId;
          }
          const nextState: EngineState = {
            ...prev,
            inventory: result.newInventory,
            flags: result.newFlags,
            escaped: result.newEscaped,
            endingId: result.newEndingId,
            lastHint: lock.onSuccess.successMessage,
            cellStageIds,
          };
          const advResult = autoAdvanceAllCells(nextState);
          if (advResult.advanced && advResult.newState) {
            return { ...nextState, ...advResult.newState };
          }
          return nextState;
        });
        return { success: true, effects };
      }

      return { success: false, errorMessage: lock.errorHint ?? "密码错误" };
    },
    [getLock, checkCond, state, config]
  );

  const canUseKeyOnLock = useCallback(
    (lockId: string) => {
      const lock = getLock(lockId);
      if (!lock || !lock.keyUnlock) return { canUse: false, reason: undefined };
      for (const step of lock.keyUnlock.steps) {
        if (!checkCond(step.condition)) {
          return { canUse: false, reason: step.reason };
        }
      }
      return { canUse: true };
    },
    [getLock, checkCond]
  );

  const useKeyOnLock = useCallback(
    (lockId: string) => {
      const lock = getLock(lockId);
      if (!lock || !lock.keyUnlock) return;
      if (!canUseKeyOnLock(lockId).canUse) return;
      const effects = lock.keyUnlock.unlockEffects;
      const result = applyEffects(effects, state, config);
      setState((prev) => ({
        ...prev,
        inventory: result.newInventory,
        flags: result.newFlags,
        escaped: result.newEscaped,
        endingId: result.newEndingId,
        lastHint: effects.showMessage ?? prev.lastHint,
      }));
    },
    [getLock, canUseKeyOnLock, state, config]
  );

  const getProgressText = useCallback(() => {
    const fragmentCount = state.inventory.filter((id) =>
      id === "key_fragment_1" || id === "key_fragment_2" || id === "key_fragment_3"
    ).length;
    const noteCount = state.inventory.filter((id) => id.startsWith("note_") && !id.startsWith("note_hidden")).length;
    const baseLine = `已收集 ${state.inventory.length} 件道具，钥匙碎片 ${fragmentCount}/3，线索纸条 ${noteCount} 张。`;

    if (!config.progressHints || config.progressHints.length === 0) {
      return baseLine;
    }

    const matchedHints: { priority: number; text: string }[] = [];
    for (const hint of config.progressHints) {
      if (hint.condition && checkCond(hint.condition)) {
        matchedHints.push({ priority: hint.priority ?? 0, text: hint.text });
      }
    }
    matchedHints.sort((a, b) => b.priority - a.priority);
    const parts = [baseLine];
    if (matchedHints.length > 0) {
      for (const m of matchedHints) {
        parts.push(" " + m.text);
      }
    }
    return parts.join("");
  }, [state.inventory, config.progressHints, checkCond]);

  const getLockUIInfo = useCallback(
    (lockId: string): LockUIInfo => {
      const lock = getLock(lockId);
      if (!lock) {
        return {
          modalHints: [],
          keyUnlock: null,
          hiddenPassword: null,
        };
      }

      const modalHints: { conditionMet: boolean; text: string; type: "warning" | "info" | "partial" }[] = [];
      if (lock.modalHints) {
        for (const hint of lock.modalHints) {
          const conditionMet = hint.condition ? checkCond(hint.condition) : true;
          if (conditionMet) {
            modalHints.push({ conditionMet, text: hint.text, type: hint.type });
          }
        }
      }

      let keyUnlockResult: {
        canUse: boolean;
        reason?: string;
        sidebarLabel?: string;
        buttonText: string;
        keyItemId: string;
        requiredNoteId?: string;
      } | null = null;
      if (lock.keyUnlock) {
        let canUse = true;
        let reason: string | undefined;
        let sidebarLabel: string | undefined;
        for (const step of lock.keyUnlock.steps) {
          if (!checkCond(step.condition)) {
            canUse = false;
            reason = step.reason;
            sidebarLabel = step.sidebarLabel;
            break;
          }
        }
        keyUnlockResult = {
          canUse,
          reason,
          sidebarLabel: canUse ? lock.keyUnlock.defaultButtonText : (sidebarLabel ?? reason),
          buttonText: lock.keyUnlock.buttonText,
          keyItemId: lock.keyUnlock.keyItemId,
          requiredNoteId: lock.keyUnlock.requiredNoteId,
        };
      }

      let hiddenPasswordResult: {
        canShow: boolean;
        lockId: string;
        buttonText: string;
        digits: number;
        password: string;
        onSuccess: LockResult;
        showPartialHint: boolean;
        partialHintText?: string;
      } | null = null;
      const hiddenLock = lock.hiddenPassword ? getLock(lock.hiddenPassword.lockId) : undefined;
      if (lock.hiddenPassword && hiddenLock) {
        const hiddenClueIds = lock.hiddenPassword.hiddenClueItemIds ?? [];
        const hiddenClueCount = hiddenClueIds.filter((id) => state.inventory.includes(id)).length;
        const hiddenClueTotal = hiddenClueIds.length;
        const canShow = checkCond(lock.hiddenPassword.showCondition);

        let showPartialHint = false;
        let partialHintText: string | undefined;
        if (lock.hiddenPassword.partialHintCondition && checkCond(lock.hiddenPassword.partialHintCondition)) {
          showPartialHint = true;
          partialHintText = lock.hiddenPassword.partialHintText
            ?.replace("{found}", String(hiddenClueCount))
            .replace("{total}", String(hiddenClueTotal));
        }
        hiddenPasswordResult = {
          canShow,
          lockId: lock.hiddenPassword.lockId,
          buttonText: lock.hiddenPassword.buttonText,
          digits: hiddenLock.digits,
          password: hiddenLock.password,
          onSuccess: hiddenLock.onSuccess,
          showPartialHint,
          partialHintText,
        };
      }

      return {
        modalHints,
        keyUnlock: keyUnlockResult,
        hiddenPassword: hiddenPasswordResult,
      };
    },
    [getLock, checkCond, state.flags, state.inventory]
  );

  const submitHiddenPassword = useCallback(
    (lockId: string, digits: string[]) => {
      return submitLock(lockId, digits);
    },
    [submitLock]
  );

  const toggleFlashlight = useCallback(() => {
    setState((prev) => {
      const nextFlashlightActive = !prev.flashlightActive;
      const nextState: EngineState = {
        ...prev,
        flashlightActive: nextFlashlightActive,
        flags: { ...prev.flags, flashlightActive: nextFlashlightActive },
        lastHint: nextFlashlightActive ? "🔦 手电筒已打开，暗处的线索将显现！" : "手电筒已关闭",
      };

      const result = autoAdvanceAllCells(nextState);
      if (result.advanced && result.newState) {
        return { ...nextState, ...result.newState };
      }
      return nextState;
    });
  }, []);

  const markInvestigated = useCallback((cellId: string) => {
    setState((prev) => {
      if (prev.investigatedCellIds.has(cellId)) return prev;
      const next = new Set(prev.investigatedCellIds);
      next.add(cellId);
      return { ...prev, investigatedCellIds: next };
    });
  }, []);

  const revealHint = useCallback(
    (puzzleId: string) => {
      const puzzle = config.hintPuzzles.find((p) => p.id === puzzleId);
      if (!puzzle) return null;
      const currentLevel = state.hintUsage[puzzleId] || 0;
      if (currentLevel >= 3) return null;
      setState((prev) => ({
        ...prev,
        hintUsage: { ...prev.hintUsage, [puzzleId]: currentLevel + 1 },
        lastHint: `💡 已查看「${puzzle.title}」第 ${currentLevel + 1} 层提示`,
      }));
      return { level: currentLevel + 1, title: puzzle.title };
    },
    [config.hintPuzzles, state.hintUsage]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  const getState = useCallback(() => state, [state]);

  const getSaveData = useCallback((): SaveData => {
    return {
      version: config.saveVersion,
      savedAt: Date.now(),
      inventory: [...state.inventory],
      investigatedCellIds: Array.from(state.investigatedCellIds),
      cellStageIds: { ...state.cellStageIds },
      flags: { ...state.flags },
      flashlightActive: state.flashlightActive,
      escaped: state.escaped,
      endingId: state.endingId,
      lastHint: state.lastHint,
      gameStartTime: state.gameStartTime,
      combineCount: state.combineCount,
      hintUsage: { ...state.hintUsage },
      currentRoomId: state.currentRoomId,
    };
  }, [config.saveVersion, state]);

  const loadSaveData = useCallback(
    (data: SaveData): boolean => {
      if (data.version !== config.saveVersion) return false;
      setState({
        inventory: data.inventory || [],
        investigatedCellIds: new Set(data.investigatedCellIds || []),
        cellStageIds: data.cellStageIds || { ...initialState.cellStageIds },
        flags: data.flags || {},
        flashlightActive: !!data.flashlightActive,
        escaped: !!data.escaped,
        endingId: data.endingId || null,
        lastHint: data.lastHint || "",
        gameStartTime: data.gameStartTime || 0,
        combineCount: data.combineCount || 0,
        hintUsage: data.hintUsage || {},
        currentRoomId: data.currentRoomId || config.rooms[0]?.id || "",
      });
      return true;
    },
    [config.saveVersion, initialState.cellStageIds, config.rooms]
  );

  const autoAdvanceCellPublic = useCallback(
    (cellId: string): boolean => {
      const result = autoAdvanceCell(cellId, state);
      if (result.advanced && result.newState) {
        setState((prev) => ({ ...prev, ...result.newState! }));
      }
      return result.advanced;
    },
    [state]
  );

  const switchRoom = useCallback(
    (roomId: string) => {
      const roomExists = config.rooms.some((r) => r.id === roomId);
      if (!roomExists) return;
      if (roomId !== config.rooms[0]?.id && !state.flags.secretDoorOpened) return;
      setState((prev) => ({
        ...prev,
        currentRoomId: roomId,
      }));
    },
    [config.rooms, state.flags.secretDoorOpened]
  );

  const setGameStartTime = useCallback((time: number) => {
    setState((prev) => {
      if (prev.gameStartTime !== 0) return prev;
      return { ...prev, gameStartTime: time };
    });
  }, []);

  return {
    ...state,
    hasItem,
    checkCondition: checkCond,
    getCell,
    getCellStage,
    getCellContent,
    collectItem,
    interactCell,
    findMatchingRecipe,
    performCombine,
    submitLock,
    canUseKeyOnLock,
    useKeyOnLock,
    toggleFlashlight,
    markInvestigated,
    autoAdvanceCell: autoAdvanceCellPublic,
    revealHint,
    reset,
    getState,
    getSaveData,
    loadSaveData,
    getProgressText,
    getLockUIInfo,
    submitHiddenPassword,
    switchRoom,
    setGameStartTime,
  };
}

function describeRequirement(cond: Condition, inventory: string[]): string {
  if (cond.type === "hasItem" && cond.itemId) {
    if (cond.itemId === "screwdriver") return "需要螺丝刀";
    if (cond.itemId === "powered_flashlight") {
      if (inventory.includes("flashlight") && !inventory.includes("powered_flashlight")) {
        return "手电筒没电池，亮不起来。需要找到电池后组合使用。";
      }
      return "太暗了看不清，需要找到能发光的工具。";
    }
    return `需要道具`;
  }
  if (cond.type === "all" && cond.conditions) {
    return cond.conditions.map((c) => describeRequirement(c, inventory)).join("、");
  }
  return "";
}
