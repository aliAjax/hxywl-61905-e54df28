import { useState, useCallback, useMemo } from "react";
import type {
  PuzzleEngine,
  GameConfig,
  HintPuzzleDef,
  RecommendedPuzzle,
  RoomDef,
  CellDef,
} from "../puzzle-engine/types";
import { checkCondition } from "../puzzle-engine";

export interface UseClueAndHintsProps {
  engine: PuzzleEngine;
  config: GameConfig;
  showMsg: (text: string, type?: "info" | "collect" | "empty" | "error") => void;
}

export interface RoomProgressResult {
  checked: number;
  total: number;
  remaining: number;
  uncheckedCells: { id: string; label: string; icon: string; isLocked: boolean; lockReason?: string }[];
  checkedCells: { id: string; label: string; icon: string }[];
}

export function useClueAndHints({ engine, config, showMsg }: UseClueAndHintsProps) {
  const [clueModalCellId, setClueModalCellId] = useState<string | null>(null);

  const [hintPanelOpen, setHintPanelOpen] = useState(false);
  const [hintDetailId, setHintDetailId] = useState<string | null>(null);
  const [hintMode, setHintMode] = useState<"browse" | "recommend">("browse");

  const [clueBookOpen, setClueBookOpen] = useState(false);
  const [clueBookDetailItemId, setClueBookDetailItemId] = useState<string | null>(null);

  const [roomProgressModalRoomId, setRoomProgressModalRoomId] = useState<string | null>(null);

  const totalClueCount = useMemo(
    () => config.clueBook.reduce((sum, g) => sum + g.entries.length, 0),
    [config.clueBook]
  );

  const foundClueCount = useMemo(
    () =>
      config.clueBook.reduce(
        (sum, g) =>
          sum +
          g.entries.filter((e) => e.revealCondition && checkCondition(e.revealCondition, { inventory: engine.inventory, flags: engine.flags })).length,
        0
      ),
    [config.clueBook, engine.inventory, engine.flags]
  );

  const isClueRevealed = useCallback(
    (entry: any) => {
      if (!entry.revealCondition) return true;
      return checkCondition(entry.revealCondition, {
        inventory: engine.inventory,
        flags: engine.flags,
      });
    },
    [engine.inventory, engine.flags]
  );

  const buildHintContext = useCallback(
    () => ({
      inventory: engine.inventory,
      flags: engine.flags,
    }),
    [engine.inventory, engine.flags]
  );

  const handleRevealHint = useCallback(
    (puzzleId: string) => {
      const result = engine.revealHint(puzzleId);
      if (result) {
        showMsg(`💡 已查看「${result.title}」第 ${result.level} 层提示`, "info");
      }
    },
    [engine, showMsg]
  );

  const resetClues = useCallback(() => {
    setClueModalCellId(null);
  }, []);

  const resetHints = useCallback(() => {
    setHintPanelOpen(false);
    setHintDetailId(null);
    setHintMode("browse");
  }, []);

  const resetClueBook = useCallback(() => {
    setClueBookOpen(false);
    setClueBookDetailItemId(null);
  }, []);

  const resetRoomProgress = useCallback(() => {
    setRoomProgressModalRoomId(null);
  }, []);

  const openClueModal = useCallback((cellId: string) => {
    setClueModalCellId(cellId);
  }, []);

  const closeClueModal = useCallback(() => {
    setClueModalCellId(null);
  }, []);

  const openClueBook = useCallback(() => {
    setClueBookOpen(true);
  }, []);

  const closeClueBook = useCallback(() => {
    setClueBookOpen(false);
    setClueBookDetailItemId(null);
  }, []);

  const openClueBookItem = useCallback((itemId: string) => {
    setClueBookDetailItemId(itemId);
  }, []);

  const closeClueBookItem = useCallback(() => {
    setClueBookDetailItemId(null);
  }, []);

  const openHintPanel = useCallback(() => {
    setHintPanelOpen(true);
  }, []);

  const closeHintPanel = useCallback(() => {
    setHintPanelOpen(false);
    setHintDetailId(null);
  }, []);

  const openHintDetail = useCallback((puzzleId: string) => {
    setHintDetailId(puzzleId);
  }, []);

  const closeHintDetail = useCallback(() => {
    setHintDetailId(null);
  }, []);

  const setHintBrowseMode = useCallback(() => {
    setHintMode("browse");
  }, []);

  const setHintRecommendMode = useCallback(() => {
    setHintMode("recommend");
  }, []);

  const openRoomProgress = useCallback((roomId: string) => {
    setRoomProgressModalRoomId(roomId);
  }, []);

  const closeRoomProgress = useCallback(() => {
    setRoomProgressModalRoomId(null);
  }, []);

  const getRoomProgress = useCallback(
    (room: RoomDef): RoomProgressResult => {
      const total = room.cells.length;
      const uncheckedCells: { id: string; label: string; icon: string; isLocked: boolean; lockReason?: string }[] = [];
      const checkedCells: { id: string; label: string; icon: string }[] = [];
      for (const c of room.cells) {
        const content = engine.getCellContent(c.id);
        if (content.alreadyChecked) {
          checkedCells.push({ id: c.id, label: c.label, icon: c.icon });
        } else {
          uncheckedCells.push({
            id: c.id,
            label: c.label,
            icon: c.icon,
            isLocked: !!content.isLocked,
            lockReason: content.lockReason,
          });
        }
      }
      return {
        checked: checkedCells.length,
        total,
        remaining: uncheckedCells.length,
        uncheckedCells,
        checkedCells,
      };
    },
    [engine]
  );

  const availablePuzzles = useMemo(() => {
    const ctx = buildHintContext();
    return config.hintPuzzles.filter((p) => {
      const avail = checkCondition(p.availableCondition, ctx);
      const done = checkCondition(p.completedCondition, ctx);
      return avail && !done;
    });
  }, [buildHintContext, config.hintPuzzles]);

  const recommendedPuzzles: RecommendedPuzzle[] = engine.getRecommendedPuzzles();

  const selectedHintPuzzle: HintPuzzleDef | undefined = hintDetailId
    ? config.hintPuzzles.find((p) => p.id === hintDetailId)
    : undefined;

  const handleJumpToCell = useCallback(
    (rec: RecommendedPuzzle) => {
      if (!rec.puzzle.relatedCellId) return;
      const cellId = rec.puzzle.relatedCellId;
      if (rec.puzzle.relatedRoomId && rec.puzzle.relatedRoomId !== engine.currentRoomId) {
        engine.switchRoom(rec.puzzle.relatedRoomId);
      }
      setTimeout(() => {
        setHintPanelOpen(false);
        setClueModalCellId(cellId);
      }, 50);
    },
    [engine]
  );

  const clueModalCell = useMemo(() => {
    if (!clueModalCellId) return null;
    return config.rooms.flatMap((r) => r.cells).find((c) => c.id === clueModalCellId) || null;
  }, [clueModalCellId, config.rooms]);

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return "⚡ 立即行动";
      case "soon":
        return "⏳ 即将到来";
      default:
        return "🔍 探索中";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "immediate":
        return "linear-gradient(135deg, #ef4444, #f97316)";
      case "soon":
        return "linear-gradient(135deg, #f59e0b, #eab308)";
      default:
        return "linear-gradient(135deg, #3b82f6, #6366f1)";
    }
  };

  return {
    clueModalCellId,
    clueModalCell,
    openClueModal,
    closeClueModal,
    resetClues,
    hintPanelOpen,
    hintDetailId,
    hintMode,
    selectedHintPuzzle,
    availablePuzzles,
    recommendedPuzzles,
    openHintPanel,
    closeHintPanel,
    openHintDetail,
    closeHintDetail,
    setHintBrowseMode,
    setHintRecommendMode,
    handleRevealHint,
    handleJumpToCell,
    resetHints,
    getUrgencyLabel,
    getUrgencyColor,
    clueBookOpen,
    clueBookDetailItemId,
    totalClueCount,
    foundClueCount,
    isClueRevealed,
    openClueBook,
    closeClueBook,
    openClueBookItem,
    closeClueBookItem,
    resetClueBook,
    roomProgressModalRoomId,
    getRoomProgress,
    openRoomProgress,
    closeRoomProgress,
    resetRoomProgress,
  };
}
