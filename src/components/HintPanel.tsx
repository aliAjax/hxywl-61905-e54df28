import type {
  GameConfig,
  PuzzleEngine,
  HintPuzzleDef,
  RecommendedPuzzle,
} from "../puzzle-engine/types";
import { checkCondition } from "../puzzle-engine";

export interface HintPanelProps {
  config: GameConfig;
  engine: PuzzleEngine;
  hintPanelOpen: boolean;
  hintDetailId: string | null;
  hintMode: "browse" | "recommend";
  selectedHintPuzzle: HintPuzzleDef | undefined;
  availablePuzzles: HintPuzzleDef[];
  recommendedPuzzles: RecommendedPuzzle[];
  totalHintCount: number;
  onClose: () => void;
  onCloseDetail: () => void;
  onBrowseMode: () => void;
  onRecommendMode: () => void;
  onOpenDetail: (puzzleId: string) => void;
  onRevealHint: (puzzleId: string) => void;
  onJumpToCell: (rec: RecommendedPuzzle) => void;
  getUrgencyLabel: (urgency: string) => string;
  getUrgencyColor: (urgency: string) => string;
}

export function HintPanel({
  config,
  engine,
  hintPanelOpen,
  hintDetailId,
  hintMode,
  selectedHintPuzzle,
  availablePuzzles,
  recommendedPuzzles,
  totalHintCount,
  onClose,
  onCloseDetail,
  onBrowseMode,
  onRecommendMode,
  onOpenDetail,
  onRevealHint,
  onJumpToCell,
  getUrgencyLabel,
  getUrgencyColor,
}: HintPanelProps) {
  if (!hintPanelOpen) return null;

  if (selectedHintPuzzle) {
    const levelsUnlocked = engine.hintUsage[selectedHintPuzzle.id] || 0;
    return (
      <div className="modal-overlay" onClick={onCloseDetail}>
        <div className="modal-card hint-detail-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-icon hint-modal-icon">{selectedHintPuzzle.icon}</span>
            <div>
              <h3>{selectedHintPuzzle.title}</h3>
              <span className="clue-status-tag">💡 已解锁 {levelsUnlocked}/3 层提示</span>
            </div>
            <button className="modal-close" onClick={onCloseDetail}>
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
                      {level === 0 ? "🥉" : level === 1 ? "🥈" : "🥇"} 第{level + 1}层
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
                    <p className="hint-level-text">{selectedHintPuzzle.hints[level]}</p>
                  ) : isNext ? (
                    <button
                      className="action-btn hint-reveal-btn"
                      onClick={() => onRevealHint(selectedHintPuzzle.id)}
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
          <button className="action-btn clue-close-btn" onClick={onCloseDetail}>
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card hint-panel-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon hint-modal-icon">💡</span>
          <div>
            <h3>提示中心</h3>
            <span className="clue-status-tag">卡住了？选择查看方式获取帮助</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="hint-mode-tabs">
          <button
            className={`hint-mode-tab ${hintMode === "browse" ? "hint-mode-tab-active" : ""}`}
            onClick={onBrowseMode}
          >
            📋 按谜题浏览
          </button>
          <button
            className={`hint-mode-tab ${hintMode === "recommend" ? "hint-mode-tab-active" : ""}`}
            onClick={onRecommendMode}
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
                      <div key={rec.puzzle.id} className="hint-recommend-item">
                        <div className="hint-recommend-header">
                          {index === 0 && (
                            <span className="hint-recommend-badge hint-recommend-top">
                              🏆 最佳推荐
                            </span>
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
                                <span key={i} className="hint-reason-tag">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="hint-recommend-actions">
                          <button
                            className="action-btn hint-action-btn hint-action-primary"
                            onClick={() => onOpenDetail(rec.puzzle.id)}
                          >
                            💡 查看提示
                          </button>
                          {rec.puzzle.relatedCellId && (
                            <button
                              className="action-btn hint-action-btn hint-action-secondary"
                              onClick={() => onJumpToCell(rec)}
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
                          <span className="hint-score-text">推荐度: {rec.score}</span>
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
                        onClick={() => onOpenDetail(puzzle.id)}
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
}
