import type { GameConfig, ItemDef } from "../puzzle-engine/types";

export interface ClueBookPanelProps {
  config: GameConfig;
  clueBookOpen: boolean;
  clueBookDetailItemId: string | null;
  totalClueCount: number;
  foundClueCount: number;
  isClueRevealed: (entry: any) => boolean;
  onClose: () => void;
  onCloseDetail: () => void;
  onOpenItemDetail: (itemId: string) => void;
}

export function ClueBookPanel({
  config,
  clueBookOpen,
  clueBookDetailItemId,
  totalClueCount,
  foundClueCount,
  isClueRevealed,
  onClose,
  onCloseDetail,
  onOpenItemDetail,
}: ClueBookPanelProps) {
  if (!clueBookOpen) return null;

  if (clueBookDetailItemId) {
    const detailItem: ItemDef | null = config.items[clueBookDetailItemId];
    if (!detailItem) return null;
    return (
      <div className="modal-overlay" onClick={onCloseDetail}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <span className="modal-icon">{detailItem.icon}</span>
            <div>
              <h3>{detailItem.name}</h3>
              <span
                className="item-tag"
                style={{ color: config.categoryColors[detailItem.category] }}
              >
                {config.categoryLabels[detailItem.category]}
              </span>
            </div>
            <button className="modal-close" onClick={onCloseDetail}>
              ✕
            </button>
          </div>
          <p className="modal-desc">{detailItem.description}</p>
          <div className="modal-detail">
            {detailItem.detail.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <button className="action-btn clue-close-btn" onClick={onCloseDetail}>
            返回线索册
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="clue-book-groups">
          {config.clueBook.map((group) => {
            const groupFoundCount = group.entries.filter((e) =>
              isClueRevealed(e)
            ).length;
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
                    return (
                      <button
                        key={entry.id}
                        className={`clue-book-entry ${revealed ? "clue-revealed" : "clue-hidden"}`}
                        disabled={!revealed}
                        onClick={() => {
                          if (revealed && entry.sourceItemId) {
                            onOpenItemDetail(entry.sourceItemId);
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
}
