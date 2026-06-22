import type { GameConfig, SaveSlotMeta } from "../puzzle-engine/types";

export interface StartScreenProps {
  config: GameConfig;
  slotMetas: SaveSlotMeta[];
  formatElapsed: (ms: number) => string;
  formatSaveTime: (ts: number) => string;
  onContinue: (slotIndex: number) => void;
  onNewGame: (slotIndex: number) => void;
  onDeleteSlot: (slotIndex: number) => void;
  onShowMessage: (text: string, type?: "info" | "collect" | "empty" | "error") => void;
}

export function StartScreen({
  config,
  slotMetas,
  formatElapsed,
  formatSaveTime,
  onContinue,
  onNewGame,
  onDeleteSlot,
  onShowMessage,
}: StartScreenProps) {
  return (
    <main className="game-shell">
      <section className="hero">
        <p>密室文字逃脱 · H5Game</p>
        <h1>{config.title}</h1>
        <span>{config.subtitle}</span>
      </section>
      <section className="start-panel">
        <div className="start-icon">🔐</div>
        <h2>{config.intro.title}</h2>
        <p className="start-desc">{config.intro.description}</p>
        <div className="save-slot-list">
          {slotMetas.map((meta) => (
            <div key={meta.slotIndex} className="save-slot-card">
              <div className="save-slot-header">
                <span className="save-slot-number">存档 {meta.slotIndex + 1}</span>
                {meta.hasData ? (
                  <span className="save-slot-badge save-slot-badge-used">已有存档</span>
                ) : (
                  <span className="save-slot-badge save-slot-badge-empty">空</span>
                )}
              </div>
              {meta.hasData ? (
                <div className="save-slot-info">
                  <div className="save-slot-info-row">
                    <span className="save-slot-info-icon">🏠</span>
                    <span>{meta.roomName || "未知"}</span>
                  </div>
                  <div className="save-slot-info-row">
                    <span className="save-slot-info-icon">⏱️</span>
                    <span>{formatElapsed(meta.elapsedMs)}</span>
                  </div>
                  <div className="save-slot-info-row">
                    <span className="save-slot-info-icon">📝</span>
                    <span>线索 {meta.clueCount}</span>
                  </div>
                  <div className="save-slot-info-row">
                    <span className="save-slot-info-icon">{meta.escaped ? "🚪" : "🔒"}</span>
                    <span>{meta.escaped ? "已逃脱" : "未逃脱"}</span>
                  </div>
                  <div className="save-slot-info-row save-slot-time">
                    <span className="save-slot-info-icon">💾</span>
                    <span>{formatSaveTime(meta.savedAt)}</span>
                  </div>
                </div>
              ) : (
                <div className="save-slot-empty-info">尚未使用此存档位</div>
              )}
              <div className="save-slot-actions">
                {meta.hasData ? (
                  <>
                    <button
                      className="action-btn save-slot-btn save-slot-continue-btn"
                      onClick={() => onContinue(meta.slotIndex)}
                    >
                      📂 继续
                    </button>
                    <button
                      className="action-btn save-slot-btn save-slot-delete-btn"
                      onClick={() => {
                        if (
                          confirm(
                            "确定删除存档 " +
                              (meta.slotIndex + 1) +
                              " 吗？此操作不可恢复。"
                          )
                        ) {
                          onDeleteSlot(meta.slotIndex);
                          onShowMessage(
                            "🗑️ 存档 " + (meta.slotIndex + 1) + " 已删除",
                            "info"
                          );
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </>
                ) : (
                  <button
                    className="action-btn save-slot-btn save-slot-new-btn"
                    onClick={() => onNewGame(meta.slotIndex)}
                  >
                    🎮 新游戏
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
