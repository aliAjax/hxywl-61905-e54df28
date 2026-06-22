import type { GameConfig, RoomDef } from "../puzzle-engine/types";
import type { RoomProgressResult } from "../hooks/useClueAndHints";

export interface RoomProgressModalProps {
  config: GameConfig;
  engine: any;
  roomProgressModalRoomId: string | null;
  getRoomProgress: (room: RoomDef) => RoomProgressResult;
  onClose: () => void;
  onJumpToCell: (roomId: string, cellId: string) => void;
}

export function RoomProgressModal({
  config,
  engine,
  roomProgressModalRoomId,
  getRoomProgress,
  onClose,
  onJumpToCell,
}: RoomProgressModalProps) {
  if (!roomProgressModalRoomId) return null;

  const room = config.rooms.find((r) => r.id === roomProgressModalRoomId);
  if (!room) return null;

  const progress = getRoomProgress(room);

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button className="modal-close" onClick={onClose}>
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
                  className={`room-progress-cell-item ${
                    cell.isLocked ? "cell-item-locked" : "cell-item-investigating"
                  }`}
                  onClick={() => {
                    onClose();
                    onJumpToCell(room.id, cell.id);
                  }}
                >
                  <span className="cell-item-icon">{cell.icon}</span>
                  <div className="cell-item-info">
                    <span className="cell-item-label">{cell.label}</span>
                    <span
                      className={`cell-item-status ${
                        cell.isLocked ? "status-locked" : "status-pending"
                      }`}
                    >
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
            <p className="all-done-text">
              太棒了！这个房间的所有区域都已被你彻底调查完毕！
            </p>
          </div>
        )}
        <button className="action-btn clue-close-btn" onClick={onClose}>
          知道了
        </button>
      </div>
    </div>
  );
}
