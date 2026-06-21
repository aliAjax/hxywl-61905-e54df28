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

  const collectItem = useCallback(
    (itemId: string, customMessage?: string) => {
      setState((prev) => {
        if (prev.inventory.includes(itemId)) return prev;
        return {
          ...prev,
          inventory: [...prev.inventory, itemId],
          lastHint: customMessage ?? prev.lastHint,
        };
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

      if (stage.isLocked && stage.requires && !checkCond(stage.requires)) {
        if (stage.onUnlock) {
          effectsList.push(stage.onUnlock);
        }
        if (stage.lockTargetId) {
          return { effects: effectsList, openLockId: stage.lockTargetId, showClue: true };
        }
        return { effects: effectsList, showClue: true };
      }

      let stageAdvanced = false;
      if (stage.isLocked && stage.requires && checkCond(stage.requires)) {
        if (stage.onUnlock) {
          const result = applyEffects(stage.onUnlock, state, config);
          setState((prev) => ({
            ...prev,
            inventory: result.newInventory,
            flags: result.newFlags,
            escaped: result.newEscaped,
            endingId: result.newEndingId,
            lastHint: stage.onUnlock?.showMessage ?? prev.lastHint,
          }));
          effectsList.push(stage.onUnlock);
        }
        if (stage.moveToStage) {
          setState((prev) => ({
            ...prev,
            cellStageIds: { ...prev.cellStageIds, [cellId]: stage.moveToStage! },
          }));
          stageAdvanced = true;
        }
        if (stage.lockTargetId) {
          return { effects: effectsList, openLockId: stage.lockTargetId, showClue: true };
        }
        return { effects: effectsList, showClue: true };
      }

      if (stage.lockTargetId && stage.isLocked) {
        return { effects: effectsList, openLockId: stage.lockTargetId, showClue: true };
      }

      if (!stageAdvanced && stage.onInteract) {
        const result = applyEffects(stage.onInteract, state, config);
        const message = stage.collectMessage ?? stage.onInteract.showMessage;
        setState((prev) => ({
          ...prev,
          inventory: result.newInventory,
          flags: result.newFlags,
          escaped: result.newEscaped,
          endingId: result.newEndingId,
          lastHint: message ?? prev.lastHint,
        }));
        effectsList.push({
          ...stage.onInteract,
          showMessage: message ?? stage.onInteract.showMessage,
        });
      }

      if (!stageAdvanced && stage.moveToStage) {
        setState((prev) => ({
          ...prev,
          cellStageIds: { ...prev.cellStageIds, [cellId]: stage.moveToStage! },
        }));
      }

      return { effects: effectsList, showClue: true };
    },
    [getCell, state.cellStageIds, checkCond, state, config]
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
        return {
          ...prev,
          inventory: nextInventory,
          combineCount: prev.combineCount + 1,
          lastHint: recipe.successMessage,
        };
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
        const result = applyEffects(effects, state, config);
        const cellStageIds = { ...state.cellStageIds };
        if (lock.onSuccess.setCellStage) {
          cellStageIds[lock.onSuccess.setCellStage.cellId] = lock.onSuccess.setCellStage.stageId;
        }
        setState((prev) => ({
          ...prev,
          inventory: result.newInventory,
          flags: result.newFlags,
          escaped: result.newEscaped,
          endingId: result.newEndingId,
          lastHint: lock.onSuccess.successMessage,
          cellStageIds: lock.onSuccess.setCellStage ? cellStageIds : prev.cellStageIds,
        }));
        return { success: true, effects };
      }

      return { success: false, errorMessage: lock.errorHint ?? "密码错误" };
    },
    [getLock, checkCond, state, config]
  );

  const canUseKeyOnLock = useCallback(
    (lockId: string) => {
      if (lockId !== "door") return { canUse: false, reason: undefined };
      const steps: { cond: Condition; reason: string }[] = [
        { cond: { type: "flagTrue", flagId: "drawerUnlocked" }, reason: "需要先打开抽屉" },
        { cond: { type: "flagTrue", flagId: "boxOpened" }, reason: "需要先撬开箱子" },
        { cond: { type: "flagTrue", flagId: "paintingRemoved" }, reason: "需要先取下挂画" },
        { cond: { type: "hasItem", itemId: "complete_key" }, reason: "需要先集齐3片碎片并组合成完整钥匙" },
        { cond: { type: "flagTrue", flagId: "curtainChecked" }, reason: "需要先查看窗帘" },
        { cond: { type: "hasItem", itemId: "note_curtain" }, reason: "需要获得钥匙使用说明纸条" },
      ];
      for (const step of steps) {
        if (!checkCond(step.cond)) {
          return { canUse: false, reason: step.reason };
        }
      }
      return { canUse: true };
    },
    [checkCond]
  );

  const useKeyOnLock = useCallback(
    (lockId: string, _keyItemId: string, _requiredItemId: string) => {
      if (lockId !== "door") return;
      const effects: InteractionEffect = {
        triggerEnding: "normal_key",
        showMessage: "🔑 你按照窗帘背面刻下的指示，小心翼翼地转动钥匙……",
        messageType: "collect",
      };
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
    [state, config]
  );

  const toggleFlashlight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      flashlightActive: !prev.flashlightActive,
      flags: { ...prev.flags, flashlightActive: !prev.flashlightActive },
      lastHint: !prev.flashlightActive ? "🔦 手电筒已打开，暗处的线索将显现！" : "手电筒已关闭",
    }));
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
      });
      return true;
    },
    [config.saveVersion, initialState.cellStageIds]
  );

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
    revealHint,
    reset,
    getState,
    getSaveData,
    loadSaveData,
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
