import type { GameConfig, RoomDef, CellDef, PuzzleEngine } from "../puzzle-engine/types";
import type { CellStatus } from "../hooks/useRoomBoard";
import type { RoomProgressResult } from "../hooks/useClueAndHints";

export interface RoomBoardProps {
  config: GameConfig;
  currentRoom: RoomDef;
  CELLS: CellDef[];
  engine: PuzzleEngine;
  getCellStatus: (cellId: string) => CellStatus;
  getEnrichedCellContent: (cellId: string) => ReturnType<PuzzleEngine["getCellContent"]>;
  handleCellClick: (cellId: string) => void;
  getRoomProgress: (room: RoomDef) => RoomProgressResult;
  handleSwitchRoom: (roomId: string) => void;
  secretDoorOpened: boolean;
  secretDoorReasons: string[] | null;
  openRoomProgress: (roomId: string) => void;
}

export function RoomBoard({
  config,
  currentRoom,
  CELLS,
  engine,
  getCellStatus,
  handleCellClick,
  getRoomProgress,
  handleSwitchRoom,
  secretDoorOpened,
  secretDoorReasons,
  openRoomProgress,
}: RoomBoardProps) {
  return (
    <div className="board-wrapper">
      <div className="room-tabs">
        {config.rooms.map((room) => {
          const progress = getRoomProgress(room);
          const isActive = room.id === engine.currentRoomId;
          const isLocked = room.id !== config.rooms[0]?.id && !secretDoorOpened;
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
                        openRoomProgress(room.id);
                      }
                    }}
                    title={`还剩 ${progress.remaining} 处未彻底调查，点击查看详情`}
                  >
                    {progress.remaining > 0 ? (
                      <>⏳ 剩 {progress.remaining}</>
                    ) : (
                      <>
                        ✓ {progress.checked}/{progress.total}
                      </>
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
      <div
        className={`board ${currentRoom.boardClassName ?? ""}`}
        style={{
          gridTemplateColumns: currentRoom.gridTemplateColumns,
          gridTemplateRows: currentRoom.gridTemplateRows,
          gridTemplateAreas: currentRoom.gridTemplateAreas
            ? currentRoom.gridTemplateAreas.join("\n")
            : undefined,
        }}
      >
        {CELLS.map((cell) => {
          const status = getCellStatus(cell.id);
          const isInvestigated = engine.investigatedCellIds.has(cell.id);
          return (
            <button
              className={`board-cell cell-${cell.id} ${status.alreadyChecked ? "collected" : ""} ${
                status.isLit ? "flashlight-lit" : ""
              } ${isInvestigated ? "investigated" : ""} ${
                status.isLocked ? "locked-cell" : ""
              }`}
              key={cell.id}
              onClick={() => handleCellClick(cell.id)}
              title={status.isLocked ? engine.getCellContent(cell.id).lockReason : ""}
              style={{
                gridArea: cell.gridArea,
              }}
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
  );
}
