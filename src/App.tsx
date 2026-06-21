import { useState, useCallback, useEffect, useMemo } from "react";
import "./styles.css";
import {
  usePuzzleEngine,
  ESCAPE_ROOM_CONFIG,
  checkCondition,
} from "./puzzle-engine";
import type {
  GameConfig,
  InteractionEffect,
  MessageType,
  SaveData,
  HintPuzzleDef,
  RoomDef,
  CellDef,
  RecommendedPuzzle,
} from "./puzzle-engine/types";

const CONFIG: GameConfig = ESCAPE_ROOM_CONFIG;

function App() {
  const engine = usePuzzleEngine(CONFIG);

  const [gameStarted, setGameStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [message, setMessage] = useState<{ text: string; type: MessageType } | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [justCollected, setJustCollected] = useState<string | null>(null);
  const [messageTimer, setMessageTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "key_fragment" | "note" | "tool">("all");

  const [lockTargetId, setLockTargetId] = useState<string | null>(null);
  const [lockDigits, setLockDigits] = useState<string[]>([]);
  const [lockError, setLockError] = useState(false);

  const [combineMode, setCombineMode] = useState(false);
  const [selectedForCombine, setSelectedForCombine] = useState<string[]>([]);

  const [clueModalCellId, setClueModalCellId] = useState<string | null>(null);

  const [hintPanelOpen, setHintPanelOpen] = useState(false);
  const [hintDetailId, setHintDetailId] = useState<string | null>(null);
  const [hintMode, setHintMode] = useState<"browse" | "recommend">("browse");
  const [clueBookOpen, setClueBookOpen] = useState(false);
  const [clueBookDetailItemId, setClueBookDetailItemId] = useState<string | null>(null);
  const [roomProgressModalRoomId, setRoomProgressModalRoomId] = useState<string | null>(null);

  const currentRoom = CONFIG.rooms.find((r) => r.id === engine.currentRoomId) ?? CONFIG.rooms[0];
  const CELLS = currentRoom.cells;
  const LOCKS = currentRoom.locks;

  const showMsg = useCallback(
    (text: string, type: MessageType = "info") => {
      setMessage({ text, type });
      if (messageTimer) clearTimeout(messageTimer);
      const timer = setTimeout(() => setMessage(null), 2500);
      setMessageTimer(timer);
    },
    [messageTimer]
  );

  const applyEffects = useCallback(
    (effects: InteractionEffect[]) => {
      for (const eff of effects) {
        if (eff.showMessage) {
          showMsg(eff.showMessage, eff.messageType ?? "info");
        }
        if (eff.giveItems) {
          for (const id of eff.giveItems) {
            setJustCollected(id);
            setTimeout(() => setJustCollected(null), 600);
          }
        }
      }
    },
    [showMsg]
  );

  const hasExistingSave = useMemo(() => {
    try {
      const raw = localStorage.getItem(CONFIG.saveKey);
      if (!raw) return false;
      const data = JSON.parse(raw) as SaveData;
      if (data.version !== CONFIG.saveVersion) return false;
      return (
        data.inventory.length > 0 ||
        (data.investigatedCellIds?.length ?? 0) > 0 ||
        Object.keys(data.flags ?? {}).length > 0 ||
        data.escaped ||
        data.flashlightActive
      );
    } catch {
      return false;
    }
  }, [gameStarted]);

  const saveGame = useCallback(() => {
    try {
      const saveData = engine.getSaveData();
      localStorage.setItem(CONFIG.saveKey, JSON.stringify(saveData));
    } catch (e) {
      console.error("保存游戏失败:", e);
    }
  }, [engine]);

  const loadGame = useCallback(() => {
    try {
      const raw = localStorage.getItem(CONFIG.saveKey);
      if (!raw) return false;
      const data = JSON.parse(raw) as SaveData;
      const ok = engine.loadSaveData(data);
      if (ok && data.gameStartTime === 0) {
        data.gameStartTime = Date.now();
      }
      return ok;
    } catch (e) {
      console.error("读取存档失败:", e);
      return false;
    }
  }, [engine]);

  const clearSave = useCallback(() => {
    try {
      localStorage.removeItem(CONFIG.saveKey);
    } catch (e) {
      console.error("清除存档失败:", e);
    }
  }, []);

  const resetAllState = useCallback(() => {
    engine.reset();
    setCurrentTime(0);
    setMessage(null);
    setDetailItemId(null);
    setJustCollected(null);
    setFilterTab("all");
    setLockTargetId(null);
    setLockDigits([]);
    setLockError(false);
    setCombineMode(false);
    setSelectedForCombine([]);
    setClueModalCellId(null);
    setHintPanelOpen(false);
    setHintDetailId(null);
    setHintMode("browse");
    setClueBookOpen(false);
    setClueBookDetailItemId(null);
    setRoomProgressModalRoomId(null);
  }, [engine]);

  const handleNewGame = useCallback(() => {
    clearSave();
    resetAllState();
    const now = Date.now();
    engine.setGameStartTime(now);
    setGameStarted(true);
  }, [clearSave, resetAllState, engine]);

  const handleContinue = useCallback(() => {
    const now = Date.now();
    if (loadGame()) {
      if (engine.gameStartTime === 0) {
        engine.setGameStartTime(now);
      }
      setGameStarted(true);
      setTimeout(() => showMsg("📂 已加载存档，继续你的逃脱之旅！", "info"), 0);
    } else {
      handleNewGame();
    }
  }, [loadGame, engine, showMsg, handleNewGame]);

  const handleRestart = useCallback(() => {
    if (confirm("确定要重新开始吗？当前进度将被清除且无法恢复。")) {
      clearSave();
      resetAllState();
      engine.setGameStartTime(Date.now());
      showMsg("🔄 游戏已重置，开始新的冒险！", "info");
    }
  }, [clearSave, resetAllState, engine, showMsg]);

  useEffect(() => {
    if (gameStarted) {
      saveGame();
    }
  }, [
    gameStarted,
    engine.inventory,
    engine.investigatedCellIds,
    engine.cellStageIds,
    engine.flags,
    engine.escaped,
    engine.endingId,
    engine.flashlightActive,
    engine.lastHint,
    engine.combineCount,
    engine.hintUsage,
    engine.currentRoomId,
    saveGame,
  ]);

  const gameStartTime = engine.gameStartTime;

  useEffect(() => {
    if (!gameStarted || engine.escaped || gameStartTime === 0) return;
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, engine.escaped, gameStartTime]);

  const formatTime = useCallback((ms: number): string => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const elapsedTime = currentTime > 0 && gameStartTime > 0 ? currentTime - gameStartTime : 0;

  const itemCount = (cat: "key_fragment" | "note" | "tool") =>
    engine.inventory.filter((id) => CONFIG.items[id]?.category === cat).length;

  const fragmentCount = engine.inventory.filter(
    (id) => CONFIG.items[id]?.category === "key_fragment" && id !== "complete_key" && id !== "assembled_key"
  ).length;
  const noteCount = itemCount("note");
  const toolCount = itemCount("tool");
  const hasCompleteKey = engine.hasItem("complete_key");
  const hasPoweredFlashlight = engine.hasItem("powered_flashlight");
  const hasFlashlight = engine.hasItem("flashlight");
  const hasAssembledKey = engine.hasItem("assembled_key");

  const hiddenClueIds = ["note_hidden_curtain", "note_hidden_painting", "note_hidden_lamp", "note_hidden_shelf", "note_hidden_workbench"];
  const hiddenClueCount = hiddenClueIds.filter((id) => engine.hasItem(id)).length;
  const hasAllHiddenClues = hiddenClueCount === 5;

  const drawerUnlocked = !!engine.flags.drawerUnlocked;
  const boxOpened = !!engine.flags.boxOpened;
  const paintingRemoved = !!engine.flags.paintingRemoved;
  const curtainChecked = !!engine.flags.curtainChecked;
  const secretDoorOpened = !!engine.flags.secretDoorOpened;

  const totalHintCount = Object.values(engine.hintUsage).reduce((sum, n) => sum + n, 0);
  const puzzlesHintedCount = Object.keys(engine.hintUsage).length;

  const totalClueCount = CONFIG.clueBook.reduce((sum, g) => sum + g.entries.length, 0);
  const foundClueCount = CONFIG.clueBook.reduce(
    (sum, g) =>
      sum +
      g.entries.filter((e) => e.revealCondition && checkCondition(e.revealCondition, { inventory: engine.inventory, flags: engine.flags })).length,
    0
  );

  const isClueRevealed = (entry: any) => {
    if (!entry.revealCondition) return true;
    return checkCondition(entry.revealCondition, { inventory: engine.inventory, flags: engine.flags });
  };

  const buildHintContext = () => ({
    inventory: engine.inventory,
    flags: engine.flags,
  });

  const handleRevealHint = useCallback(
    (puzzleId: string) => {
      const result = engine.revealHint(puzzleId);
      if (result) {
        showMsg(`💡 已查看「${result.title}」第 ${result.level} 层提示`, "info");
      }
    },
    [engine, showMsg]
  );

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
    setJustCollected(recipe.output);
    setTimeout(() => setJustCollected(null), 600);
    showMsg(recipe.successMessage, "collect");
    setSelectedForCombine([]);
    setCombineMode(false);
  }, [engine, selectedForCombine, showMsg]);

  const toggleCombineMode = useCallback(() => {
    setCombineMode((prev) => !prev);
    setSelectedForCombine([]);
  }, []);

  const getEnrichedCellContent = useCallback(
    (cellId: string) => {
      return engine.getCellContent(cellId);
    },
    [engine]
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
        setLockTargetId(content.lockTargetId);
        setLockDigits([]);
        setLockError(false);
        if (cellId === "drawer" || cellId === "filing_cabinet") {
          setClueModalCellId(cellId);
        }
        return;
      }

      if (content.isLocked && !content.lockTargetId) {
        showMsg(content.lockReason || "暂时无法操作，也许需要某个道具或先完成其他步骤。", "error");
        setClueModalCellId(cellId);
        return;
      }

      const result = engine.interactCell(cellId);
      applyEffects(result.effects);
      if (result.openLockId) {
        setLockTargetId(result.openLockId);
        setLockDigits([]);
        setLockError(false);
      }
      if (result.showClue) {
        setClueModalCellId(cellId);
      }
    },
    [
      engine,
      getEnrichedCellContent,
      applyEffects,
      showMsg,
      CELLS,
    ]
  );

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

  const handleLockDigit = useCallback(
    (digit: string) => {
      if (!lockTargetId) return;
      const lock = CONFIG.rooms.flatMap((r) => r.locks).find((l) => l.id === lockTargetId);
      const maxLen = lock?.digits ?? 4;
      if (lockDigits.length < maxLen) {
        setLockDigits((prev) => [...prev, digit]);
        setLockError(false);
      }
    },
    [lockDigits.length, lockTargetId]
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
      setLockTargetId(null);
      setLockDigits([]);
    } else {
      if (result.errorMessage) {
        const lock = CONFIG.rooms.flatMap((r) => r.locks).find((l) => l.id === lockTargetId);
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
  }, [lockDigits, lockTargetId, engine, applyEffects, showMsg, CONFIG]);

  const allLocks = CONFIG.rooms.flatMap((r) => r.locks);

  const doorUIInfo = engine.getLockUIInfo("final_door");
  const canUseKeyOnDoor = doorUIInfo.keyUnlock?.canUse ?? false;
  const keyUseReason = doorUIInfo.keyUnlock?.reason;
  const keySidebarLabel = doorUIInfo.keyUnlock?.sidebarLabel;
  const keyButtonText = doorUIInfo.keyUnlock?.buttonText ?? "🔑 使用组合钥匙开锁";

  const handleUseKeyOnDoor = useCallback(() => {
    if (!canUseKeyOnDoor) return;
    engine.useKeyOnLock("final_door");
    setLockTargetId(null);
  }, [canUseKeyOnDoor, engine]);

  const handleSwitchRoom = useCallback(
    (roomId: string) => {
      engine.switchRoom(roomId);
    },
    [engine]
  );

  const filteredInventory =
    filterTab === "all"
      ? engine.inventory
      : engine.inventory.filter((id) => CONFIG.items[id]?.category === filterTab);

  const detailItem = detailItemId ? CONFIG.items[detailItemId] : null;

  const getRoomProgress = (room: RoomDef) => {
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
  };

  const getSecretDoorUnlockReason = () => {
    const reasons: string[] = [];
    if (!drawerUnlocked) reasons.push("打开抽屉");
    if (!paintingRemoved) reasons.push("取下挂画");
    if (!boxOpened) reasons.push("撬开铁皮箱");
    if (reasons.length === 0 && !secretDoorOpened) {
      reasons.push("调查书房暗门");
    }
    if (reasons.length === 0) return null;
    return reasons;
  };

  if (!gameStarted) {
    return (
      <main className="game-shell">
        <section className="hero">
          <p>密室文字逃脱 · H5Game</p>
          <h1>{CONFIG.title}</h1>
          <span>{CONFIG.subtitle}</span>
        </section>
        <section className="start-panel">
          <div className="start-icon">🔐</div>
          <h2>{CONFIG.intro.title}</h2>
          <p className="start-desc">{CONFIG.intro.description}</p>
          <div className="start-buttons">
            <button className="action-btn start-btn primary-btn" onClick={handleNewGame}>
              🎮 新游戏
            </button>
            {hasExistingSave && (
              <button className="action-btn start-btn continue-btn" onClick={handleContinue}>
                📂 继续游戏
              </button>
            )}
          </div>
          {hasExistingSave && (
            <p className="save-hint">检测到本地存档，点击「继续游戏」可恢复上次进度</p>
          )}
        </section>
      </main>
    );
  }

  if (engine.escaped) {
    const ending = engine.endingId ? CONFIG.endings[engine.endingId] : null;
    const isTrueEnding = ending?.isTrueEnding ?? false;
    const displayTime = formatTime(elapsedTime);

    return (
      <main className="game-shell">
        <section className="hero">
          <p>密室文字逃脱 · H5Game</p>
          <h1>{CONFIG.title}</h1>
          <span>{CONFIG.subtitle}</span>
        </section>
        <section
          className={`victory-panel ${isTrueEnding ? "true-ending" : "normal-ending"}`}
        >
          <div className="victory-icon">{ending?.icon ?? "🎉"}</div>
          <h2
            className={`victory-title ${isTrueEnding ? "true-ending-title" : ""}`}
          >
            {ending?.title ?? "成功逃脱"}
          </h2>
          <p className="victory-ending-tag">{ending?.tag ?? ""}</p>
          <div className="victory-story">
            {(ending?.story ?? []).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="victory-stats-grid victory-stats-grid-6">
            <div className="stat-card">
              <span className="stat-icon">⏱️</span>
              <span className="stat-value">{displayTime}</span>
              <span className="stat-label">本局用时</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📝</span>
              <span className="stat-value">{noteCount}</span>
              <span className="stat-label">发现线索</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🔧</span>
              <span className="stat-value">{engine.combineCount}</span>
              <span className="stat-label">道具组合</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">
                {isTrueEnding ? "🌟" : hiddenClueCount > 0 ? "🗝️" : "🔒"}
              </span>
              <span className="stat-value">{hiddenClueCount}/5</span>
              <span className="stat-label">隐藏线索</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">💡</span>
              <span className="stat-value">{totalHintCount}</span>
              <span className="stat-label">提示使用</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🧩</span>
              <span className="stat-value">
                {puzzlesHintedCount}/{CONFIG.hintPuzzles.length}
              </span>
              <span className="stat-label">求助谜题</span>
            </div>
          </div>
          {totalHintCount > 0 && (
            <div className="hint-stats-detail">
              <h4 className="hint-stats-title">📋 提示使用详情</h4>
              <div className="hint-stats-list">
                {CONFIG.hintPuzzles.map((puzzle) => {
                  const count = engine.hintUsage[puzzle.id] || 0;
                  if (count === 0) return null;
                  return (
                    <div key={puzzle.id} className="hint-stats-item">
                      <span className="hint-stats-icon">{puzzle.icon}</span>
                      <span className="hint-stats-name">{puzzle.title}</span>
                      <span className="hint-stats-level">
                        {count === 1
                          ? "轻度求助"
                          : count === 2
                          ? "中度求助"
                          : "深度求助"}
                      </span>
                      <span className="hint-stats-count">{count}/3 层</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {totalHintCount === 0 && (
            <p className="no-hint-badge">
              🎉 太棒了！你没有使用任何提示，全凭自己的智慧逃出了密室！
            </p>
          )}
          <div className="victory-buttons">
            <button className="action-btn victory-restart" onClick={handleNewGame}>
              🔄 再来一次
            </button>
            <button
              className="action-btn victory-restart secondary-btn"
              onClick={() => {
                clearSave();
                setGameStarted(false);
              }}
            >
              🏠 返回主菜单
            </button>
          </div>
        </section>
      </main>
    );
  }

  const getCellStatus = (cellId: string) => {
    const content = getEnrichedCellContent(cellId);
    const isLit =
      (cellId === "carpet" || cellId === "dark_corner") &&
      engine.flashlightActive &&
      hasPoweredFlashlight &&
      !engine.hasItem(cellId === "carpet" ? "note_carpet" : "note_dark");
    return {
      isLocked: content.isLocked,
      alreadyChecked: content.alreadyChecked,
      isLit,
    };
  };

  const progressText = engine.getProgressText();

  return (
    <main className="game-shell">
      <section className="hero">
        <p>密室文字逃脱 · H5Game</p>
        <h1>{CONFIG.title}</h1>
        <span>书房→暗门→储物间→最终大门 | 两个房间共享物品栏和进度</span>
      </section>
      <section className="hud hud-6">
        <article>
          <small>用时</small>
          <strong>⏱️ {formatTime(elapsedTime)}</strong>
        </article>
        <article onClick={() => setClueBookOpen(true)} style={{ cursor: "pointer" }}>
          <small>线索册</small>
          <strong>📖 {foundClueCount}/{totalClueCount}</strong>
        </article>
        <article>
          <small>道具</small>
          <strong>🎒 {engine.inventory.length}</strong>
        </article>
        <article>
          <small>组合</small>
          <strong>🔧 {engine.combineCount}</strong>
        </article>
        <article>
          <small>隐藏</small>
          <strong>
            {hiddenClueCount > 0 ? `🗝️ ${hiddenClueCount}/5` : "🔒 0/5"}
          </strong>
        </article>
        <article onClick={() => setHintPanelOpen(true)} style={{ cursor: "pointer" }}>
          <small>提示</small>
          <strong>💡 {totalHintCount > 0 ? `${totalHintCount}次` : "未使用"}</strong>
        </article>
      </section>
      <section className="playground escape">
        <div className="board-wrapper">
          <div className="room-tabs">
            {CONFIG.rooms.map((room) => {
              const progress = getRoomProgress(room);
              const isActive = room.id === engine.currentRoomId;
              const isLocked = room.id !== CONFIG.rooms[0]?.id && !secretDoorOpened;
              const secretDoorReasons = isLocked ? getSecretDoorUnlockReason() : null;
              return (
                <div
                  key={room.id}
                  className={`room-tab-wrapper ${isActive ? "room-tab-wrapper-active" : ""}`}
                >
                  <button
                    className={`room-tab ${isActive ? "room-tab-active" : ""} ${isLocked ? "room-tab-locked" : ""}`}
                    onClick={() => !isLocked && handleSwitchRoom(room.id)}
                    disabled={isLocked}
                  >
                    <span className="room-tab-name">{room.name}</span>
                    {isLocked ? (
                      <span className="room-tab-progress room-tab-locked-hint">
                        🔒 暗门未开启
                      </span>
                    ) : (
                      <span
                        className={`room-tab-progress room-tab-progress-clickable ${progress.remaining > 0 ? "has-remaining" : "all-checked"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLocked) {
                            setRoomProgressModalRoomId(room.id);
                          }
                        }}
                        title={`还剩 ${progress.remaining} 处未彻底调查，点击查看详情`}
                      >
                        {progress.remaining > 0 ? (
                          <>⏳ 剩 {progress.remaining}</>
                        ) : (
                          <>✓ {progress.checked}/{progress.total}</>
                        )}
                      </span>
                    )}
                  </button>
                  {isLocked && secretDoorReasons && secretDoorReasons.length > 0 && (
                    <div className="room-tab-lock-reason">
                      <div className="lock-reason-title">🚪 暗门开启条件：</div>
                      <div className="lock-reason-list">
                        {secretDoorReasons.map((reason, idx) => (
                          <div key={idx} className="lock-reason-item">
                            ⬜ {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="board">
            {CELLS.map((cell) => {
              const status = getCellStatus(cell.id);
              const content = getEnrichedCellContent(cell.id);
              const isInvestigated = engine.investigatedCellIds.has(cell.id);
              return (
                <button
                  className={`board-cell ${status.alreadyChecked ? "collected" : ""} ${
                    status.isLit ? "flashlight-lit" : ""
                  } ${isInvestigated ? "investigated" : ""} ${
                    status.isLocked ? "locked-cell" : ""
                  }`}
                  key={cell.id}
                  onClick={() => handleCellClick(cell.id)}
                  title={status.isLocked ? content.lockReason : ""}
                >
                  <span className="cell-icon">{cell.icon}</span>
                  <span className="cell-label">{cell.label}</span>
                  {status.alreadyChecked && <span className="cell-check">✓</span>}
                  {status.isLit && <span className="cell-glow">💡</span>}
                  {status.isLocked && !status.alreadyChecked && (
                    <span className="cell-locked">🔒</span>
                  )}
                  {isInvestigated && !status.alreadyChecked && !status.isLocked && (
                    <span className="cell-investigated">👁️</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <aside className="side-panel">
          <h2>物品栏</h2>
          <div className="inventory-summary">
            <span style={{ color: CONFIG.categoryColors.key_fragment }}>
              🗝️ {hasAssembledKey ? 1 : hasCompleteKey ? 1 : fragmentCount}
            </span>
            <span style={{ color: CONFIG.categoryColors.note }}>📝 {noteCount}</span>
            <span style={{ color: CONFIG.categoryColors.tool }}>
              🔧 {toolCount}
            </span>
          </div>
          <div className="filter-tabs">
            {CONFIG.filterTabs.map((tab) => (
              <button
                key={tab.key}
                className={`filter-tab ${filterTab === tab.key ? "active" : ""}`}
                onClick={() => setFilterTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {combineMode && (
            <div className="combine-slots">
              <div className="combine-slots-title">选择要组合的道具（最多3个）</div>
              <div className="combine-slot-row">
                {[0, 1, 2].map((i) => {
                  const itemId = selectedForCombine[i];
                  const item = itemId ? CONFIG.items[itemId] : null;
                  return (
                    <div
                      key={i}
                      className={`combine-slot ${item ? "combine-slot-filled" : ""}`}
                    >
                      {item ? (
                        <>
                          <span className="combine-slot-icon">{item.icon}</span>
                          <span className="combine-slot-name">{item.name}</span>
                        </>
                      ) : (
                        <span className="combine-slot-placeholder">空</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {filteredInventory.length === 0 ? (
            <p className="empty-hint">
              {engine.inventory.length === 0
                ? "点击房间中的物品来收集道具。先从书架开始调查吧！"
                : "当前分类下没有道具"}
            </p>
          ) : (
            <div className="inventory-list">
              {filteredInventory.map((itemId) => {
                const item = CONFIG.items[itemId];
                if (!item) return null;
                const isNew = justCollected === itemId;
                const isActiveFlashlight =
                  itemId === "powered_flashlight" && engine.flashlightActive;
                const isSelected = selectedForCombine.includes(itemId);
                const isCandidate = combineCandidateIds.has(itemId);
                const isCombinable =
                  selectedForCombine.length === 0 && combinableItemIds.has(itemId);
                return (
                  <button
                    className={`inventory-item ${isNew ? "item-pop" : ""} ${
                      isActiveFlashlight ? "item-active" : ""
                    } ${isSelected ? "item-selected" : ""} ${
                      combineMode ? "item-combine-mode" : ""
                    } ${isCombinable ? "item-combinable" : ""} ${
                      isCandidate ? "item-combine-candidate" : ""
                    }`}
                    key={itemId}
                    onClick={() => handleItemClick(itemId)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span
                        className="item-tag"
                        style={{ color: CONFIG.categoryColors[item.category] }}
                      >
                        {CONFIG.categoryLabels[item.category]}
                        {isActiveFlashlight && " · 已开启"}
                        {isSelected && " · 已选"}
                      </span>
                    </span>
                    {isActiveFlashlight && <span className="item-status">ON</span>}
                    {isSelected && <span className="item-check">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
          <div className="actions">
            {!combineMode ? (
              <button
                className="action-btn combine-toggle-btn"
                onClick={toggleCombineMode}
                disabled={engine.inventory.length < 2}
                title={
                  engine.inventory.length < 2
                    ? "至少需要2个道具才能组合"
                    : "选择道具进行组合"
                }
              >
                🔧 组合道具
              </button>
            ) : (
              <>
                <button
                  className={`action-btn combine-confirm-btn ${
                    canCombine ? "combine-confirm-success" : "combine-confirm-fail"
                  }`}
                  onClick={handleCombine}
                  disabled={selectedForCombine.length === 0}
                  title={
                    canCombine
                      ? "确认组合选中的道具"
                      : selectedForCombine.length === 0
                      ? "请先选择要组合的道具"
                      : "点击查看当前选择的组合提示"
                  }
                >
                  {canCombine
                    ? "✨ 确认组合"
                    : selectedForCombine.length === 0
                    ? "请选择道具"
                    : "❓ 尝试组合"}
                </button>
                <button
                  className="action-btn combine-cancel-btn"
                  onClick={toggleCombineMode}
                >
                  取消
                </button>
              </>
            )}
            {secretDoorOpened && (
              <button
                className="action-btn"
                disabled={!canUseKeyOnDoor}
                onClick={canUseKeyOnDoor ? handleUseKeyOnDoor : undefined}
                title={keyUseReason ?? ""}
              >
                {keySidebarLabel ?? "🔑 用钥匙开锁"}
              </button>
            )}
          </div>
          <div className="game-menu">
            <button className="action-btn menu-btn restart-btn" onClick={handleRestart}>
              🔄 重新开始
            </button>
            <button
              className="action-btn menu-btn main-menu-btn"
              onClick={() => setGameStarted(false)}
            >
              🏠 主菜单
            </button>
          </div>
        </aside>
      </section>
      {message && (
        <div className={`toast toast-${message.type}`}>
          {message.type === "collect" && "✨ "}
          {message.type === "error" && "⚠️ "}
          {message.text}
        </div>
      )}
      {detailItem && (
        <div className="modal-overlay" onClick={() => setDetailItemId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">{detailItem.icon}</span>
              <div>
                <h3>{detailItem.name}</h3>
                <span
                  className="item-tag"
                  style={{ color: CONFIG.categoryColors[detailItem.category] }}
                >
                  {CONFIG.categoryLabels[detailItem.category]}
                </span>
              </div>
              <button className="modal-close" onClick={() => setDetailItemId(null)}>
                ✕
              </button>
            </div>
            <p className="modal-desc">{detailItem.description}</p>
            <div className="modal-detail">
              {detailItem.detail.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {detailItem.id === "powered_flashlight" && (
              <button
                className="action-btn modal-use-btn"
                onClick={() => {
                  engine.toggleFlashlight();
                  if (!engine.flashlightActive) {
                    showMsg("🔦 手电筒已打开，暗处的线索将显现！", "collect");
                  } else {
                    showMsg("手电筒已关闭", "info");
                  }
                  setDetailItemId(null);
                }}
              >
                {engine.flashlightActive ? "关闭手电筒" : "🔦 打开手电筒"}
              </button>
            )}
            {detailItem.id === "flashlight" && (
              <p className="modal-hint">
                💡 提示：这把手电筒没有电池，需要找到电池后组合使用。
              </p>
            )}
            {detailItem.id === "battery" && (
              <p className="modal-hint">
                💡 提示：也许能和某个电子设备组合使用——比如台灯旁边那把手电筒？
              </p>
            )}
            {detailItem.id === "key_core" && (
              <p className="modal-hint">
                💡 提示：钥匙核心可以嵌入完整钥匙的握柄中心，尝试将它们组合！
              </p>
            )}
            {detailItem.id === "complete_key" && !engine.hasItem("key_core") && (
              <p className="modal-hint">
                💡 提示：完整钥匙已组合好，但储物间的通风口里也许藏着钥匙的关键组件……
              </p>
            )}
            {detailItem.id === "circuit_board" && (
              <p className="modal-hint">
                💡 提示：这是最终大门门锁系统的核心模块。去储物间的最终大门处找到插槽插入！
              </p>
            )}
          </div>
        </div>
      )}
      {clueModalCellId !== null &&
        (() => {
          const cell = CONFIG.rooms.flatMap((r) => r.cells).find((c) => c.id === clueModalCellId);
          if (!cell) return null;
          const content = getEnrichedCellContent(clueModalCellId);
          const gotClue = content.itemId ? CONFIG.items[content.itemId] : null;
          return (
            <div
              className="modal-overlay clue-modal-overlay"
              onClick={() => setClueModalCellId(null)}
            >
              <div
                className="modal-card clue-modal-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header clue-modal-header">
                  <span className="modal-icon clue-modal-icon">{cell.icon}</span>
                  <div>
                    <h3>{cell.label}</h3>
                    <span className="clue-status-tag">
                      {content.alreadyChecked
                        ? "✓ 已完成"
                        : content.isLocked
                        ? `🔒 ${content.lockReason}`
                        : gotClue
                        ? "✨ 获得线索"
                        : "🔍 调查中"}
                    </span>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setClueModalCellId(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="clue-detail-section">
                  <h4 className="clue-section-title">📖 场景描述</h4>
                  <p className="clue-detail-text">{content.clueDetail}</p>
                </div>
                <div className="clue-detail-section">
                  <h4 className="clue-section-title">
                    {gotClue
                      ? "🎁 获得线索"
                      : content.isLocked
                      ? "🔒 当前状态"
                      : "🔍 线索状态"}
                  </h4>
                  {gotClue ? (
                    <div className="clue-item-box">
                      <span className="clue-item-icon">{gotClue.icon}</span>
                      <div className="clue-item-info">
                        <span className="clue-item-name">{gotClue.name}</span>
                        <span className="clue-item-desc">{gotClue.description}</span>
                      </div>
                      <button
                        className="clue-item-view-btn"
                        onClick={() => {
                          setDetailItemId(gotClue.id);
                          setClueModalCellId(null);
                        }}
                      >
                        查看详情
                      </button>
                    </div>
                  ) : content.isLocked ? (
                    <p className="clue-status-text hint-text">
                      {content.lockReason === "三位密码锁"
                        ? clueModalCellId === "filing_cabinet"
                          ? "档案柜被三位密码锁锁住了。需要输入正确的密码才能打开。储物架上的纸条也许有线索……"
                          : "这个抽屉被三位密码锁锁住了。需要输入正确的密码才能打开。"
                        : content.lockReason === "需要螺丝刀"
                        ? clueModalCellId === "workbench"
                          ? "工作台抽屉被螺丝固定住了。需要螺丝刀才能打开——你在书房找到的螺丝刀也许能派上用场！"
                          : "需要螺丝刀才能操作这里。先去找到螺丝刀吧——抽屉里似乎有工具。"
                        : content.lockReason === "需要螺丝刀撬开"
                        ? "箱子封条太牢固了，需要螺丝刀才能撬开。"
                        : content.lockReason === "需要钢丝钳"
                        ? "通风口被铁丝网封住了，需要钢丝钳才能剪开。工作台抽屉里应该有！"
                        : content.lockReason === "需要打开手电筒"
                        ? "这里似乎藏着荧光墨水书写的暗号。打开手电筒照照看！"
                        : content.lockReason === "手电筒缺少电池"
                        ? "你有手电筒，但没有电池亮不起来。去抽屉里找找电池，然后组合使用！"
                        : content.lockReason === "需要能照亮暗处的工具"
                        ? "角落太暗了看不清楚，需要找到能发光的工具。"
                        : content.lockReason === "未完成书房探索"
                        ? "暗门机关需要集齐书房所有机关之钥——打开抽屉、取下挂画、撬开箱子！"
                        : content.lockReason === "门锁系统未启动：需要电路板"
                        ? "最终大门的门锁系统没有供电。需要找到电路板插入插槽——工作台里有！"
                        : content.lockReason === "需要开锁方法"
                        ? "门锁系统已启动，但还需要开锁方法：找到档案柜中的密码线索，或组合出钥匙。"
                        : "这里暂时无法操作。"}
                      {(content.lockReason === "三位密码锁" && clueModalCellId === "drawer") && (
                        <button
                          className="action-btn clue-close-btn"
                          style={{ marginTop: "12px" }}
                          onClick={() => {
                            setClueModalCellId(null);
                            setLockTargetId("drawer");
                            setLockDigits([]);
                            setLockError(false);
                          }}
                        >
                          🔢 输入密码
                        </button>
                      )}
                      {(content.lockReason === "三位密码锁" && clueModalCellId === "filing_cabinet") && (
                        <button
                          className="action-btn clue-close-btn"
                          style={{ marginTop: "12px" }}
                          onClick={() => {
                            setClueModalCellId(null);
                            setLockTargetId("filing_cabinet");
                            setLockDigits([]);
                            setLockError(false);
                          }}
                        >
                          🔢 输入密码
                        </button>
                      )}
                    </p>
                  ) : (clueModalCellId === "carpet" || clueModalCellId === "dark_corner") &&
                    engine.flashlightActive &&
                    hasPoweredFlashlight ? (
                    <p className="clue-status-text">此处的线索已经被你记录下来了。</p>
                  ) : clueModalCellId === "curtain" && curtainChecked ? (
                    <p className="clue-status-text">窗帘上的刻字你已经记下了。</p>
                  ) : (
                    <p className="clue-status-text">这里没有发现可收集的物品。</p>
                  )}
                </div>
                <div className="clue-detail-section">
                  <h4 className="clue-section-title">💡 下一步提示</h4>
                  <p className="clue-hint-text">{content.nextHint}</p>
                </div>
                <button
                  className="action-btn clue-close-btn"
                  onClick={() => setClueModalCellId(null)}
                >
                  知道了
                </button>
              </div>
            </div>
          );
        })()}
      {lockTargetId &&
        (() => {
          const lock = allLocks.find((l) => l.id === lockTargetId);
          if (!lock) return null;
          const isDrawer = lock.id === "drawer";
          const isFilingCabinet = lock.id === "filing_cabinet";
          const isHidden = lock.id === "final_hidden";
          const isFinalDoor = lock.id === "final_door";
          const lockUIInfo = engine.getLockUIInfo(lockTargetId);
          return (
            <div className="modal-overlay" onClick={() => setLockTargetId(null)}>
              <div
                className={`modal-card lock-modal-card ${lockError ? "lock-shake" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <span className="modal-icon">{lock.icon}</span>
                  <div>
                    <h3>{lock.label}</h3>
                    <span className="clue-status-tag">
                      请输入{lock.digits}位数字密码
                    </span>
                  </div>
                  <button className="modal-close" onClick={() => setLockTargetId(null)}>
                    ✕
                  </button>
                </div>
                {isFinalDoor && (
                  <div style={{ marginBottom: "12px" }}>
                    {lockUIInfo.modalHints
                      .filter((h) => h.type === "warning")
                      .map((hint, i) => (
                        <p
                          key={i}
                          className="lock-error-text"
                          style={{ margin: "0 0 8px", textAlign: "left" }}
                        >
                          ⚠️ {hint.text}
                        </p>
                      ))}
                    {lockUIInfo.keyUnlock?.canUse && (
                      <button
                        className="action-btn modal-use-btn"
                        style={{ width: "100%" }}
                        onClick={handleUseKeyOnDoor}
                      >
                        {keyButtonText}
                      </button>
                    )}
                    {lockUIInfo.hiddenPassword?.canShow && (
                      <button
                        className="action-btn"
                        style={{
                          width: "100%",
                          marginTop: "10px",
                          background: "linear-gradient(135deg, #fbbf24, #f97316)",
                          color: "#0f172a",
                        }}
                        onClick={() => {
                          setLockTargetId(lockUIInfo.hiddenPassword!.lockId);
                          setLockDigits([]);
                          setLockError(false);
                        }}
                      >
                        {lockUIInfo.hiddenPassword.buttonText}
                      </button>
                    )}
                    {lockUIInfo.hiddenPassword?.showPartialHint &&
                      lockUIInfo.hiddenPassword.partialHintText && (
                        <p
                          className="lock-error-text"
                          style={{
                            margin: "10px 0 0",
                            textAlign: "left",
                            color: "#fbbf24",
                          }}
                        >
                          {lockUIInfo.hiddenPassword.partialHintText}
                        </p>
                      )}
                  </div>
                )}
                {isHidden && (
                  <div style={{ marginBottom: "12px" }}>
                    <p
                      style={{
                        margin: "0 0 8px",
                        textAlign: "left",
                        color: "#fbbf24",
                        fontSize: "14px",
                        lineHeight: "1.7",
                      }}
                    >
                      {(lock.descriptionLines ?? []).map((line, i) => (
                        <span key={line}>
                          {line}
                          {i < (lock.descriptionLines?.length ?? 0) - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
                {lock.clueItemIds && lock.clueItemIds.length > 0 && (
                  <div className="lock-clue-section">
                    <h4 className="lock-clue-title">📝 已掌握线索</h4>
                    <div className="lock-clue-list">
                      {lock.clueItemIds
                        .filter((id) => engine.hasItem(id))
                        .map((itemId) => {
                          const item = CONFIG.items[itemId];
                          if (!item) return null;
                          return (
                            <div key={itemId} className="lock-clue-item">
                              <span className="lock-clue-icon">{item.icon}</span>
                              <div className="lock-clue-info">
                                <span className="lock-clue-name">{item.name}</span>
                                <span className="lock-clue-summary">
                                  {item.summary ?? item.description}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      {lock.clueItemIds.filter((id) => engine.hasItem(id)).length === 0 && (
                        <p className="lock-clue-empty">暂无已收集的相关线索，继续探索房间吧！</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="lock-digits">
                  {Array.from({ length: lock.digits }).map((_, i) => (
                    <span
                      key={i}
                      className={`lock-digit ${
                        lockError ? "lock-digit-error" : ""
                      } ${i === lockDigits.length ? "lock-digit-active" : ""}`}
                    >
                      {lockDigits[i] || ""}
                    </span>
                  ))}
                </div>
                {lockError && (
                  <p className="lock-error-text">
                    {(() => {
                      const hasAnyClue = lock.clueItemIds?.some((id) => engine.hasItem(id)) ?? false;
                      if (hasAnyClue || !lock.clueItemIds || lock.clueItemIds.length === 0) {
                        return lock.errorHint ?? "密码错误";
                      }
                      return "密码错误，请重新输入。";
                    })()}
                  </p>
                )}
                <div className="lock-numpad">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                    <button
                      key={d}
                      className="lock-numpad-key"
                      onClick={() => handleLockDigit(d)}
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    className="lock-numpad-key lock-numpad-delete"
                    onClick={handleLockDelete}
                  >
                    ⌫
                  </button>
                  <button
                    className="lock-numpad-key"
                    onClick={() => handleLockDigit("0")}
                  >
                    0
                  </button>
                  <button
                    className={`lock-numpad-key lock-numpad-submit ${
                      lockDigits.length === lock.digits
                        ? "lock-numpad-submit-active"
                        : ""
                    }`}
                    disabled={lockDigits.length < lock.digits}
                    onClick={handleLockSubmit}
                  >
                    ✓
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      {hintPanelOpen &&
        (() => {
          const ctx = buildHintContext();
          const availablePuzzles = CONFIG.hintPuzzles.filter((p) => {
            const avail = checkCondition(p.availableCondition, ctx);
            const done = checkCondition(p.completedCondition, ctx);
            return avail && !done;
          });
          const recommendedPuzzles = engine.getRecommendedPuzzles();
          const selectedPuzzle: HintPuzzleDef | undefined = hintDetailId
            ? CONFIG.hintPuzzles.find((p) => p.id === hintDetailId)
            : undefined;

          const handleJumpToCell = (rec: RecommendedPuzzle) => {
            if (!rec.puzzle.relatedCellId) return;
            const cellId = rec.puzzle.relatedCellId;
            if (rec.puzzle.relatedRoomId && rec.puzzle.relatedRoomId !== engine.currentRoomId) {
              engine.switchRoom(rec.puzzle.relatedRoomId);
            }
            setTimeout(() => {
              setHintPanelOpen(false);
              setClueModalCellId(cellId);
            }, 50);
          };

          const getUrgencyLabel = (urgency: string) => {
            switch (urgency) {
              case "immediate": return "⚡ 立即行动";
              case "soon": return "⏳ 即将到来";
              default: return "🔍 探索中";
            }
          };

          const getUrgencyColor = (urgency: string) => {
            switch (urgency) {
              case "immediate": return "linear-gradient(135deg, #ef4444, #f97316)";
              case "soon": return "linear-gradient(135deg, #f59e0b, #eab308)";
              default: return "linear-gradient(135deg, #3b82f6, #6366f1)";
            }
          };

          if (selectedPuzzle) {
            const levelsUnlocked = engine.hintUsage[selectedPuzzle.id] || 0;
            return (
              <div
                className="modal-overlay"
                onClick={() => setHintDetailId(null)}
              >
                <div
                  className="modal-card hint-detail-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <span className="modal-icon hint-modal-icon">
                      {selectedPuzzle.icon}
                    </span>
                    <div>
                      <h3>{selectedPuzzle.title}</h3>
                      <span className="clue-status-tag">
                        💡 已解锁 {levelsUnlocked}/3 层提示
                      </span>
                    </div>
                    <button
                      className="modal-close"
                      onClick={() => setHintDetailId(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="hint-level-list">
                    {[0, 1, 2].map((level) => {
                      const isUnlocked = levelsUnlocked > level;
                      const isNext = levelsUnlocked === level;
                      return (
                        <div
                          key={level}
                          className={`hint-level-item ${
                            isUnlocked ? "hint-level-unlocked" : ""
                          } ${isNext ? "hint-level-next" : ""}`}
                        >
                          <div className="hint-level-header">
                            <span className="hint-level-badge">
                              {level === 0 ? "🥉" : level === 1 ? "🥈" : "🥇"} 第
                              {level + 1}层
                            </span>
                            <span className="hint-level-status">
                              {isUnlocked
                                ? "✓ 已查看"
                                : isNext
                                ? "可解锁"
                                : "🔒 锁定"}
                            </span>
                          </div>
                          {isUnlocked ? (
                            <p className="hint-level-text">
                              {selectedPuzzle.hints[level]}
                            </p>
                          ) : isNext ? (
                            <button
                              className="action-btn hint-reveal-btn"
                              onClick={() => handleRevealHint(selectedPuzzle.id)}
                            >
                              💡 解锁第 {level + 1} 层提示
                            </button>
                          ) : (
                            <p className="hint-level-locked">请先解锁前面的提示层</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="action-btn clue-close-btn"
                    onClick={() => setHintDetailId(null)}
                  >
                    返回
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div className="modal-overlay" onClick={() => setHintPanelOpen(false)}>
              <div
                className="modal-card hint-panel-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <span className="modal-icon hint-modal-icon">💡</span>
                  <div>
                    <h3>提示中心</h3>
                    <span className="clue-status-tag">
                      卡住了？选择查看方式获取帮助
                    </span>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setHintPanelOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="hint-mode-tabs">
                  <button
                    className={`hint-mode-tab ${hintMode === "browse" ? "hint-mode-tab-active" : ""}`}
                    onClick={() => setHintMode("browse")}
                  >
                    📋 按谜题浏览
                  </button>
                  <button
                    className={`hint-mode-tab ${hintMode === "recommend" ? "hint-mode-tab-active" : ""}`}
                    onClick={() => setHintMode("recommend")}
                  >
                    🎯 下一步推荐
                  </button>
                </div>

                <div className="hint-panel-summary hint-panel-summary-2">
                  <div className="hint-summary-item">
                    <span className="hint-summary-icon">📊</span>
                    <div>
                      <strong>{totalHintCount}</strong>
                      <small>累计使用提示</small>
                    </div>
                  </div>
                  <div className="hint-summary-item">
                    <span className="hint-summary-icon">🧩</span>
                    <div>
                      <strong>{availablePuzzles.length}</strong>
                      <small>待解谜题</small>
                    </div>
                  </div>
                </div>

                {hintMode === "recommend" && (
                  <>
                    {recommendedPuzzles.length > 0 ? (
                      <>
                        <h4 className="hint-section-subtitle">🎯 为你推荐的下一步</h4>
                        <div className="hint-recommend-list">
                          {recommendedPuzzles.map((rec, index) => {
                            const used = engine.hintUsage[rec.puzzle.id] || 0;
                            return (
                              <div
                                key={rec.puzzle.id}
                                className="hint-recommend-item"
                              >
                                <div className="hint-recommend-header">
                                  {index === 0 && (
                                    <span className="hint-recommend-badge hint-recommend-top">🏆 最佳推荐</span>
                                  )}
                                  <span
                                    className="hint-recommend-urgency"
                                    style={{ background: getUrgencyColor(rec.urgency) }}
                                  >
                                    {getUrgencyLabel(rec.urgency)}
                                  </span>
                                </div>
                                <div className="hint-recommend-main">
                                  <span className="hint-puzzle-icon">{rec.puzzle.icon}</span>
                                  <div className="hint-puzzle-info">
                                    <span className="hint-puzzle-title">{rec.puzzle.title}</span>
                                    <div className="hint-recommend-reasons">
                                      {rec.reasons.map((reason, i) => (
                                        <span key={i} className="hint-reason-tag">{reason}</span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="hint-recommend-actions">
                                  <button
                                    className="action-btn hint-action-btn hint-action-primary"
                                    onClick={() => setHintDetailId(rec.puzzle.id)}
                                  >
                                    💡 查看提示
                                  </button>
                                  {rec.puzzle.relatedCellId && (
                                    <button
                                      className="action-btn hint-action-btn hint-action-secondary"
                                      onClick={() => handleJumpToCell(rec)}
                                    >
                                      🚀 立即前往
                                    </button>
                                  )}
                                </div>
                                <div className="hint-recommend-footer">
                                  <div className="hint-puzzle-dots">
                                    {[0, 1, 2].map((i) => (
                                      <span
                                        key={i}
                                        className={`hint-dot ${i < used ? "hint-dot-used" : ""}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="hint-score-text">
                                    推荐度: {rec.score}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="hint-empty-state">
                        <span className="hint-empty-icon">🎉</span>
                        <p className="hint-empty-text">
                          太棒了！当前没有需要推荐的谜题。
                          <br />
                          继续探索，或者直接前往最终大门逃脱！
                        </p>
                      </div>
                    )}
                  </>
                )}

                {hintMode === "browse" && (
                  <>
                    {availablePuzzles.length > 0 && (
                      <>
                        <h4 className="hint-section-subtitle">🔍 当前可求助的谜题</h4>
                        <div className="hint-puzzle-list">
                          {availablePuzzles.map((puzzle) => {
                            const used = engine.hintUsage[puzzle.id] || 0;
                            return (
                              <button
                                key={puzzle.id}
                                className="hint-puzzle-item"
                                onClick={() => setHintDetailId(puzzle.id)}
                              >
                                <span className="hint-puzzle-icon">{puzzle.icon}</span>
                                <div className="hint-puzzle-info">
                                  <span className="hint-puzzle-title">{puzzle.title}</span>
                                  <span className="hint-puzzle-progress">
                                    {used > 0 ? `已查看 ${used}/3 层` : "尚未查看提示"}
                                  </span>
                                </div>
                                <div className="hint-puzzle-dots">
                                  {[0, 1, 2].map((i) => (
                                    <span
                                      key={i}
                                      className={`hint-dot ${i < used ? "hint-dot-used" : ""}`}
                                    />
                                  ))}
                                </div>
                                <span className="hint-puzzle-arrow">›</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {availablePuzzles.length === 0 && (
                      <div className="hint-empty-state">
                        <span className="hint-empty-icon">🎉</span>
                        <p className="hint-empty-text">
                          太棒了！当前没有需要求助的谜题。
                          <br />
                          继续探索，或者直接前往最终大门逃脱！
                        </p>
                      </div>
                    )}
                  </>
                )}

                <p className="hint-footer-note">
                  💡 「下一步推荐」会根据你当前的房间、物品栏、机关状态自动推荐最适合的谜题。
                  提示系统按层级渐进解锁，尽量保持解谜的乐趣！
                </p>
              </div>
            </div>
          );
        })()}
      {clueBookOpen &&
        (() => {
          if (clueBookDetailItemId) {
            const detailItem = CONFIG.items[clueBookDetailItemId];
            if (!detailItem) return null;
            return (
              <div className="modal-overlay" onClick={() => setClueBookDetailItemId(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <span className="modal-icon">{detailItem.icon}</span>
                    <div>
                      <h3>{detailItem.name}</h3>
                      <span
                        className="item-tag"
                        style={{ color: CONFIG.categoryColors[detailItem.category] }}
                      >
                        {CONFIG.categoryLabels[detailItem.category]}
                      </span>
                    </div>
                    <button className="modal-close" onClick={() => setClueBookDetailItemId(null)}>
                      ✕
                    </button>
                  </div>
                  <p className="modal-desc">{detailItem.description}</p>
                  <div className="modal-detail">
                    {detailItem.detail.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <button
                    className="action-btn clue-close-btn"
                    onClick={() => setClueBookDetailItemId(null)}
                  >
                    返回线索册
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div className="modal-overlay" onClick={() => setClueBookOpen(false)}>
              <div
                className="modal-card clue-book-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <span className="modal-icon clue-book-icon">📖</span>
                  <div>
                    <h3>线索册</h3>
                    <span className="clue-status-tag">
                      已发现 {foundClueCount}/{totalClueCount} 条线索
                    </span>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setClueBookOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="clue-book-groups">
                  {CONFIG.clueBook.map((group) => {
                    const groupFoundCount = group.entries.filter((e) => isClueRevealed(e)).length;
                    return (
                      <div key={group.id} className="clue-book-group">
                        <div className="clue-book-group-header">
                          <span className="clue-book-group-icon">{group.icon}</span>
                          <span className="clue-book-group-name">{group.name}</span>
                          <span className="clue-book-group-count">
                            {groupFoundCount}/{group.entries.length}
                          </span>
                        </div>
                        <div className="clue-book-entry-list">
                          {group.entries.map((entry) => {
                            const revealed = isClueRevealed(entry);
                            const sourceItem = entry.sourceItemId ? CONFIG.items[entry.sourceItemId] : null;
                            return (
                              <button
                                key={entry.id}
                                className={`clue-book-entry ${revealed ? "clue-revealed" : "clue-hidden"}`}
                                disabled={!revealed}
                                onClick={() => {
                                  if (revealed && entry.sourceItemId) {
                                    setClueBookDetailItemId(entry.sourceItemId);
                                  }
                                }}
                              >
                                <span className="clue-entry-icon">
                                  {revealed ? entry.icon : "❓"}
                                </span>
                                <div className="clue-entry-info">
                                  <span className="clue-entry-title">
                                    {revealed ? entry.title : "??? 未发现"}
                                  </span>
                                  <span className="clue-entry-desc">
                                    {revealed
                                      ? entry.description
                                      : "继续探索以发现这条线索..."}
                                  </span>
                                </div>
                                {revealed && entry.sourceItemId && (
                                  <span className="clue-entry-arrow">›</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      {roomProgressModalRoomId &&
        (() => {
          const room = CONFIG.rooms.find((r) => r.id === roomProgressModalRoomId);
          if (!room) return null;
          const progress = getRoomProgress(room);
          return (
            <div
              className="modal-overlay"
              onClick={() => setRoomProgressModalRoomId(null)}
            >
              <div
                className="modal-card room-progress-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <span className="modal-icon">📊</span>
                  <div>
                    <h3>{room.name} · 探索进度</h3>
                    <span className="clue-status-tag">
                      已完成 {progress.checked}/{progress.total}，剩余 {progress.remaining} 处未彻底调查
                    </span>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setRoomProgressModalRoomId(null)}
                  >
                    ✕
                  </button>
                </div>
                {progress.uncheckedCells.length > 0 && (
                  <div className="room-progress-section">
                    <h4 className="room-progress-section-title">
                      ⏳ 尚未彻底调查的区域（{progress.uncheckedCells.length}）
                    </h4>
                    <div className="room-progress-cell-list">
                      {progress.uncheckedCells.map((cell) => (
                        <div
                          key={cell.id}
                          className={`room-progress-cell-item ${cell.isLocked ? "cell-item-locked" : "cell-item-investigating"}`}
                          onClick={() => {
                            setRoomProgressModalRoomId(null);
                            if (engine.currentRoomId !== room.id) {
                              engine.switchRoom(room.id);
                            }
                            setClueModalCellId(cell.id);
                          }}
                        >
                          <span className="cell-item-icon">{cell.icon}</span>
                          <div className="cell-item-info">
                            <span className="cell-item-label">{cell.label}</span>
                            <span className={`cell-item-status ${cell.isLocked ? "status-locked" : "status-pending"}`}>
                              {cell.isLocked
                                ? `🔒 ${cell.lockReason || "暂未解锁"}`
                                : "👁️ 可继续探索"}
                            </span>
                          </div>
                          <span className="cell-item-arrow">›</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {progress.checkedCells.length > 0 && (
                  <div className="room-progress-section">
                    <h4 className="room-progress-section-title room-progress-section-done">
                      ✓ 已彻底调查的区域（{progress.checkedCells.length}）
                    </h4>
                    <div className="room-progress-cell-list room-progress-cell-list-done">
                      {progress.checkedCells.map((cell) => (
                        <div
                          key={cell.id}
                          className="room-progress-cell-item cell-item-done"
                        >
                          <span className="cell-item-icon">{cell.icon}</span>
                          <div className="cell-item-info">
                            <span className="cell-item-label">{cell.label}</span>
                            <span className="cell-item-status status-done">✓ 已完成</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {progress.remaining === 0 && (
                  <div className="room-progress-all-done">
                    <div className="all-done-icon">🎉</div>
                    <p className="all-done-text">太棒了！这个房间的所有区域都已被你彻底调查完毕！</p>
                  </div>
                )}
                <button
                  className="action-btn clue-close-btn"
                  onClick={() => setRoomProgressModalRoomId(null)}
                >
                  知道了
                </button>
              </div>
            </div>
          );
        })()}
      <section className="result-panel">
        <h2>探索进度</h2>
        <p>{progressText}</p>
        {engine.lastHint && (
          <div className="last-hint">
            <span className="last-hint-label">💡 最近提示</span>
            <span className="last-hint-text">{engine.lastHint}</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
