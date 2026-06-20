import { useState, useCallback } from "react";
import "./styles.css";

type ItemCategory = "key_fragment" | "note" | "flashlight";

interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string;
  description: string;
  detail: string;
}

interface CellDef {
  label: string;
  description: string;
  itemId: string | null;
  hiddenItemId?: string;
  darkHint?: string;
}

const ITEMS: Record<string, ItemDef> = {
  frag_a: {
    id: "frag_a",
    name: "钥匙碎片·甲",
    category: "key_fragment",
    icon: "🗝️",
    description: "一把锈迹斑斑的钥匙残片，边缘呈锯齿状。",
    detail:
      "这是钥匙的顶部，齿纹清晰可辨。上面刻着一个微小的符号「☉」，似乎暗示着某种机关。碎片边缘的锯齿恰好能与另一片吻合——也许还有更多碎片散落在房间里。",
  },
  frag_b: {
    id: "frag_b",
    name: "钥匙碎片·乙",
    category: "key_fragment",
    icon: "🗝️",
    description: "钥匙的中段，断口处闪着金属光泽。",
    detail:
      "钥匙的中段残片，断口非常整齐，像是被外力精准截断的。内侧刻有「右转两次」的字样，也许与门锁的开启方式有关。与碎甲片的断口吻合，拼合后似乎还差一截。",
  },
  frag_c: {
    id: "frag_c",
    name: "钥匙碎片·丙",
    category: "key_fragment",
    icon: "🗝️",
    description: "钥匙的尾部残片，带有圆形握柄的一角。",
    detail:
      "钥匙尾端碎片，握柄上残留的圆环恰好能套进钥匙孔的定位槽。握柄背面刻着一行极小的字：「三合一，门自开」。看来集齐三片碎片就能还原完整的钥匙。",
  },
  note_bookshelf: {
    id: "note_bookshelf",
    name: "纸条·书脊密码",
    category: "note",
    icon: "📝",
    description: "从书架夹层中掉落的泛黄纸条。",
    detail:
      "纸条上用褪色的墨水写着：\n\n「书脊编号 7-3-1，倒序即真相。」\n\n背面还有一行小字：「别信数字，信光。」\n\n这张纸条的线索似乎和某处密码有关……",
  },
  note_drawer: {
    id: "note_drawer",
    name: "纸条·抽屉暗语",
    category: "note",
    icon: "📝",
    description: "从抽屉底部刻槽中取出的薄纸片。",
    detail:
      "纸片上用铅笔画了一个箭头指向左边，旁边写着：\n\n「光的颜色是关键——红、蓝、绿，顺序不可颠倒。」\n\n这也许是某个机关的提示？",
  },
  note_curtain: {
    id: "note_curtain",
    name: "纸条·窗帘刻字",
    category: "note",
    icon: "📝",
    description: "窗帘背后被人用指甲刻下的留言。",
    detail:
      "窗帘背面深深的划痕组成了一句话：\n\n「向左三圈，再向右一圈。」\n\n旁边还有一个歪歪扭扭的太阳图案。这或许与门锁的旋转方向有关。",
  },
  note_carpet: {
    id: "note_carpet",
    name: "纸条·地毯暗号",
    category: "note",
    icon: "📝",
    description: "用手电筒照亮的荧光墨水暗号，在地毯角落若隐若现。",
    detail:
      "荧光墨水在紫外光下显现出一串数字：\n\n「1-3-7-9」\n\n旁边画着一把钥匙的轮廓和「开门密码」四个字。这串数字很可能就是门锁的密码！",
  },
  flashlight: {
    id: "flashlight",
    name: "手电筒",
    category: "flashlight",
    icon: "🔦",
    description: "一盏小巧的LED手电筒，电量充足。",
    detail:
      "手电筒开关灵敏，光束聚焦良好。照亮暗处时似乎能看到平时肉眼难以察觉的痕迹——也许房间某些角落还藏着用荧光墨水书写的暗号。\n\n提示：打开手电筒后，检查地毯下方。",
  },
};

const CELLS: CellDef[] = [
  { label: "书架", description: "一排落满灰尘的旧书，书脊上标注着奇怪的编号。", itemId: "note_bookshelf" },
  { label: "花瓶", description: "一只青花瓷花瓶，瓶口似乎塞着什么东西。", itemId: "frag_a" },
  { label: "抽屉", description: "半开的木抽屉，里面散落着几张废纸。", itemId: "note_drawer" },
  { label: "挂画", description: "一幅暗色调油画，画框微微松动。", itemId: "frag_b" },
  { label: "地毯", description: "厚实的波斯地毯，边角微微翘起。", itemId: null, hiddenItemId: "note_carpet", darkHint: "地毯角落似乎有微弱的荧光……试试手电筒？" },
  { label: "台灯", description: "一盏复古台灯，灯罩下藏着小巧的手电筒。", itemId: "flashlight" },
  { label: "门锁", description: "一扇铁门上的密码锁，需要输入4位数字。", itemId: null },
  { label: "箱子", description: "一只贴着封条的铁皮箱，底部有暗格。", itemId: "frag_c" },
  { label: "窗帘", description: "厚重的深色窗帘，遮住了整个窗户。", itemId: "note_curtain" },
];

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  key_fragment: "钥匙碎片",
  note: "纸条",
  flashlight: "工具",
};

const CATEGORY_COLOR: Record<ItemCategory, string> = {
  key_fragment: "#f97316",
  note: "#a855f7",
  flashlight: "#22d3ee",
};

type FilterTab = "all" | ItemCategory;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "key_fragment", label: "碎片" },
  { key: "note", label: "纸条" },
  { key: "flashlight", label: "工具" },
];

function App() {
  const [inventory, setInventory] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "info" | "collect" | "empty" } | null>(null);
  const [detailItem, setDetailItem] = useState<ItemDef | null>(null);
  const [justCollected, setJustCollected] = useState<string | null>(null);
  const [messageTimer, setMessageTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [flashlightActive, setFlashlightActive] = useState(false);
  const [escaped, setEscaped] = useState(false);

  const showMsg = useCallback(
    (text: string, type: "info" | "collect" | "empty") => {
      setMessage({ text, type });
      if (messageTimer) clearTimeout(messageTimer);
      const timer = setTimeout(() => setMessage(null), 2500);
      setMessageTimer(timer);
    },
    [messageTimer]
  );

  const hasFlashlight = inventory.includes("flashlight");

  const handleCellClick = useCallback(
    (index: number) => {
      if (escaped) return;
      const cell = CELLS[index];

      if (!cell.itemId && cell.hiddenItemId && flashlightActive) {
        if (inventory.includes(cell.hiddenItemId)) {
          showMsg(`你已经从${cell.label}拿到了「${ITEMS[cell.hiddenItemId].name}」`, "info");
        } else {
          setInventory((prev) => [...prev, cell.hiddenItemId!]);
          setJustCollected(cell.hiddenItemId!);
          setTimeout(() => setJustCollected(null), 600);
          showMsg(`用手电筒照亮${cell.label}，发现了「${ITEMS[cell.hiddenItemId!].name}」！`, "collect");
        }
        return;
      }

      if (cell.itemId) {
        if (inventory.includes(cell.itemId)) {
          showMsg(`你已经从${cell.label}拿到了「${ITEMS[cell.itemId].name}」`, "info");
        } else {
          setInventory((prev) => [...prev, cell.itemId!]);
          setJustCollected(cell.itemId!);
          setTimeout(() => setJustCollected(null), 600);
          showMsg(`从${cell.label}中发现了「${ITEMS[cell.itemId].name}」！`, "collect");
        }
      } else if (cell.hiddenItemId && !flashlightActive && hasFlashlight) {
        showMsg(cell.darkHint || "这里似乎藏着什么，试试打开手电筒？", "info");
      } else {
        showMsg(cell.description, "empty");
      }
    },
    [inventory, showMsg, flashlightActive, hasFlashlight, escaped]
  );

  const handleItemClick = useCallback(
    (itemId: string) => {
      if (itemId === "flashlight") {
        setFlashlightActive((prev) => !prev);
        if (!flashlightActive) {
          showMsg("🔦 手电筒已打开，暗处的线索将显现！", "collect");
        } else {
          showMsg("手电筒已关闭", "info");
        }
      }
      setDetailItem(ITEMS[itemId]);
    },
    [flashlightActive, showMsg]
  );

  const handleCombineKey = useCallback(() => {
    setEscaped(true);
  }, []);

  const fragmentCount = inventory.filter((id) => ITEMS[id].category === "key_fragment").length;
  const noteCount = inventory.filter((id) => ITEMS[id].category === "note").length;

  const filteredInventory =
    filterTab === "all" ? inventory : inventory.filter((id) => ITEMS[id].category === filterTab);

  if (escaped) {
    return (
      <main className="game-shell">
        <section className="hero">
          <p>密室文字逃脱 · H5Game</p>
          <h1>密室文字逃脱</h1>
          <span>点击场景收集线索，组合道具并解开密码锁</span>
        </section>
        <section className="victory-panel">
          <div className="victory-icon">🎉</div>
          <h2>成功逃脱！</h2>
          <p>
            你收集了全部三枚钥匙碎片，组合成完整的钥匙，打开了密码锁，成功逃出了密室！
          </p>
          <p className="victory-stats">
            收集道具 {inventory.length} 件 · 线索纸条 {noteCount} 张
          </p>
          <button className="action-btn victory-restart" onClick={() => window.location.reload()}>
            🔄 再来一次
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <section className="hero">
        <p>密室文字逃脱 · H5Game</p>
        <h1>密室文字逃脱</h1>
        <span>点击场景收集线索，组合道具并解开密码锁</span>
      </section>

      <section className="hud">
        <article>
          <small>线索</small>
          <strong>{noteCount}</strong>
        </article>
        <article>
          <small>道具</small>
          <strong>{inventory.length}</strong>
        </article>
        <article>
          <small>碎片</small>
          <strong>{fragmentCount}/3</strong>
        </article>
        <article>
          <small>状态</small>
          <strong>{flashlightActive ? "🔦 照明中" : fragmentCount === 3 ? "可逃脱" : "探索中"}</strong>
        </article>
      </section>

      <section className="playground escape">
        <div className="board">
          {CELLS.map((cell, index) => {
            const collected = cell.itemId && inventory.includes(cell.itemId);
            const hiddenCollected = cell.hiddenItemId && inventory.includes(cell.hiddenItemId);
            const isLit = flashlightActive && cell.hiddenItemId && !hiddenCollected;
            return (
              <button
                className={`board-cell ${collected || hiddenCollected ? "collected" : ""} ${isLit ? "flashlight-lit" : ""}`}
                key={index}
                onClick={() => handleCellClick(index)}
              >
                <span className="cell-label">{cell.label}</span>
                {(collected || hiddenCollected) && <span className="cell-check">✓</span>}
                {isLit && <span className="cell-glow">💡</span>}
              </button>
            );
          })}
        </div>

        <aside className="side-panel">
          <h2>物品栏</h2>

          <div className="inventory-summary">
            <span style={{ color: CATEGORY_COLOR.key_fragment }}>🗝️ {fragmentCount}</span>
            <span style={{ color: CATEGORY_COLOR.note }}>📝 {noteCount}</span>
            <span style={{ color: CATEGORY_COLOR.flashlight }}>🔦 {hasFlashlight ? 1 : 0}</span>
          </div>

          <div className="filter-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`filter-tab ${filterTab === tab.key ? "active" : ""}`}
                onClick={() => setFilterTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredInventory.length === 0 ? (
            <p className="empty-hint">
              {inventory.length === 0 ? "点击房间中的物品来收集道具" : "当前分类下没有道具"}
            </p>
          ) : (
            <div className="inventory-list">
              {filteredInventory.map((itemId) => {
                const item = ITEMS[itemId];
                const isNew = justCollected === itemId;
                const isActiveFlashlight = itemId === "flashlight" && flashlightActive;
                return (
                  <button
                    className={`inventory-item ${isNew ? "item-pop" : ""} ${isActiveFlashlight ? "item-active" : ""}`}
                    key={itemId}
                    onClick={() => handleItemClick(itemId)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-tag" style={{ color: CATEGORY_COLOR[item.category] }}>
                        {CATEGORY_LABEL[item.category]}
                        {isActiveFlashlight && " · 已开启"}
                      </span>
                    </span>
                    {isActiveFlashlight && <span className="item-status">ON</span>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="actions">
            <button
              className="action-btn"
              disabled={fragmentCount < 3}
              onClick={fragmentCount >= 3 ? handleCombineKey : undefined}
            >
              {fragmentCount < 3 ? `组合钥匙（${fragmentCount}/3）` : "🔓 组合钥匙并开锁"}
            </button>
          </div>
        </aside>
      </section>

      {message && (
        <div className={`toast toast-${message.type}`}>
          {message.type === "collect" && "✨ "}
          {message.text}
        </div>
      )}

      {detailItem && (
        <div className="modal-overlay" onClick={() => setDetailItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">{detailItem.icon}</span>
              <div>
                <h3>{detailItem.name}</h3>
                <span className="item-tag" style={{ color: CATEGORY_COLOR[detailItem.category] }}>
                  {CATEGORY_LABEL[detailItem.category]}
                </span>
              </div>
              <button className="modal-close" onClick={() => setDetailItem(null)}>
                ✕
              </button>
            </div>
            <p className="modal-desc">{detailItem.description}</p>
            <div className="modal-detail">
              {detailItem.detail.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {detailItem.id === "flashlight" && (
              <button
                className="action-btn modal-use-btn"
                onClick={() => {
                  setFlashlightActive((prev) => !prev);
                  if (!flashlightActive) {
                    showMsg("🔦 手电筒已打开，暗处的线索将显现！", "collect");
                  } else {
                    showMsg("手电筒已关闭", "info");
                  }
                  setDetailItem(null);
                }}
              >
                {flashlightActive ? "关闭手电筒" : "🔦 打开手电筒"}
              </button>
            )}
          </div>
        </div>
      )}

      <section className="result-panel">
        <h2>探索进度</h2>
        <p>
          已收集 {inventory.length} 件道具，钥匙碎片 {fragmentCount}/3，线索纸条 {noteCount} 张。
          {flashlightActive && " 手电筒已开启，注意观察暗处的荧光线索！"}
          {!flashlightActive &&
            fragmentCount === 3 &&
            " 三枚碎片已齐，可以尝试组合钥匙打开门锁！"}
          {!flashlightActive &&
            fragmentCount < 3 &&
            " 继续探索房间，收集更多线索与道具。"}
        </p>
      </section>
    </main>
  );
}

export default App;
