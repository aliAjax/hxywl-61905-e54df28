import { useState, useCallback } from "react";
import type { PuzzleEngine, GameConfig, SaveData, SaveSlotMeta } from "../puzzle-engine/types";

export interface UseSaveSlotsProps {
  engine: PuzzleEngine;
  config: GameConfig;
  showMsg: (text: string, type?: "info" | "collect" | "empty" | "error") => void;
  onResetAllState: () => void;
  onStartGame: () => void;
  onExitToMenu: () => void;
}

function getSlotKey(slotIndex: number): string {
  return "slot_" + slotIndex;
}

function loadAllSlots(slotsKey: string): Record<string, SaveData> {
  try {
    const raw = localStorage.getItem(slotsKey);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SaveData>;
  } catch {
    return {};
  }
}

function writeAllSlots(slotsKey: string, slots: Record<string, SaveData>) {
  localStorage.setItem(slotsKey, JSON.stringify(slots));
}

function getSlotMeta(
  slotIndex: number,
  slots: Record<string, SaveData>,
  config: GameConfig
): SaveSlotMeta {
  const key = getSlotKey(slotIndex);
  const data = slots[key];
  if (!data || data.version !== config.saveVersion) {
    return {
      slotIndex,
      roomId: "",
      roomName: "",
      elapsedMs: 0,
      clueCount: 0,
      escaped: false,
      endingId: null,
      savedAt: 0,
      hasData: false,
    };
  }
  const hasData =
    data.inventory.length > 0 ||
    (data.investigatedCellIds?.length ?? 0) > 0 ||
    Object.keys(data.flags ?? {}).length > 0 ||
    data.escaped ||
    data.flashlightActive;
  const room = config.rooms.find((r) => r.id === data.currentRoomId);
  const noteIds = data.inventory.filter((id) => config.items[id]?.category === "note");
  return {
    slotIndex,
    roomId: data.currentRoomId,
    roomName: room?.name ?? "",
    elapsedMs:
      data.finalElapsedTime > 0
        ? data.finalElapsedTime
        : data.savedAt - data.gameStartTime,
    clueCount: noteIds.length,
    escaped: !!data.escaped,
    endingId: data.endingId,
    savedAt: data.savedAt,
    hasData,
  };
}

export interface UseSaveSlotsResetHelpers {
  resetLocks: () => void;
  resetCombine: () => void;
  resetClues: () => void;
  resetHints: () => void;
  resetItems: () => void;
  resetRoomProgress: () => void;
}

export function useSaveSlots(props: UseSaveSlotsProps & UseSaveSlotsResetHelpers) {
  const {
    engine,
    config,
    showMsg,
    onResetAllState,
    onStartGame,
    onExitToMenu,
    resetLocks,
    resetCombine,
    resetClues,
    resetHints,
    resetItems,
    resetRoomProgress,
  } = props;

  const SAVE_SLOTS_KEY = config.saveKey + "_slots";

  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [saveSlotPanelOpen, setSaveSlotPanelOpen] = useState(false);

  const getAllSlotMetas = useCallback((): SaveSlotMeta[] => {
    const slots = loadAllSlots(SAVE_SLOTS_KEY);
    return [0, 1, 2].map((i) => getSlotMeta(i, slots, config));
  }, [SAVE_SLOTS_KEY, config]);

  const saveGameToSlot = useCallback(
    (slotIndex: number) => {
      try {
        const slots = loadAllSlots(SAVE_SLOTS_KEY);
        const saveData = engine.getSaveData();
        slots[getSlotKey(slotIndex)] = saveData;
        writeAllSlots(SAVE_SLOTS_KEY, slots);
      } catch (e) {
        console.error("保存游戏失败:", e);
      }
    },
    [SAVE_SLOTS_KEY, engine]
  );

  const loadGameFromSlot = useCallback(
    (slotIndex: number): boolean => {
      try {
        const slots = loadAllSlots(SAVE_SLOTS_KEY);
        const data = slots[getSlotKey(slotIndex)];
        if (!data) return false;
        const ok = engine.loadSaveData(data);
        if (ok && data.gameStartTime === 0) {
          data.gameStartTime = Date.now();
        }
        return ok;
      } catch (e) {
        console.error("读取存档失败:", e);
        return false;
      }
    },
    [SAVE_SLOTS_KEY, engine]
  );

  const clearSlot = useCallback(
    (slotIndex: number) => {
      try {
        const slots = loadAllSlots(SAVE_SLOTS_KEY);
        delete slots[getSlotKey(slotIndex)];
        writeAllSlots(SAVE_SLOTS_KEY, slots);
      } catch (e) {
        console.error("清除存档失败:", e);
      }
    },
    [SAVE_SLOTS_KEY]
  );

  const resetUIForLoad = useCallback(() => {
    resetLocks();
    resetCombine();
    resetClues();
    resetHints();
    resetItems();
    resetRoomProgress();
  }, [resetLocks, resetCombine, resetClues, resetHints, resetItems, resetRoomProgress]);

  const handleQuickSave = useCallback(() => {
    if (currentSlot === null) {
      showMsg("⚠️ 当前没有活动存档位，请先在存档管理中选择一个槽位", "error");
      setSaveSlotPanelOpen(true);
      return;
    }
    saveGameToSlot(currentSlot);
    showMsg(`💾 已快速保存到存档 ${currentSlot + 1}`, "info");
  }, [currentSlot, saveGameToSlot, showMsg]);

  const handleLoadSlotInGame = useCallback(
    (slotIndex: number) => {
      if (
        !confirm(
          `确定要读取存档 ${slotIndex + 1} 吗？当前未保存的进度将丢失。`
        )
      ) {
        return;
      }
      if (loadGameFromSlot(slotIndex)) {
        setCurrentSlot(slotIndex);
        setSaveSlotPanelOpen(false);
        resetUIForLoad();
        setTimeout(() => showMsg(`📂 已读取存档 ${slotIndex + 1}`, "info"), 0);
      } else {
        showMsg("⚠️ 读取存档失败", "error");
      }
    },
    [loadGameFromSlot, resetUIForLoad, showMsg]
  );

  const handleNewGame = useCallback(
    (slotIndex: number) => {
      clearSlot(slotIndex);
      onResetAllState();
      const now = Date.now();
      engine.setGameStartTime(now);
      setCurrentSlot(slotIndex);
      onStartGame();
    },
    [clearSlot, onResetAllState, engine, onStartGame]
  );

  const handleContinue = useCallback(
    (slotIndex: number) => {
      const now = Date.now();
      if (loadGameFromSlot(slotIndex)) {
        if (engine.gameStartTime === 0) {
          engine.setGameStartTime(now);
        }
        setCurrentSlot(slotIndex);
        onStartGame();
        setTimeout(() => showMsg("📂 已加载存档，继续你的逃脱之旅！", "info"), 0);
      } else {
        handleNewGame(slotIndex);
      }
    },
    [loadGameFromSlot, engine, showMsg, handleNewGame, onStartGame]
  );

  const handleRestart = useCallback(() => {
    if (confirm("确定要重新开始吗？当前进度将被清除且无法恢复。")) {
      if (currentSlot !== null) {
        clearSlot(currentSlot);
      }
      onResetAllState();
      engine.setGameStartTime(Date.now());
      showMsg("🔄 游戏已重置，开始新的冒险！", "info");
    }
  }, [currentSlot, clearSlot, onResetAllState, engine, showMsg]);

  const handleSaveAndExit = useCallback(() => {
    onExitToMenu();
  }, [onExitToMenu]);

  return {
    currentSlot,
    setCurrentSlot,
    saveSlotPanelOpen,
    setSaveSlotPanelOpen,
    getAllSlotMetas,
    saveGameToSlot,
    loadGameFromSlot,
    clearSlot,
    handleQuickSave,
    handleLoadSlotInGame,
    handleNewGame,
    handleContinue,
    handleRestart,
    handleSaveAndExit,
  };
}
