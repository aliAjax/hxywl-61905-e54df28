import type { GameConfig, PuzzleEngine, LockDef, LockUIInfo } from "../puzzle-engine/types";

export interface PuzzleLockModalProps {
  config: GameConfig;
  engine: PuzzleEngine;
  lockTargetId: string | null;
  lockDigits: string[];
  lockError: boolean;
  currentLock: LockDef | undefined;
  allLocks: LockDef[];
  doorUIInfo: LockUIInfo;
  keyButtonText: string;
  canUseKeyOnDoor: boolean;
  onClose: () => void;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onUseKeyOnDoor: () => void;
  onSwitchHiddenLock: (lockId: string) => void;
}

export function PuzzleLockModal({
  config,
  engine,
  lockTargetId,
  lockDigits,
  lockError,
  currentLock,
  doorUIInfo,
  keyButtonText,
  canUseKeyOnDoor,
  onClose,
  onDigit,
  onDelete,
  onSubmit,
  onUseKeyOnDoor,
  onSwitchHiddenLock,
}: PuzzleLockModalProps) {
  if (!lockTargetId || !currentLock) return null;

  const lock = currentLock;
  const isDrawer = lock.id === "drawer";
  const isFilingCabinet = lock.id === "filing_cabinet";
  const isHidden = lock.id === "final_hidden";
  const isFinalDoor = lock.id === "final_door";
  const lockUIInfo = engine.getLockUIInfo(lockTargetId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card lock-modal-card ${lockError ? "lock-shake" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-icon">{lock.icon}</span>
          <div>
            <h3>{lock.label}</h3>
            <span className="clue-status-tag">请输入{lock.digits}位数字密码</span>
          </div>
          <button className="modal-close" onClick={onClose}>
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
                onClick={onUseKeyOnDoor}
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
                  background: "linear-gradient(135deg, #fbbf24, #f97316",
                  color: "#0f172a",
                }}
                onClick={() => {
                  onSwitchHiddenLock(lockUIInfo.hiddenPassword!.lockId);
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
                <span key={line + i}>
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
                  const item = config.items[itemId];
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
              const hasAnyClue =
                lock.clueItemIds?.some((id) => engine.hasItem(id)) ?? false;
              if (
                hasAnyClue || !lock.clueItemIds || lock.clueItemIds.length === 0
              ) {
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
              onClick={() => onDigit(d)}
            >
              {d}
            </button>
          ))}
          <button
            className="lock-numpad-key lock-numpad-delete"
            onClick={onDelete}
          >
            ⌫
          </button>
          <button
            className="lock-numpad-key"
            onClick={() => onDigit("0")}
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
            onClick={onSubmit}
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}
