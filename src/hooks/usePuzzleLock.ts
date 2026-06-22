import { useState, useCallback, useMemo } from "react";
import type { PuzzleEngine, GameConfig, LockDef, InteractionEffect } from "../puzzle-engine/types";

export interface UsePuzzleLockProps {
  engine: PuzzleEngine;
  config: GameConfig;
  showMsg: (text: string, type?: "info" | "collect" | "empty" | "error") => void;
  applyEffects: (effects: InteractionEffect[]) => void;
  openClueModal?: (cellId: string) => void;
  closeClueModal?: () => void;
}

export function usePuzzleLock({
  engine,
  config,
  showMsg,
  applyEffects,
  openClueModal,
  closeClueModal,
}: UsePuzzleLockProps) {
  const [lockTargetId, setLockTargetId] = useState<string | null>(null);
  const [lockDigits, setLockDigits] = useState<string[]>([]);
  const [lockError, setLockError] = useState(false);

  const allLocks = useMemo(() => config.rooms.flatMap((r) => r.locks), [config.rooms]);

  const currentLock: LockDef | undefined = lockTargetId
    ? allLocks.find((l) => l.id === lockTargetId)
    : undefined;

  const doorUIInfo = engine.getLockUIInfo("final_door");
  const canUseKeyOnDoor = doorUIInfo.keyUnlock?.canUse ?? false;
  const keyUseReason = doorUIInfo.keyUnlock?.reason;
  const keySidebarLabel = doorUIInfo.keyUnlock?.sidebarLabel;
  const keyButtonText = doorUIInfo.keyUnlock?.buttonText ?? "🔑 使用组合钥匙开锁";

  const resetLocks = useCallback(() => {
    setLockTargetId(null);
    setLockDigits([]);
    setLockError(false);
  }, []);

  const openLock = useCallback((lockId: string) => {
    setLockTargetId(lockId);
    setLockDigits([]);
    setLockError(false);
  }, []);

  const closeLock = useCallback(() => {
    setLockTargetId(null);
  }, []);

  const openLockFromClueModal = useCallback((lockId: string) => {
    if (closeClueModal) {
      closeClueModal();
    }
    openLock(lockId);
  }, [closeClueModal, openLock]);

  const handleLockDigit = useCallback(
    (digit: string) => {
      if (!lockTargetId) return;
      const lock = currentLock;
      const maxLen = lock?.digits ?? 4;
      if (lockDigits.length < maxLen) {
        setLockDigits((prev) => [...prev, digit]);
        setLockError(false);
      }
    },
    [lockDigits.length, lockTargetId, currentLock]
  );

  const handleLockDelete = useCallback(() => {
    setLockDigits((prev) => prev.slice(0, -1));
    setLockError(false);
  }, []);

  const handleLockSubmit = useCallback(() => {
    if (!lockTargetId) return;
    const result = engine.submitLock(lockTargetId, lockDigits);
    if (result.success) {
      if (result.effects) {
        applyEffects([result.effects]);
      }
      resetLocks();
    } else {
      if (result.errorMessage) {
        const lock = currentLock;
        const hasAnyClue = lock?.clueItemIds?.some((id) => engine.hasItem(id)) ?? false;
        if (hasAnyClue || !lock?.clueItemIds || lock.clueItemIds.length === 0) {
          showMsg(result.errorMessage, "error");
        } else {
          showMsg("密码错误，请重新输入。", "error");
        }
      }
      setLockError(true);
      setTimeout(() => setLockError(false), 600);
    }
  }, [lockDigits, lockTargetId, engine, applyEffects, showMsg, currentLock]);

  const handleUseKeyOnDoor = useCallback(() => {
    if (!canUseKeyOnDoor) return;
    engine.useKeyOnLock("final_door");
    resetLocks();
  }, [canUseKeyOnDoor, engine, resetLocks]);

  const handleUseKeyOnDoorFromLock = useCallback(() => {
    if (!canUseKeyOnDoor) return;
    engine.useKeyOnLock("final_door");
    resetLocks();
  }, [canUseKeyOnDoor, engine, resetLocks]);

  const handleSwitchHiddenLock = useCallback((lockId: string) => {
    setLockTargetId(lockId);
    setLockDigits([]);
    setLockError(false);
  }, []);

  return {
    lockTargetId,
    lockDigits,
    lockError,
    allLocks,
    currentLock,
    doorUIInfo,
    canUseKeyOnDoor,
    keyUseReason,
    keySidebarLabel,
    keyButtonText,
    resetLocks,
    openLock,
    closeLock,
    openLockFromClueModal,
    handleLockDigit,
    handleLockDelete,
    handleLockSubmit,
    handleUseKeyOnDoor,
    handleUseKeyOnDoorFromLock,
    handleSwitchHiddenLock,
  };
}
