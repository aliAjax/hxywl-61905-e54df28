import type { GameConfig, PuzzleEngine, ItemDef } from "../puzzle-engine/types";
import type { FilterTab } from "../hooks/useInventory";

export interface InventoryPanelProps {
  engine: PuzzleEngine;
  config: GameConfig;
  filterTab: FilterTab;
  setFilterTab: (tab: FilterTab) => void;
  combineMode: boolean;
  selectedForCombine: string[];
  canCombine: boolean;
  combinableItemIds: Set<string>;
  combineCandidateIds: Set<string>;
  filteredInventory: string[];
  justCollected: string | null;
  toggleCombineSelect: (itemId: string) => void;
  handleCombine: () => void;
  toggleCombineMode: () => void;
  handleItemClick: (itemId: string) => void;
  fragmentCount: number;
  noteCount: number;
  toolCount: number;
  hasAssembledKey: boolean;
  hasCompleteKey: boolean;
  secretDoorOpened: boolean;
  canUseKeyOnDoor: boolean;
  keyUseReason: string | undefined;
  keySidebarLabel: string | undefined;
  handleUseKeyOnDoor: () => void;
  onQuickSave: () => void;
  onOpenSavePanel: () => void;
  onRestart: () => void;
  onExitToMenu: () => void;
}

export function InventoryPanel({
  engine,
  config,
  filterTab,
  setFilterTab,
  combineMode,
  selectedForCombine,
  canCombine,
  combinableItemIds,
  combineCandidateIds,
  filteredInventory,
  justCollected,
  handleCombine,
  toggleCombineMode,
  handleItemClick,
  fragmentCount,
  noteCount,
  toolCount,
  hasAssembledKey,
  hasCompleteKey,
  secretDoorOpened,
  canUseKeyOnDoor,
  keyUseReason,
  keySidebarLabel,
  handleUseKeyOnDoor,
  onQuickSave,
  onOpenSavePanel,
  onRestart,
  onExitToMenu,
}: InventoryPanelProps) {
  return (
    <aside className="side-panel">
      <h2>物品栏</h2>
      <div className="inventory-summary">
        <span style={{ color: config.categoryColors.key_fragment }}>
          🗝️ {hasAssembledKey ? 1 : hasCompleteKey ? 1 : fragmentCount}
        </span>
        <span style={{ color: config.categoryColors.note }}>📝 {noteCount}</span>
        <span style={{ color: config.categoryColors.tool }}>🔧 {toolCount}</span>
      </div>
      <div className="filter-tabs">
        {config.filterTabs.map((tab) => (
          <button
            key={tab.key}
            className={`filter-tab ${filterTab === tab.key ? "active" : ""}`}
            onClick={() => setFilterTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {combineMode && (
        <div className="combine-slots">
          <div className="combine-slots-title">选择要组合的道具（最多3个）</div>
          <div className="combine-slot-row">
            {[0, 1, 2].map((i) => {
              const itemId = selectedForCombine[i];
              const item: ItemDef | null = itemId ? config.items[itemId] : null;
              return (
                <div
                  key={i}
                  className={`combine-slot ${item ? "combine-slot-filled" : ""}`}
                >
                  {item ? (
                    <>
                      <span className="combine-slot-icon">{item.icon}</span>
                      <span className="combine-slot-name">{item.name}</span>
                    </>
                  ) : (
                    <span className="combine-slot-placeholder">空</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {filteredInventory.length === 0 ? (
        <p className="empty-hint">
          {engine.inventory.length === 0
            ? "点击房间中的物品来收集道具。先从书架开始调查吧！"
            : "当前分类下没有道具"}
        </p>
      ) : (
        <div className="inventory-list">
          {filteredInventory.map((itemId) => {
            const item = config.items[itemId];
            if (!item) return null;
            const isNew = justCollected === itemId;
            const isActiveFlashlight =
              itemId === "powered_flashlight" && engine.flashlightActive;
            const isSelected = selectedForCombine.includes(itemId);
            const isCandidate = combineCandidateIds.has(itemId);
            const isCombinable =
              selectedForCombine.length === 0 && combinableItemIds.has(itemId);
            return (
              <button
                className={`inventory-item ${isNew ? "item-pop" : ""} ${
                  isActiveFlashlight ? "item-active" : ""
                } ${isSelected ? "item-selected" : ""} ${
                  combineMode ? "item-combine-mode" : ""
                } ${isCombinable ? "item-combinable" : ""} ${
                  isCandidate ? "item-combine-candidate" : ""
                }`}
                key={itemId}
                onClick={() => handleItemClick(itemId)}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span
                    className="item-tag"
                    style={{ color: config.categoryColors[item.category] }}
                  >
                    {config.categoryLabels[item.category]}
                    {isActiveFlashlight && " · 已开启"}
                    {isSelected && " · 已选"}
                  </span>
                </span>
                {isActiveFlashlight && <span className="item-status">ON</span>}
                {isSelected && <span className="item-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
      <div className="actions">
        {!combineMode ? (
          <button
            className="action-btn combine-toggle-btn"
            onClick={toggleCombineMode}
            disabled={engine.inventory.length < 2}
            title={
              engine.inventory.length < 2
                ? "至少需要2个道具才能组合"
                : "选择道具进行组合"
            }
          >
            🔧 组合道具
          </button>
        ) : (
          <>
            <button
              className={`action-btn combine-confirm-btn ${
                canCombine ? "combine-confirm-success" : "combine-confirm-fail"
              }`}
              onClick={handleCombine}
              disabled={selectedForCombine.length === 0}
              title={
                canCombine
                  ? "确认组合选中的道具"
                  : selectedForCombine.length === 0
                  ? "请先选择要组合的道具"
                  : "点击查看当前选择的组合提示"
              }
            >
              {canCombine
                ? "✨ 确认组合"
                : selectedForCombine.length === 0
                ? "请选择道具"
                : "❓ 尝试组合"}
            </button>
            <button
              className="action-btn combine-cancel-btn"
              onClick={toggleCombineMode}
            >
              取消
            </button>
          </>
        )}
        {secretDoorOpened && (
          <button
            className="action-btn"
            disabled={!canUseKeyOnDoor}
            onClick={canUseKeyOnDoor ? handleUseKeyOnDoor : undefined}
            title={keyUseReason ?? ""}
          >
            {keySidebarLabel ?? "🔑 用钥匙开锁"}
          </button>
        )}
      </div>
      <div className="game-menu game-menu-4">
        <button className="action-btn menu-btn quick-save-btn" onClick={onQuickSave}>
          💾 快速保存
        </button>
        <button className="action-btn menu-btn save-manage-btn" onClick={onOpenSavePanel}>
          📂 存档管理
        </button>
        <button className="action-btn menu-btn restart-btn" onClick={onRestart}>
          🔄 重新开始
        </button>
        <button className="action-btn menu-btn main-menu-btn" onClick={onExitToMenu}>
          🏠 主菜单
        </button>
      </div>
    </aside>
  );
}
