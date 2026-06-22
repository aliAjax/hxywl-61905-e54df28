import { useCallback, useMemo } from "react";
import type {
  PuzzleEngine,
  GameConfig,
  RoomDef,
  CellDef,
  InteractionEffect,
} from "../puzzle-engine/types";

export interface UseRoomBoardProps {
  engine: PuzzleEngine;
  config: GameConfig;
  hasPoweredFlashlight: boolean;
  applyEffects: (effects: InteractionEffect[]) => void;
  showMsg: (text: string, type?: "info" | "collect" | "empty" | "error") => void;
  openLock: (lockId: string) => void;
  openClueModal: (cellId: string) => void;
}

export interface CellStatus {
  isLocked: boolean;
  alreadyChecked: boolean;
  isLit: boolean;
}

export function useRoomBoard({
  engine,
  config,
  hasPoweredFlashlight,
  applyEffects,
  showMsg,
  openLock,
  openClueModal,
}: UseRoomBoardProps) {
  const currentRoom: RoomDef =
    config.rooms.find((r) => r.id === engine.currentRoomId) ?? config.rooms[0];
  const CELLS = currentRoom.cells;
  const LOCKS = currentRoom.locks;

  const drawerUnlocked = !!engine.flags.drawerUnlocked;
  const boxOpened = !!engine.flags.boxOpened;
  const paintingRemoved = !!engine.flags.paintingRemoved;
  const curtainChecked = !!engine.flags.curtainChecked;
  const secretDoorOpened = !!engine.flags.secretDoorOpened;

  const getSecretDoorUnlockReason = useCallback((): string[] | null => {
    const reasons: string[] = [];
    if (!drawerUnlocked) reasons.push("打开抽屉");
    if (!paintingRemoved) reasons.push("取下挂画");
    if (!boxOpened) reasons.push("撬开铁皮箱");
    if (reasons.length === 0 && !secretDoorOpened) {
      reasons.push("调查书房暗门");
    }
    if (reasons.length === 0) return null;
    return reasons;
  }, [drawerUnlocked, paintingRemoved, boxOpened, secretDoorOpened]);

  const getEnrichedCellContent = useCallback(
    (cellId: string) => {
      return engine.getCellContent(cellId);
    },
    [engine]
  );

  const getCellStatus = useCallback(
    (cellId: string): CellStatus => {
      const content = getEnrichedCellContent(cellId);
      const isLit =
        (cellId === "carpet" || cellId === "dark_corner") &&
        engine.flashlightActive &&
        hasPoweredFlashlight &&
        !engine.hasItem(cellId === "carpet" ? "note_carpet" : "note_dark");
      return {
        isLocked: content.isLocked ?? false,
        alreadyChecked: content.alreadyChecked ?? false,
        isLit,
      };
    },
    [getEnrichedCellContent, engine, hasPoweredFlashlight]
  );

  const handleCellClick = useCallback(
    (cellId: string) => {
      if (engine.escaped) return;
      const cell = CELLS.find((c) => c.id === cellId);
      if (!cell) return;
      const content = getEnrichedCellContent(cellId);

      if (!engine.investigatedCellIds.has(cellId)) {
        engine.markInvestigated(cellId);
      }

      if (content.lockTargetId) {
        openLock(content.lockTargetId);
        if (cellId === "drawer" || cellId === "filing_cabinet") {
          openClueModal(cellId);
        }
        return;
      }

      if (content.isLocked && !content.lockTargetId) {
        showMsg(
          content.lockReason ||
            "暂时无法操作，也许需要某个道具或先完成其他步骤。",
          "error"
        );
        openClueModal(cellId);
        return;
      }

      const result = engine.interactCell(cellId);
      applyEffects(result.effects);
      if (result.openLockId) {
        openLock(result.openLockId);
      }
      if (result.showClue) {
        openClueModal(cellId);
      }
    },
    [
      engine,
      getEnrichedCellContent,
      applyEffects,
      showMsg,
      CELLS,
      openLock,
      openClueModal,
    ]
  );

  const handleSwitchRoom = useCallback(
    (roomId: string) => {
      engine.switchRoom(roomId);
    },
    [engine]
  );

  const secretDoorReasons = getSecretDoorUnlockReason();

  const isRoomLocked = useCallback(
    (room: RoomDef): boolean => {
      return room.id !== config.rooms[0]?.id && !secretDoorOpened;
    },
    [config.rooms, secretDoorOpened]
  );

  const jumpToCell = useCallback(
    (roomId: string, cellId: string) => {
      if (roomId && roomId !== engine.currentRoomId) {
        engine.switchRoom(roomId);
      }
      setTimeout(() => {
        openClueModal(cellId);
      }, 50);
    },
    [engine, openClueModal]
  );

  return {
    currentRoom,
    CELLS,
    LOCKS,
    secretDoorOpened,
    secretDoorReasons,
    drawerUnlocked,
    boxOpened,
    paintingRemoved,
    curtainChecked,
    getCellStatus,
    getEnrichedCellContent,
    handleCellClick,
    handleSwitchRoom,
    isRoomLocked,
    jumpToCell,
  };
}
