import { useState, useMemo } from "react";
import type { PuzzleEngine, GameConfig, LockDef, CellDef } from "./puzzle-engine/types";

interface DebugPanelProps {
  engine: PuzzleEngine;
  config: GameConfig;
  onResetUI: () => void;
}

interface DebugCheckpoint {
  id: string;
  name: string;
  description: string;
  icon: string;
  apply: (engine: PuzzleEngine) => void;
}

export function DebugPanel({ engine, config, onResetUI }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "flags" | "rooms" | "locks" | "hints" | "checkpoints">("inventory");

  const allCells = useMemo(() => {
    const cells: CellDef[] = [];
    for (const room of config.rooms) {
      cells.push(...room.cells);
    }
    return cells;
  }, [config]);

  const allLocks = useMemo(() => {
    const locks: LockDef[] = [];
    for (const room of config.rooms) {
      locks.push(...room.locks);
    }
    return locks;
  }, [config]);

  const checkpoints: DebugCheckpoint[] = [
    {
      id: "fresh_start",
      name: "游戏开始",
      description: "重置到初始状态",
      icon: "🎮",
      apply: (engine) => {
        engine.reset();
      },
    },
    {
      id: "study_basic",
      name: "书房基础探索完成",
      description: "获得书架线索、打开抽屉、取下挂画、撬开箱子",
      icon: "📚",
      apply: (engine) => {
        engine.debugSetState({
          inventory: [
            "note_bookshelf",
            "note_drawer",
            "screwdriver",
            "battery",
            "frag_a",
            "frag_b",
          ],
          flags: {
            drawerUnlocked: true,
            paintingRemoved: true,
            boxOpened: true,
          },
          cellStageIds: {
            ...engine.cellStageIds,
            bookshelf: "empty",
            drawer: "empty",
            painting: "has_hidden",
            vase: "empty",
            box: "has_frag",
          },
        });
      },
    },
    {
      id: "secret_door_open",
      name: "暗门开启",
      description: "书房探索完成，暗门已开启，可进入储物间",
      icon: "🚪",
      apply: (engine) => {
        engine.debugSetState({
          inventory: [
            "note_bookshelf",
            "note_drawer",
            "screwdriver",
            "battery",
            "flashlight",
            "frag_a",
            "frag_b",
            "frag_c",
            "complete_key",
            "note_curtain",
          ],
          flags: {
            drawerUnlocked: true,
            paintingRemoved: true,
            boxOpened: true,
            curtainChecked: true,
            secretDoorOpened: true,
            fragment1Found: true,
            fragment2Found: true,
            fragment3Found: true,
          },
          cellStageIds: {
            ...engine.cellStageIds,
            bookshelf: "empty",
            drawer: "empty",
            painting: "has_hidden",
            vase: "empty",
            box: "has_frag",
            lamp: "empty",
            curtain: "has_hidden",
            secret_door: "open",
          },
          currentRoomId: "room_study",
        });
      },
    },
    {
      id: "storage_basic",
      name: "储物间基础探索",
      description: "工作台、储物架、档案柜已探索",
      icon: "📦",
      apply: (engine) => {
        engine.debugSetState({
          inventory: [
            "note_bookshelf",
            "note_drawer",
            "screwdriver",
            "battery",
            "flashlight",
            "powered_flashlight",
            "frag_a",
            "frag_b",
            "frag_c",
            "complete_key",
            "note_curtain",
            "note_carpet",
            "note_shelf",
            "wire_cutters",
            "circuit_board",
            "note_workbench",
            "note_cabinet",
          ],
          flags: {
            drawerUnlocked: true,
            paintingRemoved: true,
            boxOpened: true,
            curtainChecked: true,
            secretDoorOpened: true,
            workbenchOpened: true,
            cabinetOpened: true,
            fragment1Found: true,
            fragment2Found: true,
            fragment3Found: true,
            circuitBoardInserted: true,
            flashlightActive: false,
          },
          cellStageIds: {
            ...engine.cellStageIds,
            bookshelf: "empty",
            drawer: "empty",
            painting: "has_hidden",
            vase: "empty",
            box: "has_frag",
            lamp: "empty",
            curtain: "has_hidden",
            secret_door: "open",
            carpet: "empty",
            workbench: "empty",
            shelf: "empty",
            filing_cabinet: "empty",
            final_door: "need_method",
          },
          currentRoomId: "room_storage",
        });
      },
    },
    {
      id: "normal_ending_key_ready",
      name: "普通结局（钥匙路线）就绪",
      description: "组合钥匙已完成，可直接用钥匙开锁逃脱",
      icon: "🔑",
      apply: (engine) => {
        engine.debugSetState({
          inventory: [
            "note_bookshelf",
            "note_drawer",
            "screwdriver",
            "battery",
            "flashlight",
            "powered_flashlight",
            "frag_a",
            "frag_b",
            "frag_c",
            "complete_key",
            "key_core",
            "assembled_key",
            "note_curtain",
            "note_carpet",
            "note_shelf",
            "wire_cutters",
            "circuit_board",
            "note_workbench",
            "note_cabinet",
            "note_dark",
          ],
          flags: {
            drawerUnlocked: true,
            paintingRemoved: true,
            boxOpened: true,
            curtainChecked: true,
            secretDoorOpened: true,
            workbenchOpened: true,
            cabinetOpened: true,
            ventOpened: true,
            fragment1Found: true,
            fragment2Found: true,
            fragment3Found: true,
            circuitBoardInserted: true,
            flashlightActive: false,
          },
          cellStageIds: {
            ...engine.cellStageIds,
            bookshelf: "empty",
            drawer: "empty",
            painting: "has_hidden",
            vase: "empty",
            box: "has_frag",
            lamp: "empty",
            curtain: "has_hidden",
            secret_door: "open",
            carpet: "empty",
            workbench: "has_hidden",
            shelf: "has_hidden",
            filing_cabinet: "empty",
            vent: "empty",
            dark_corner: "empty",
            final_door: "ready",
          },
          currentRoomId: "room_storage",
          combineCount: 3,
        });
      },
    },
    {
      id: "normal_ending_password_ready",
      name: "普通结局（密码路线）就绪",
      description: "电路板已插入，密码已获得，可直接输入 8523 逃脱",
      icon: "🔢",
      apply: (engine) => {
        engine.debugSetState({
          inventory: [
            "note_bookshelf",
            "note_drawer",
            "screwdriver",
            "battery",
            "flashlight",
            "powered_flashlight",
            "frag_a",
            "frag_b",
            "frag_c",
            "complete_key",
            "note_curtain",
            "note_carpet",
            "note_shelf",
            "wire_cutters",
            "circuit_board",
            "note_workbench",
            "note_cabinet",
            "note_dark",
          ],
          flags: {
            drawerUnlocked: true,
            paintingRemoved: true,
            boxOpened: true,
            curtainChecked: true,
            secretDoorOpened: true,
            workbenchOpened: true,
            cabinetOpened: true,
            ventOpened: true,
            fragment1Found: true,
            fragment2Found: true,
            fragment3Found: true,
            circuitBoardInserted: true,
            flashlightActive: false,
          },
          cellStageIds: {
            ...engine.cellStageIds,
            bookshelf: "empty",
            drawer: "empty",
            painting: "has_hidden",
            vase: "empty",
            box: "has_frag",
            lamp: "empty",
            curtain: "has_hidden",
            secret_door: "open",
            carpet: "empty",
            workbench: "has_hidden",
            shelf: "has_hidden",
            filing_cabinet: "empty",
            vent: "empty",
            dark_corner: "empty",
            final_door: "ready",
          },
          currentRoomId: "room_storage",
          combineCount: 2,
        });
      },
    },
    {
      id: "true_ending_ready",
      name: "真结局就绪",
      description: "所有隐藏线索已收集，可输入隐藏密码 48256 解锁真结局",
      icon: "🌟",
      apply: (engine) => {
        engine.debugSetState({
          inventory: [
            "note_bookshelf",
            "note_drawer",
            "screwdriver",
            "battery",
            "flashlight",
            "powered_flashlight",
            "frag_a",
            "frag_b",
            "frag_c",
            "complete_key",
            "key_core",
            "assembled_key",
            "note_curtain",
            "note_carpet",
            "note_shelf",
            "wire_cutters",
            "circuit_board",
            "note_workbench",
            "note_cabinet",
            "note_dark",
            "note_hidden_curtain",
            "note_hidden_painting",
            "note_hidden_lamp",
            "note_hidden_shelf",
            "note_hidden_workbench",
          ],
          flags: {
            drawerUnlocked: true,
            paintingRemoved: true,
            boxOpened: true,
            curtainChecked: true,
            secretDoorOpened: true,
            workbenchOpened: true,
            cabinetOpened: true,
            ventOpened: true,
            fragment1Found: true,
            fragment2Found: true,
            fragment3Found: true,
            circuitBoardInserted: true,
            flashlightActive: false,
          },
          cellStageIds: {
            ...engine.cellStageIds,
            bookshelf: "empty",
            drawer: "empty",
            painting: "empty",
            vase: "empty",
            box: "empty",
            lamp: "empty",
            curtain: "empty",
            secret_door: "open",
            carpet: "empty",
            workbench: "empty",
            shelf: "empty",
            filing_cabinet: "empty",
            vent: "empty",
            dark_corner: "empty",
            final_door: "ready",
          },
          currentRoomId: "room_storage",
          combineCount: 3,
        });
      },
    },
  ];

  const applyCheckpoint = (checkpoint: DebugCheckpoint) => {
    if (!confirm(`确定要跳转到「${checkpoint.name}」吗？当前进度将被覆盖。`)) {
      return;
    }
    checkpoint.apply(engine);
    onResetUI();
    engine.setGameStartTime(Date.now());
    setIsOpen(false);
  };

  const formatCondition = (cond: any): string => {
    if (!cond) return "无";
    if (cond.type === "hasItem") return `需要物品: ${cond.itemId}`;
    if (cond.type === "notHasItem") return `未拥有物品: ${cond.itemId}`;
    if (cond.type === "flagTrue") return `标志: ${cond.flagId} = true`;
    if (cond.type === "flagFalse") return `标志: ${cond.flagId} = false`;
    if (cond.type === "all" && cond.conditions) {
      return cond.conditions.map(formatCondition).join(" AND ");
    }
    if (cond.type === "any" && cond.conditions) {
      return cond.conditions.map(formatCondition).join(" OR ");
    }
    return JSON.stringify(cond);
  };

  const getLockStatus = (lock: LockDef) => {
    const canSubmit = !lock.beforeSubmit || engine.checkCondition(lock.beforeSubmit);
    const hasClue = lock.clueItemIds?.some((id) => engine.hasItem(id)) ?? false;
    return { canSubmit, hasClue };
  };

  if (!isOpen) {
    return (
      <button
        className="debug-toggle-btn"
        onClick={() => setIsOpen(true)}
        title="打开调试面板"
      >
        🔧 调试
      </button>
    );
  }

  return (
    <div className="debug-panel-overlay">
      <div className="debug-panel">
        <div className="debug-panel-header">
          <h2>🔧 游戏调试面板</h2>
          <button
            className="debug-close-btn"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="debug-tabs">
          {[
            { key: "inventory", label: "🎒 物品" },
            { key: "flags", label: "🚩 标志" },
            { key: "rooms", label: "🏠 房间/单元格" },
            { key: "locks", label: "🔒 锁" },
            { key: "hints", label: "💡 提示" },
            { key: "checkpoints", label: "⏩ 跳转" },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`debug-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="debug-content">
          {activeTab === "inventory" && (
            <div className="debug-section">
              <div className="debug-section-header">
                <h3>当前物品栏 ({engine.inventory.length} 件)</h3>
                <span className="debug-section-subtitle">点击物品可移除</span>
              </div>
              <div className="debug-item-list">
                {engine.inventory.length === 0 ? (
                  <p className="debug-empty">物品栏为空</p>
                ) : (
                  engine.inventory.map((itemId) => {
                    const item = config.items[itemId];
                    return (
                      <div
                        key={itemId}
                        className="debug-item"
                        onClick={() => engine.debugRemoveItem(itemId)}
                        title="点击移除"
                      >
                        <span className="debug-item-icon">{item?.icon ?? "❓"}</span>
                        <div className="debug-item-info">
                          <span className="debug-item-name">{item?.name ?? itemId}</span>
                          <span className="debug-item-id">{itemId}</span>
                        </div>
                        <span className="debug-item-remove">✕</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="debug-section-header">
                <h3>添加物品</h3>
                <span className="debug-section-subtitle">点击添加到物品栏</span>
              </div>
              <div className="debug-item-list">
                {Object.values(config.items)
                  .filter((item) => !engine.inventory.includes(item.id))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="debug-item debug-item-add"
                      onClick={() => engine.debugGiveItem(item.id)}
                      title="点击添加"
                    >
                      <span className="debug-item-icon">{item.icon}</span>
                      <div className="debug-item-info">
                        <span className="debug-item-name">{item.name}</span>
                        <span className="debug-item-id">{item.id}</span>
                      </div>
                      <span className="debug-item-add-icon">+</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "flags" && (
            <div className="debug-section">
              <div className="debug-section-header">
                <h3>当前标志状态</h3>
                <span className="debug-section-subtitle">点击切换 true/false</span>
              </div>
              <div className="debug-flag-list">
                {Object.entries(engine.flags).length === 0 ? (
                  <p className="debug-empty">暂无标志</p>
                ) : (
                  Object.entries(engine.flags)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([flagId, value]) => (
                      <div
                        key={flagId}
                        className={`debug-flag ${value ? "flag-true" : "flag-false"}`}
                        onClick={() => engine.debugSetFlag(flagId, !value)}
                      >
                        <span className="debug-flag-name">{flagId}</span>
                        <span className={`debug-flag-value ${value ? "value-true" : "value-false"}`}>
                          {value ? "✓ TRUE" : "✗ FALSE"}
                        </span>
                      </div>
                    ))
                )}
              </div>

              <div className="debug-section-header">
                <h3>快速设置标志</h3>
              </div>
              <div className="debug-flag-quick">
                {[
                  "drawerUnlocked",
                  "paintingRemoved",
                  "boxOpened",
                  "curtainChecked",
                  "secretDoorOpened",
                  "workbenchOpened",
                  "cabinetOpened",
                  "ventOpened",
                  "circuitBoardInserted",
                  "flashlightActive",
                  "fragment1Found",
                  "fragment2Found",
                  "fragment3Found",
                ].map((flagId) => (
                  <button
                    key={flagId}
                    className={`debug-quick-btn ${engine.flags[flagId] ? "active" : ""}`}
                    onClick={() => engine.debugSetFlag(flagId, !engine.flags[flagId])}
                  >
                    {flagId}: {engine.flags[flagId] ? "TRUE" : "FALSE"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "rooms" && (
            <div className="debug-section">
              <div className="debug-section-header">
                <h3>当前房间</h3>
              </div>
              <div className="debug-current-room">
                <span className="debug-room-icon">🏠</span>
                <div>
                  <div className="debug-room-name">
                    {config.rooms.find((r) => r.id === engine.currentRoomId)?.name ??
                      engine.currentRoomId}
                  </div>
                  <div className="debug-room-id">{engine.currentRoomId}</div>
                </div>
              </div>

              <div className="debug-section-header">
                <h3>切换房间</h3>
              </div>
              <div className="debug-room-switch">
                {config.rooms.map((room) => {
                  const isLocked =
                    room.id !== config.rooms[0]?.id && !engine.flags.secretDoorOpened;
                  return (
                    <button
                      key={room.id}
                      className={`debug-room-btn ${engine.currentRoomId === room.id ? "active" : ""} ${isLocked ? "locked" : ""}`}
                      onClick={() => !isLocked && engine.switchRoom(room.id)}
                      disabled={isLocked}
                    >
                      {isLocked ? "🔒" : "🏠"} {room.name}
                    </button>
                  );
                })}
              </div>

              <div className="debug-section-header">
                <h3>单元格阶段 ({allCells.length} 个)</h3>
                <span className="debug-section-subtitle">点击查看详情，可手动切换阶段</span>
              </div>
              <div className="debug-cell-list">
                {allCells.map((cell) => {
                  const currentStageId = engine.cellStageIds[cell.id] ?? cell.initialStageId;
                  const currentStage = cell.stages[currentStageId];
                  return (
                    <div key={cell.id} className="debug-cell">
                      <div className="debug-cell-header">
                        <span className="debug-cell-icon">{cell.icon}</span>
                        <div className="debug-cell-info">
                          <span className="debug-cell-name">{cell.label}</span>
                          <span className="debug-cell-id">{cell.id}</span>
                        </div>
                        <span className="debug-cell-stage">
                          阶段: {currentStageId}
                        </span>
                      </div>
                      {currentStage && (
                        <div className="debug-cell-stage-info">
                          <div className="debug-cell-status">
                            <span
                              className={`status-badge ${currentStage.isLocked ? "locked" : "unlocked"}`}
                            >
                              {currentStage.isLocked ? "🔒 锁定" : "🔓 解锁"}
                            </span>
                            {currentStage.alreadyChecked && (
                              <span className="status-badge checked">✓ 已完成</span>
                            )}
                          </div>
                          {currentStage.requires && (
                            <div className="debug-cell-condition">
                              <span className="condition-label">解锁条件:</span>
                              <span className="condition-text">
                                {formatCondition(currentStage.requires)}
                              </span>
                              <span className={`condition-status ${engine.checkCondition(currentStage.requires) ? "met" : "not-met"}`}>
                                {engine.checkCondition(currentStage.requires) ? "✓ 已满足" : "✗ 未满足"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="debug-cell-stages">
                        {Object.keys(cell.stages).map((stageId) => (
                          <button
                            key={stageId}
                            className={`debug-stage-btn ${currentStageId === stageId ? "active" : ""}`}
                            onClick={() => engine.debugSetCellStage(cell.id, stageId)}
                          >
                            {stageId}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "locks" && (
            <div className="debug-section">
              <div className="debug-section-header">
                <h3>所有锁状态 ({allLocks.length} 个)</h3>
              </div>
              <div className="debug-lock-list">
                {allLocks.map((lock) => {
                  const status = getLockStatus(lock);
                  const lockUIInfo = engine.getLockUIInfo(lock.id);
                  return (
                    <div key={lock.id} className="debug-lock">
                      <div className="debug-lock-header">
                        <span className="debug-lock-icon">{lock.icon}</span>
                        <div className="debug-lock-info">
                          <span className="debug-lock-name">{lock.label}</span>
                          <span className="debug-lock-id">{lock.id}</span>
                        </div>
                        <div className="debug-lock-status">
                          <span
                            className={`status-badge ${status.canSubmit ? "unlocked" : "locked"}`}
                          >
                            {status.canSubmit ? "🔓 可提交" : "🔒 条件未满足"}
                          </span>
                        </div>
                      </div>
                      <div className="debug-lock-details">
                        <div className="debug-lock-row">
                          <span className="debug-lock-label">密码:</span>
                          <span className="debug-lock-password">{lock.password}</span>
                          <span className="debug-lock-digits">({lock.digits}位)</span>
                        </div>
                        {lock.beforeSubmit && (
                          <div className="debug-lock-row">
                            <span className="debug-lock-label">前置条件:</span>
                            <span className="debug-lock-condition">
                              {formatCondition(lock.beforeSubmit)}
                            </span>
                          </div>
                        )}
                        {lock.clueItemIds && lock.clueItemIds.length > 0 && (
                          <div className="debug-lock-row">
                            <span className="debug-lock-label">线索物品:</span>
                            <div className="debug-lock-clues">
                              {lock.clueItemIds.map((itemId) => {
                                const has = engine.hasItem(itemId);
                                const item = config.items[itemId];
                                return (
                                  <span
                                    key={itemId}
                                    className={`clue-tag ${has ? "has" : "missing"}`}
                                  >
                                    {has ? "✓" : "✗"} {item?.name ?? itemId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {lock.keyUnlock && (
                          <div className="debug-lock-row">
                            <span className="debug-lock-label">钥匙解锁:</span>
                            <span className="debug-lock-key">
                              {lockUIInfo.keyUnlock?.canUse ? "✓ 可用" : "✗ 不可用"}
                              {lockUIInfo.keyUnlock?.reason && ` - ${lockUIInfo.keyUnlock.reason}`}
                            </span>
                          </div>
                        )}
                        {lock.hiddenPassword && (
                          <div className="debug-lock-row">
                            <span className="debug-lock-label">隐藏密码:</span>
                            <span className="debug-lock-hidden">
                              {lockUIInfo.hiddenPassword?.canShow ? "✓ 可显示" : "✗ 未解锁"}
                              {lockUIInfo.hiddenPassword?.canShow &&
                                ` - 密码: ${lockUIInfo.hiddenPassword.password}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "hints" && (
            <div className="debug-section">
              <div className="debug-section-header">
                <h3>提示谜题状态 ({config.hintPuzzles.length} 个)</h3>
              </div>
              <div className="debug-hint-list">
                {config.hintPuzzles.map((puzzle) => {
                  const isCompleted = engine.checkCondition(puzzle.completedCondition);
                  const isAvailable = engine.checkCondition(puzzle.availableCondition);
                  const usedLevels = engine.hintUsage[puzzle.id] || 0;
                  return (
                    <div
                      key={puzzle.id}
                      className={`debug-hint ${isCompleted ? "completed" : isAvailable ? "available" : "unavailable"}`}
                    >
                      <div className="debug-hint-header">
                        <span className="debug-hint-icon">{puzzle.icon}</span>
                        <div className="debug-hint-info">
                          <span className="debug-hint-name">{puzzle.title}</span>
                          <span className="debug-hint-id">{puzzle.id}</span>
                        </div>
                        <div className="debug-hint-status">
                          <span
                            className={`status-badge ${isCompleted ? "checked" : isAvailable ? "unlocked" : "locked"}`}
                          >
                            {isCompleted ? "✓ 已完成" : isAvailable ? "🔓 可求助" : "🔒 未解锁"}
                          </span>
                        </div>
                      </div>
                      <div className="debug-hint-details">
                        <div className="debug-hint-levels">
                          {[0, 1, 2].map((level) => (
                            <span
                              key={level}
                              className={`hint-dot ${level < usedLevels ? "used" : ""}`}
                              title={`第 ${level + 1} 层提示`}
                            />
                          ))}
                          <span className="hint-level-text">
                            已查看 {usedLevels}/3 层
                          </span>
                        </div>
                        {puzzle.relatedRoomId && (
                          <div className="debug-hint-row">
                            <span className="debug-hint-label">关联房间:</span>
                            <span>
                              {config.rooms.find((r) => r.id === puzzle.relatedRoomId)?.name ??
                                puzzle.relatedRoomId}
                            </span>
                          </div>
                        )}
                        {puzzle.relatedCellId && (
                          <div className="debug-hint-row">
                            <span className="debug-hint-label">关联单元格:</span>
                            <span>{puzzle.relatedCellId}</span>
                          </div>
                        )}
                        <div className="debug-hint-row">
                          <span className="debug-hint-label">可用条件:</span>
                          <span className="debug-hint-condition">
                            {formatCondition(puzzle.availableCondition)}
                          </span>
                        </div>
                        <div className="debug-hint-row">
                          <span className="debug-hint-label">完成条件:</span>
                          <span className="debug-hint-condition">
                            {formatCondition(puzzle.completedCondition)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "checkpoints" && (
            <div className="debug-section">
              <div className="debug-section-header">
                <h3>快速跳转关键节点</h3>
                <span className="debug-section-subtitle">点击跳转到对应进度</span>
              </div>
              <div className="debug-checkpoint-list">
                {checkpoints.map((cp) => (
                  <div key={cp.id} className="debug-checkpoint">
                    <div className="debug-checkpoint-icon">{cp.icon}</div>
                    <div className="debug-checkpoint-info">
                      <h4 className="debug-checkpoint-name">{cp.name}</h4>
                      <p className="debug-checkpoint-desc">{cp.description}</p>
                    </div>
                    <button
                      className="debug-checkpoint-btn"
                      onClick={() => applyCheckpoint(cp)}
                    >
                      ⏩ 跳转
                    </button>
                  </div>
                ))}
              </div>

              <div className="debug-warning">
                <strong>⚠️ 注意：</strong>跳转会覆盖当前游戏进度，且会重置游戏开始时间。
                跳转后会自动执行 autoAdvance 来更新相关单元格状态。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
