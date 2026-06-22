import type { GameConfig, ItemDef } from "../puzzle-engine/types";

export interface ItemDetailModalProps {
  config: GameConfig;
  detailItem: ItemDef | null;
  flashlightActive: boolean;
  hasKeyCore: boolean;
  onClose: () => void;
  onToggleFlashlight: () => void;
}

export function ItemDetailModal({
  config,
  detailItem,
  flashlightActive,
  hasKeyCore,
  onClose,
  onToggleFlashlight,
}: ItemDetailModalProps) {
  if (!detailItem) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="modal-desc">{detailItem.description}</p>
        <div className="modal-detail">
          {detailItem.detail.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {detailItem.id === "powered_flashlight" && (
          <button
            className="action-btn modal-use-btn"
            onClick={() => {
              onToggleFlashlight();
              onClose();
            }}
          >
            {flashlightActive ? "关闭手电筒" : "🔦 打开手电筒"}
          </button>
        )}
        {detailItem.id === "flashlight" && (
          <p className="modal-hint">
            💡 提示：这把手电筒没有电池，需要找到电池后组合使用。
          </p>
        )}
        {detailItem.id === "battery" && (
          <p className="modal-hint">
            💡 提示：也许能和某个电子设备组合使用——比如台灯旁边那把手电筒？
          </p>
        )}
        {detailItem.id === "key_core" && (
          <p className="modal-hint">
            💡 提示：钥匙核心可以嵌入完整钥匙的握柄中心，尝试将它们组合！
          </p>
        )}
        {detailItem.id === "complete_key" && !hasKeyCore && (
          <p className="modal-hint">
            💡 提示：完整钥匙已组合好，但储物间的通风口里也许藏着钥匙的关键组件……
          </p>
        )}
        {detailItem.id === "circuit_board" && (
          <p className="modal-hint">
            💡 提示：这是最终大门门锁系统的核心模块。去储物间的最终大门处找到插槽插入！
          </p>
        )}
      </div>
    </div>
  );
}
