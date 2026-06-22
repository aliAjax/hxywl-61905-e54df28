import type { GameConfig, EndingDef, SideQuestProgress } from "../puzzle-engine/types";
import type { EscapeEvaluation, EvalGrade } from "../hooks/useGameStats";

export interface VictoryScreenProps {
  config: GameConfig;
  ending: EndingDef | null;
  evaluation: EscapeEvaluation | null;
  displayTime: string;
  noteCount: number;
  combineCount: number;
  hiddenClueCount: number;
  totalHintCount: number;
  completedSideQuestCount: number;
  totalSideQuestCount: number;
  allSideQuestProgress: Record<string, SideQuestProgress>;
  engineHintUsage: Record<string, number>;
  currentSlot: number | null;
  onNewGame: (slotIndex: number) => void;
  onExitToMenu: () => void;
}

const gradeColorMap: Record<EvalGrade, string> = {
  S: "#fbbf24",
  A: "#a855f7",
  B: "#3b82f6",
  C: "#22d3ee",
  D: "#94a3b8",
};
const gradeBgMap: Record<EvalGrade, string> = {
  S: "rgba(251, 191, 36, 0.15)",
  A: "rgba(168, 85, 247, 0.15)",
  B: "rgba(59, 130, 246, 0.15)",
  C: "rgba(34, 211, 238, 0.12)",
  D: "rgba(148, 163, 184, 0.12)",
};
const gradeBorderMap: Record<EvalGrade, string> = {
  S: "rgba(251, 191, 36, 0.4)",
  A: "rgba(168, 85, 247, 0.4)",
  B: "rgba(59, 130, 246, 0.35)",
  C: "rgba(34, 211, 238, 0.3)",
  D: "rgba(148, 163, 184, 0.25)",
};

export function VictoryScreen({
  config,
  ending,
  evaluation,
  displayTime,
  noteCount,
  combineCount,
  hiddenClueCount,
  totalHintCount,
  completedSideQuestCount,
  totalSideQuestCount,
  allSideQuestProgress,
  engineHintUsage,
  currentSlot,
  onNewGame,
  onExitToMenu,
}: VictoryScreenProps) {
  const isTrueEnding = ending?.isTrueEnding ?? false;

  return (
    <main className="game-shell">
      <section className="hero">
        <p>密室文字逃脱 · H5Game</p>
        <h1>{config.title}</h1>
        <span>{config.subtitle}</span>
      </section>
      <section
        className={`victory-panel ${isTrueEnding ? "true-ending" : "normal-ending"}`}
      >
        <div className="victory-icon">{ending?.icon ?? "🎉"}</div>
        <h2 className={`victory-title ${isTrueEnding ? "true-ending-title" : ""}`}>
          {ending?.title ?? "成功逃脱"}
        </h2>
        <p className="victory-ending-tag">{ending?.tag ?? ""}</p>
        <div className="victory-story">
          {(ending?.story ?? []).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {completedSideQuestCount > 0 && config.sideQuests && (
          <div className="side-quest-stories">
            {config.sideQuests
              .filter(
                (q) => allSideQuestProgress[q.id]?.completed && q.storyAddendum
              )
              .map((quest) => (
                <div key={quest.id} className="side-quest-story">
                  <h4 className="side-quest-story-title">
                    {quest.icon} {quest.title}·真相补遗
                  </h4>
                  {(quest.storyAddendum ?? []).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ))}
          </div>
        )}
        {evaluation && (
          <div
            className="eval-section"
            style={{
              background: gradeBgMap[evaluation.grade],
              borderColor: gradeBorderMap[evaluation.grade],
            }}
          >
            <div className="eval-header">
              <div
                className="eval-grade"
                style={{
                  color: gradeColorMap[evaluation.grade],
                  background: gradeBgMap[evaluation.grade],
                  borderColor: gradeBorderMap[evaluation.grade],
                }}
              >
                {evaluation.grade}
              </div>
              <div className="eval-title-area">
                <span
                  className="eval-title"
                  style={{ color: gradeColorMap[evaluation.grade] }}
                >
                  {evaluation.title}
                </span>
                <span className="eval-score">综合评分 {evaluation.score}/100</span>
              </div>
            </div>
            <p className="eval-comment">{evaluation.comment}</p>
            <div className="eval-breakdown">
              {Object.values(evaluation.breakdown).map((item) => (
                <div key={item.label} className="eval-bar-row">
                  <span className="eval-bar-label">{item.label}</span>
                  <div className="eval-bar-track">
                    <div
                      className="eval-bar-fill"
                      style={{
                        width: `${(item.score / item.max) * 100}%`,
                        background: gradeColorMap[evaluation.grade],
                      }}
                    />
                  </div>
                  <span className="eval-bar-score">
                    {item.score}/{item.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
            <span className="stat-value">{combineCount}</span>
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
              {completedSideQuestCount}/{totalSideQuestCount}
            </span>
            <span className="stat-label">支线完成</span>
          </div>
        </div>
        {totalHintCount > 0 && (
          <div className="hint-stats-detail">
            <h4 className="hint-stats-title">📋 提示使用详情</h4>
            <div className="hint-stats-list">
              {config.hintPuzzles.map((puzzle) => {
                const count = engineHintUsage[puzzle.id] || 0;
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
          <button
            className="action-btn victory-restart"
            onClick={() => {
              if (currentSlot !== null) onNewGame(currentSlot);
            }}
          >
            🔄 再来一次
          </button>
          <button
            className="action-btn victory-restart secondary-btn"
            onClick={onExitToMenu}
          >
            🏠 返回主菜单
          </button>
        </div>
      </section>
    </main>
  );
}
