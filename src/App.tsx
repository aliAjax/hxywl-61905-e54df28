import { useMemo, useState } from "react";
import "./styles.css";

const game = {
  "id": "hxywl-61905",
  "port": 61905,
  "title": "密室文字逃脱",
  "tagline": "点击场景收集线索，组合道具并解开密码锁",
  "prompt": "我想做一个H5文字解谜逃脱游戏，玩家在一个房间场景里点击物品、收集线索、组合道具并输入密码开锁。游戏需要有房间主画面、物品栏、线索详情弹窗、密码锁界面和结局页。所有谜题和道具逻辑先写在前端本地，要求流程完整，玩家能从开始一路解到逃脱成功。",
  "palette": [
    "#334155",
    "#a855f7",
    "#f97316"
  ],
  "stats": [
    "线索",
    "道具",
    "密码",
    "结局"
  ],
  "actions": [
    "调查物品",
    "组合线索",
    "输入密码"
  ],
  "mode": "escape"
};

const boards: Record<string, string[]> = {
  rhythm: ["♪", "◇", "♪", "◆", "♪", "◇", "◆", "♪", "◇"],
  merge: ["🍩", "🍩", "🧁", "🍪", "🧁", "🍰", "🍪", "🍩", "🍮"],
  dungeon: ["?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?"],
  slingshot: ["★", "·", "●", "·", "▣", "·", "★", "·", "◎"],
  escape: ["书架", "花瓶", "抽屉", "挂画", "地毯", "台灯", "门锁", "箱子", "窗帘"],
};

function App() {
  const [score, setScore] = useState(1280);
  const [combo, setCombo] = useState(7);
  const [selected, setSelected] = useState(0);
  const cells = useMemo(() => boards[game.mode], []);
  const best = Number(localStorage.getItem(game.id + "-best") || 0);

  function playCell(index: number) {
    setSelected(index);
    const gain = game.mode === "dungeon" && index % 5 === 0 ? -80 : 120 + index * 8;
    const nextScore = Math.max(0, score + gain);
    setScore(nextScore);
    setCombo((value) => (gain > 0 ? value + 1 : 0));
    if (nextScore > best) {
      localStorage.setItem(game.id + "-best", String(nextScore));
    }
  }

  return (
    <main className="game-shell">
      <section className="hero">
        <p>{game.id} · H5Game · Port {game.port}</p>
        <h1>{game.title}</h1>
        <span>{game.tagline}</span>
      </section>

      <section className="hud">
        {game.stats.map((stat, index) => (
          <article key={stat}>
            <small>{stat}</small>
            <strong>{index === 0 ? score : index === 1 ? best : index === 2 ? selected + 1 : combo}</strong>
          </article>
        ))}
      </section>

      <section className={"playground " + game.mode}>
        <div className="board">
          {cells.map((cell, index) => (
            <button
              className={selected === index ? "active" : ""}
              key={index}
              onClick={() => playCell(index)}
            >
              {cell}
            </button>
          ))}
        </div>
        <aside className="side-panel">
          <h2>核心玩法</h2>
          <p>{game.prompt}</p>
          <div className="actions">
            {game.actions.map((action) => (
              <button key={action}>{action}</button>
            ))}
          </div>
        </aside>
      </section>

      <section className="result-panel">
        <h2>结算预览</h2>
        <p>当前分数{score}，最高分{Math.max(best, score)}，连击{combo}。基础流程已包含开始、交互、反馈、记录和结算区域，后续可以继续扩展关卡、音效、动画与资源管理。</p>
      </section>
    </main>
  );
}

export default App;
