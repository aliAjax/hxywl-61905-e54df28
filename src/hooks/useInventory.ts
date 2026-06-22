import { useState, useCallback, useMemo } from "react";
import type { PuzzleEngine, GameConfig, ItemCategory, ItemDef } from "../puzzle-engine/types";

export type FilterTab = "all" | ItemCategory;

export interface UseInventoryProps {
  engine: PuzzleEngine;
  config: GameConfig;
  showMsg: (text: string, type?: "info" | "collect" | "empty" | "error") => void;
  triggerCollectAnimation: (itemId: string) => void;
}

export function useInventory({ engine, config, showMsg, triggerCollectAnimation }: UseInventoryProps) {
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const [combineMode, setCombineMode] = useState(false);
  const [selectedForCombine, setSelectedForCombine] = useState<string[]>([]);

  const filteredInventory = useMemo(
    () =>
      filterTab === "all"
        ? engine.inventory
        : engine.inventory.filter((id) => config.items[id]?.category === filterTab),
    [filterTab, engine.inventory, config.items]
  );

  const detailItem: ItemDef | null = detailItemId ? config.items[detailItemId] : null;

  const canCombine = engine.findMatchingRecipe(selectedForCombine) !== null;

  const combinableItemIds = useMemo(() => {
    if (!combineMode) return new Set<string>();
    return engine.getCombinableItems();
  }, [combineMode, engine]);

  const combineCandidateIds = useMemo(() => {
    if (!combineMode) return new Set<string>();
    return engine.getCombineCandidates(selectedForCombine);
  }, [combineMode, selectedForCombine, engine]);

  const toggleCombineSelect = useCallback(
    (itemId: string) => {
      if (selectedForCombine.includes(itemId)) {
        setSelectedForCombine((prev) => prev.filter((id) => id !== itemId));
      } else if (selectedForCombine.length < 3) {
        setSelectedForCombine((prev) => [...prev, itemId]);
      }
    },
    [selectedForCombine]
  );

  const handleCombine = useCallback(() => {
    const recipe = engine.findMatchingRecipe(selectedForCombine);
    if (!recipe) {
      const msg = engine.getCombineFailureMessage(selectedForCombine);
      showMsg(msg, "error");
      return;
    }
    engine.performCombine(recipe);
    triggerCollectAnimation(recipe.output);
    showMsg(recipe.successMessage, "collect");
    setSelectedForCombine([]);
    setCombineMode(false);
  }, [engine, selectedForCombine, showMsg, triggerCollectAnimation]);

  const toggleCombineMode = useCallback(() => {
    setCombineMode((prev) => !prev);
    setSelectedForCombine([]);
  }, []);

  const resetCombine = useCallback(() => {
    setCombineMode(false);
    setSelectedForCombine([]);
  }, []);

  const handleItemClick = useCallback(
    (itemId: string) => {
      if (combineMode) {
        toggleCombineSelect(itemId);
        return;
      }
      if (itemId === "powered_flashlight") {
        engine.toggleFlashlight();
        if (!engine.flashlightActive) {
          showMsg("🔦 手电筒已打开，暗处的线索将显现！", "collect");
        } else {
          showMsg("手电筒已关闭", "info");
        }
      }
      setDetailItemId(itemId);
    },
    [combineMode, toggleCombineSelect, engine, showMsg]
  );

  const handleFlashlightToggleFromModal = useCallback(() => {
    engine.toggleFlashlight();
    if (!engine.flashlightActive) {
      showMsg("🔦 手电筒已打开，暗处的线索将显现！", "collect");
    } else {
      showMsg("手电筒已关闭", "info");
    }
  }, [engine, showMsg]);

  const closeDetailItem = useCallback(() => {
    setDetailItemId(null);
  }, []);

  const resetDetailItem = useCallback(() => {
    setDetailItemId(null);
  }, []);

  return {
    detailItemId,
    detailItem,
    setDetailItemId,
    closeDetailItem,
    resetDetailItem,
    filterTab,
    setFilterTab,
    combineMode,
    selectedForCombine,
    canCombine,
    combinableItemIds,
    combineCandidateIds,
    filteredInventory,
    toggleCombineSelect,
    handleCombine,
    toggleCombineMode,
    resetCombine,
    handleItemClick,
    handleFlashlightToggleFromModal,
  };
}
