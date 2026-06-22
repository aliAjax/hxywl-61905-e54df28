export interface GameStatsHeaderProps {
  elapsedTimeStr: string;
  foundClueCount: number;
  totalClueCount: number;
  inventorySize: number;
  combineCount: number;
  hiddenClueCount: number;
  completedSideQuestCount: number;
  totalSideQuestCount: number;
  totalHintCount: number;
  onOpenClueBook: () => void;
  onOpenHintPanel: () => void;
  configTitle: string;
  configSubtitle: string;
}

export function GameStatsHeader({
  elapsedTimeStr,
  foundClueCount,
  totalClueCount,
  inventorySize,
  combineCount,
  hiddenClueCount,
  completedSideQuestCount,
  totalSideQuestCount,
  totalHintCount,
  onOpenClueBook,
  onOpenHintPanel,
  configTitle,
  configSubtitle,
}: GameStatsHeaderProps) {
  return (
    <>
      <section className="hero">
        <p>密室文字逃脱 · H5Game</p>
        <h1>{configTitle}</h1>
        <span>{configSubtitle}</span>
      </section>
      <section className="hud hud-7">
        <article>
          <small>用时</small>
          <strong>⏱️ {elapsedTimeStr}</strong>
        </article>
        <article onClick={onOpenClueBook} style={{ cursor: "pointer" }}>
          <small>线索册</small>
          <strong>
            📖 {foundClueCount}/{totalClueCount}
          </strong>
        </article>
        <article>
          <small>道具</small>
          <strong>🎒 {inventorySize}</strong>
        </article>
        <article>
          <small>组合</small>
          <strong>🔧 {combineCount}</strong>
        </article>
        <article>
          <small>隐藏</small>
          <strong>
            {hiddenClueCount > 0 ? `🗝️ ${hiddenClueCount}/5` : "🔒 0/5"}
          </strong>
        </article>
        <article>
          <small>支线</small>
          <strong>
            🧩 {completedSideQuestCount}/{totalSideQuestCount}
          </strong>
        </article>
        <article onClick={onOpenHintPanel} style={{ cursor: "pointer" }}>
          <small>提示</small>
          <strong>
            💡 {totalHintCount > 0 ? `${totalHintCount}次` : "未使用"}
          </strong>
        </article>
      </section>
    </>
  );
}
