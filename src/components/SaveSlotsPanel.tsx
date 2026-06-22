import type { SaveSlotMeta } from "../puzzle-engine/types";

export interface SaveSlotsPanelProps {
  saveSlotPanelOpen: boolean;
  slotMetas: SaveSlotMeta[];
  currentSlot: number | null;
  formatElapsed: (ms: number) => string;
  formatSaveTime: (ts: number) => string;
  onClose: () => void;
  onSave: (slotIndex: number) => void;
  onLoad: (slotIndex: number) => void;
  onDelete: (slotIndex: number) => void;
  onShowMessage: (text: string, type?: "info" | "collect" | "empty" | "error") => void;
  setCurrentSlot: (slot: number | null) => void;
}

export function SaveSlotsPanel({
  saveSlotPanelOpen,
  slotMetas,
  currentSlot,
  formatElapsed,
  formatSaveTime,
  onClose,
  onSave,
  onLoad,
  onDelete,
  onShowMessage,
  setCurrentSlot,
}: SaveSlotsPanelProps) {
  if (!saveSlotPanelOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card save-panel-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">💾</span>
          <div>
            <h3>存档管理</h3>
            <span className="clue-status-tag">
              当前活动槽位：{currentSlot !== null ? "存档 " + (currentSlot + 1) : "未选择"}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="save-panel-hint">
          手动保存模式：游戏不会自动存档，请随时保存进度。
        </p>
        <div className="save-slot-modal-list">
          {slotMetas.map((meta) => {
            const isCurrent = meta.slotIndex === currentSlot;
            return (
              <div
                key={meta.slotIndex}
                className={`save-slot-modal-card ${
                  isCurrent ? "save-slot-modal-current" : ""
                }`}
              >
                <div className="save-slot-modal-top">
                  <span className="save-slot-number">存档 {meta.slotIndex + 1}</span>
                  {isCurrent && (
                    <span className="save-slot-current-tag">活动中</span>
                  )}
                  {meta.hasData && !isCurrent && (
                    <span className="save-slot-badge save-slot-badge-used">已有存档</span>
                  )}
                  {!meta.hasData && (
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
                      <span className="save-slot-info-icon">
                        {meta.escaped ? "🚪" : "🔒"}
                      </span>
                      <span>{meta.escaped ? "已逃脱" : "未逃脱"}</span>
                    </div>
                    <div className="save-slot-info-row save-slot-time">
                      <span className="save-slot-info-icon">💾</span>
                      <span>保存于 {formatSaveTime(meta.savedAt)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="save-slot-empty-info">空存档位</div>
                )}
                <div className="save-slot-modal-actions">
                  <button
                    className="action-btn save-slot-btn save-slot-save-btn"
                    onClick={() => {
                      if (
                        meta.hasData &&
                        !confirm(`确定覆盖存档 ${meta.slotIndex + 1} 吗？`)
                      ) {
                        return;
                      }
                      onSave(meta.slotIndex);
                      setCurrentSlot(meta.slotIndex);
                      onShowMessage(
                        "💾 已保存到存档 " + (meta.slotIndex + 1),
                        "info"
                      );
                    }}
                  >
                    💾 {meta.hasData ? "覆盖保存" : "保存至此"}
                  </button>
                  <button
                    className="action-btn save-slot-btn save-slot-load-btn"
                    disabled={!meta.hasData}
                    onClick={() => onLoad(meta.slotIndex)}
                  >
                    📂 读取
                  </button>
                  {meta.hasData && (
                    <button
                      className="action-btn save-slot-btn save-slot-delete-btn"
                      onClick={() => {
                        if (
                          confirm(
                            "确定删除存档 " + (meta.slotIndex + 1) + " 吗？"
                          )
                        ) {
                          onDelete(meta.slotIndex);
                          if (isCurrent) {
                            setCurrentSlot(null);
                          }
                          onShowMessage(
                            "🗑️ 存档 " + (meta.slotIndex + 1) + " 已删除",
                            "info"
                          );
                        }
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button className="action-btn clue-close-btn" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
}
