import type {
  GameConfig,
  PuzzleEngine,
  CellDef,
  ItemDef,
} from "../puzzle-engine/types";

export interface ClueModalProps {
  config: GameConfig;
  engine: PuzzleEngine;
  clueModalCellId: string | null;
  clueModalCell: CellDef | null;
  getEnrichedCellContent: (cellId: string) => ReturnType<PuzzleEngine["getCellContent"]>;
  hasPoweredFlashlight: boolean;
  curtainChecked: boolean;
  onClose: () => void;
  onViewItemDetail: (itemId: string) => void;
  onOpenDrawerLock: () => void;
  onOpenFilingCabinetLock: () => void;
}

export function ClueModal({
  config,
  engine,
  clueModalCellId,
  clueModalCell,
  getEnrichedCellContent,
  hasPoweredFlashlight,
  curtainChecked,
  onClose,
  onViewItemDetail,
  onOpenDrawerLock,
  onOpenFilingCabinetLock,
}: ClueModalProps) {
  if (clueModalCellId === null || !clueModalCell) return null;

  const cell = clueModalCell;
  const content = getEnrichedCellContent(clueModalCellId);
  const gotClue: ItemDef | null = content.itemId ? config.items[content.itemId] : null;

  const isDrawer = clueModalCellId === "drawer";
  const isFilingCabinet = clueModalCellId === "filing_cabinet";
  const isWorkbench = clueModalCellId === "workbench";
  const isCarpet = clueModalCellId === "carpet";
  const isDarkCorner = clueModalCellId === "dark_corner";
  const isCurtain = clueModalCellId === "curtain";

  return (
    <div className="modal-overlay clue-modal-overlay" onClick={onClose}>
      <div className="modal-card clue-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header clue-modal-header">
          <span className="modal-icon clue-modal-icon">{cell.icon}</span>
          <div>
            <h3>{cell.label}</h3>
            <span className="clue-status-tag">
              {content.alreadyChecked
                ? "✓ 已完成"
                : content.isLocked
                ? `🔒 ${content.lockReason}`
                : gotClue
                ? "✨ 获得线索"
                : "🔍 调查中"}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="clue-detail-section">
          <h4 className="clue-section-title">📖 场景描述</h4>
          <p className="clue-detail-text">{content.clueDetail}</p>
        </div>
        <div className="clue-detail-section">
          <h4 className="clue-section-title">
            {gotClue
              ? "🎁 获得线索"
              : content.isLocked
              ? "🔒 当前状态"
              : "🔍 线索状态"}
          </h4>
          {gotClue ? (
            <div className="clue-item-box">
              <span className="clue-item-icon">{gotClue.icon}</span>
              <div className="clue-item-info">
                <span className="clue-item-name">{gotClue.name}</span>
                <span className="clue-item-desc">{gotClue.description}</span>
              </div>
              <button
                className="clue-item-view-btn"
                onClick={() => {
                  onViewItemDetail(gotClue.id);
                  onClose();
                }}
              >
                查看详情
              </button>
            </div>
          ) : content.isLocked ? (
            <p className="clue-status-text hint-text">
              {content.lockReason === "三位密码锁"
                ? isFilingCabinet
                  ? "档案柜被三位密码锁锁住了。需要输入正确的密码才能打开。储物架上的纸条也许有线索……"
                  : "这个抽屉被三位密码锁锁住了。需要输入正确的密码才能打开。"
                : content.lockReason === "需要螺丝刀"
                ? isWorkbench
                  ? "工作台抽屉被螺丝固定住了。需要螺丝刀才能打开——你在书房找到的螺丝刀也许能派上用场！"
                  : "需要螺丝刀才能操作这里。先去找到螺丝刀吧——抽屉里似乎有工具。"
                : content.lockReason === "需要螺丝刀撬开"
                ? "箱子封条太牢固了，需要螺丝刀才能撬开。"
                : content.lockReason === "需要钢丝钳"
                ? "通风口被铁丝网封住了，需要钢丝钳才能剪开。工作台抽屉里应该有！"
                : content.lockReason === "需要打开手电筒"
                ? "这里似乎藏着荧光墨水书写的暗号。打开手电筒照照看！"
                : content.lockReason === "手电筒缺少电池"
                ? "你有手电筒，但没有电池亮不起来。去抽屉里找找电池，然后组合使用！"
                : content.lockReason === "需要能照亮暗处的工具"
                ? "角落太暗了看不清楚，需要找到能发光的工具。"
                : content.lockReason === "未完成书房探索"
                ? "暗门机关需要集齐书房所有机关之钥——打开抽屉、取下挂画、撬开箱子！"
                : content.lockReason === "门锁系统未启动：需要电路板"
                ? "最终大门的门锁系统没有供电。需要找到电路板插入插槽——工作台里有！"
                : content.lockReason === "需要开锁方法"
                ? "门锁系统已启动，但还需要开锁方法：找到档案柜中的密码线索，或组合出钥匙。"
                : "这里暂时无法操作。"}
              {content.lockReason === "三位密码锁" && isDrawer && (
                <button
                  className="action-btn clue-close-btn"
                  style={{ marginTop: "12px" }}
                  onClick={() => {
                    onClose();
                    onOpenDrawerLock();
                  }}
                >
                  🔢 输入密码
                </button>
              )}
              {content.lockReason === "三位密码锁" && isFilingCabinet && (
                <button
                  className="action-btn clue-close-btn"
                  style={{ marginTop: "12px" }}
                  onClick={() => {
                    onClose();
                    onOpenFilingCabinetLock();
                  }}
                >
                  🔢 输入密码
                </button>
              )}
            </p>
          ) : (isCarpet || isDarkCorner) &&
            engine.flashlightActive &&
            hasPoweredFlashlight ? (
            <p className="clue-status-text">此处的线索已经被你记录下来了。</p>
          ) : isCurtain && curtainChecked ? (
            <p className="clue-status-text">窗帘上的刻字你已经记下了。</p>
          ) : (
            <p className="clue-status-text">这里没有发现可收集的物品。</p>
          )}
        </div>
        <div className="clue-detail-section">
          <h4 className="clue-section-title">💡 下一步提示</h4>
          <p className="clue-hint-text">{content.nextHint}</p>
        </div>
        <button className="action-btn clue-close-btn" onClick={onClose}>
          知道了
        </button>
      </div>
    </div>
  );
}
