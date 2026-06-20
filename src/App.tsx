import { useState, useCallback, useEffect, useMemo } from "react";
import "./styles.css";

const SAVE_KEY = "escape_room_save_v1";

type EndingType = "normal_key" | "normal_password" | "true_ending" | null;

interface SaveData {
  version: number;
  savedAt: number;
  inventory: string[];
  investigatedCells: number[];
  drawerUnlocked: boolean;
  boxOpened: boolean;
  paintingRemoved: boolean;
  curtainChecked: boolean;
  escaped: boolean;
  escapeMethod: "key" | "password" | null;
  flashlightActive: boolean;
  lastHint: string;
  gameStartTime: number;
  combineCount: number;
  endingType: EndingType;
}

type ItemCategory = "key_fragment" | "note" | "tool";

interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string;
  description: string;
  detail: string;
}

interface CombineRecipe {
  id: string;
  inputs: string[];
  output: string;
  consumesInputs: boolean;
  successMessage: string;
  failMessage: string;
}

interface CellState {
  label: string;
  icon: string;
}

type GameStage =
  | "intro"
  | "got_drawer_clue"
  | "drawer_unlocked"
  | "got_screwdriver"
  | "got_flashlight"
  | "painting_removed"
  | "box_opened"
  | "curtain_checked"
  | "carpet_checked"
  | "escaped";

type LockTarget = "drawer" | "box" | "door" | "hidden" | null;

const HIDDEN_PASSWORD = "482";

const ITEMS: Record<string, ItemDef> = {
  frag_a: {
    id: "frag_a",
    name: "钥匙碎片·甲",
    category: "key_fragment",
    icon: "🗝️",
    description: "一把锈迹斑斑的钥匙残片，边缘呈锯齿状。",
    detail:
      "这是钥匙的顶部，齿纹清晰可辨。上面刻着一个微小的符号「\u2299」，似乎暗示着某种机关。碎片边缘的锯齿恰好能与另一片吻合——也许还有更多碎片散落在房间里。",
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
      "纸条上用褪色的墨水写着：\n\n「书脊编号 7-3-1，倒序即真相。」\n\n背面还有一行小字：「此乃抽屉之钥——三位数，莫记错。」\n\n看来这是某个三位密码锁的提示……",
  },
  note_drawer: {
    id: "note_drawer",
    name: "纸条·抽屉暗语",
    category: "note",
    icon: "📝",
    description: "抽屉底部刻槽中取出的薄纸片。",
    detail:
      "纸片上用铅笔画了一个箭头指向挂画的方向，旁边写着：\n\n「挂画背后藏玄机，需用螺丝起子撬之。」\n\n下方还有一行小字：「铁皮箱封条固，同一工具可破之。」\n\n看来需要一把螺丝刀才能继续探索。",
  },
  note_curtain: {
    id: "note_curtain",
    name: "纸条·窗帘刻字",
    category: "note",
    icon: "📝",
    description: "窗帘背后被人用指甲刻下的留言。",
    detail:
      "窗帘背面深深的划痕组成了一句话：\n\n「向左三圈，再向右一圈。」\n\n旁边还有一个歪歪扭扭的太阳图案和一句话：「钥匙集齐时，按此法转动门锁方可开启。」\n\n这是使用完整钥匙开锁的关键提示！",
  },
  note_carpet: {
    id: "note_carpet",
    name: "纸条·地毯暗号",
    category: "note",
    icon: "📝",
    description: "用手电筒照亮的荧光墨水暗号，在地毯角落若隐若现。",
    detail:
      "荧光墨水在灯光下显现出一串数字：\n\n「1-3-7-9」\n\n旁边画着一把钥匙的轮廓和「开门密码」四个字。下方还有一行小字：「若遗失钥匙，可凭此密码开启门锁。」\n\n这串数字就是门锁的四位密码！",
  },
  flashlight: {
    id: "flashlight",
    name: "手电筒（无电池）",
    category: "tool",
    icon: "🔦",
    description: "一盏小巧的LED手电筒，但电池仓是空的。",
    detail:
      "手电筒外观完好，开关灵敏，但电池仓是空的——没有电池就无法点亮。灯头处的透镜干净透亮，看来之前的主人很爱惜它。\n\n提示：需要找到一节电池才能使用。装电池的地方……也许在抽屉里？",
  },
  screwdriver: {
    id: "screwdriver",
    name: "螺丝刀",
    category: "tool",
    icon: "\uD83D\uDD27",
    description: "一把一字螺丝刀，刀柄略有磨损。",
    detail:
      "螺丝刀尺寸不大，但金属杆十分坚固。刀柄处有使用过的划痕，说明前主人常用它。\n\n提示：挂画的挂钩和箱子的封条似乎都能用它撬开。",
  },
  complete_key: {
    id: "complete_key",
    name: "完整钥匙",
    category: "key_fragment",
    icon: "🔑",
    description: "三片碎片拼合而成的完整钥匙，散发着金属光泽。",
    detail:
      "将三片碎片按「\u2299」符号、「右转两次」刻字、「三合一」提示的顺序组合，形成一把完整的钥匙。钥匙柄上有三道刻痕，提示着使用方法：向左三圈，再向右一圈。",
  },
  battery: {
    id: "battery",
    name: "电池",
    category: "tool",
    icon: "🔋",
    description: "一节崭新的五号电池，电量充足。",
    detail:
      "一节标准的五号干电池，包装完好。上面标注着「高能环保」的字样。也许能给某些电子设备供电——比如手电筒？",
  },
  powered_flashlight: {
    id: "powered_flashlight",
    name: "可用手电筒",
    category: "tool",
    icon: "🔦",
    description: "装上电池的手电筒，光束明亮。",
    detail:
      "手电筒装上电池后焕然一新，光束聚焦良好。照亮暗处时能看到平时肉眼难以察觉的痕迹——也许房间某些角落还藏着用荧光墨水书写的暗号。\n\n提示：打开手电筒后，检查地毯下方。",
  },
  note_hidden_curtain: {
    id: "note_hidden_curtain",
    name: "暗码·窗帘",
    category: "note",
    icon: "📜",
    description: "窗帘最深折痕处隐约刻下的数字暗号。",
    detail:
      "将窗帘完全展开，在最深处的一道折缝中，有人用针尖刻下了一个数字：\n\n「4」\n\n字迹虽浅却清晰，似乎暗示着某种密码的一位数字。窗帘、挂画、台灯——这三处若都有暗码，拼在一起也许就是真相的钥匙。",
  },
  note_hidden_painting: {
    id: "note_hidden_painting",
    name: "暗码·挂画",
    category: "note",
    icon: "📜",
    description: "画框内侧隐秘角落刻下的数字暗号。",
    detail:
      "取下挂画后，将画框翻到背面，在靠近挂钩的一个隐秘角落里，发现了被人用小刀刻下的数字：\n\n「8」\n\n刻痕很新，像是不久前才留下的。窗帘、挂画、台灯——这三处的暗码拼在一起，也许能打开另一扇门。",
  },
  note_hidden_lamp: {
    id: "note_hidden_lamp",
    name: "暗码·台灯",
    category: "note",
    icon: "📜",
    description: "台灯底座下方贴着的微型数字暗号。",
    detail:
      "将台灯轻轻抬起，底座下方贴着一张几乎看不见的微型标签，上面用极小的字体印着一个数字：\n\n「2」\n\n标签边缘有胶水残留的痕迹，似乎是匆忙贴上的。窗帘「4」、挂画「8」、台灯「2」——按此顺序排列，就是三位隐藏密码：4-8-2。",
  },
};

const CELL_LABELS: CellState[] = [
  { label: "书架", icon: "📚" },
  { label: "花瓶", icon: "🏺" },
  { label: "抽屉", icon: "🗄️" },
  { label: "挂画", icon: "🖼️" },
  { label: "地毯", icon: "🧶" },
  { label: "台灯", icon: "💡" },
  { label: "门锁", icon: "🔒" },
  { label: "箱子", icon: "📦" },
  { label: "窗帘", icon: "🪟" },
];

const DRAWER_PASSWORD = "137";
const DOOR_PASSWORD = "1379";

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  key_fragment: "钥匙",
  note: "纸条",
  tool: "工具",
};

const CATEGORY_COLOR: Record<ItemCategory, string> = {
  key_fragment: "#f97316",
  note: "#a855f7",
  tool: "#22d3ee",
};

const COMBINE_RECIPES: CombineRecipe[] = [
  {
    id: "complete_key",
    inputs: ["frag_a", "frag_b", "frag_c"],
    output: "complete_key",
    consumesInputs: true,
    successMessage: "🔑 三片碎片成功组合成完整钥匙！",
    failMessage: "碎片似乎对不上，需要集齐三片才能组合。",
  },
  {
    id: "powered_flashlight",
    inputs: ["flashlight", "battery"],
    output: "powered_flashlight",
    consumesInputs: true,
    successMessage: "🔦 手电筒装上电池，亮了！可以照亮暗处了！",
    failMessage: "这两样东西似乎没法组合在一起。",
  },
];

type FilterTab = "all" | ItemCategory;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "key_fragment", label: "钥匙" },
  { key: "note", label: "纸条" },
  { key: "tool", label: "工具" },
];

interface CellContent {
  description: string;
  clueDetail: string;
  nextHint: string;
  itemId?: string;
  requires?: string;
  isLocked?: boolean;
  lockReason?: string;
  alreadyChecked?: boolean;
}

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [inventory, setInventory] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "info" | "collect" | "empty" | "error" } | null>(null);
  const [detailItem, setDetailItem] = useState<ItemDef | null>(null);
  const [justCollected, setJustCollected] = useState<string | null>(null);
  const [messageTimer, setMessageTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [flashlightActive, setFlashlightActive] = useState(false);
  const [escaped, setEscaped] = useState(false);
  const [escapeMethod, setEscapeMethod] = useState<"key" | "password" | null>(null);
  const [investigatedCells, setInvestigatedCells] = useState<Set<number>>(new Set());
  const [clueModalIndex, setClueModalIndex] = useState<number | null>(null);
  const [lastHint, setLastHint] = useState("");

  const [lockTarget, setLockTarget] = useState<LockTarget>(null);
  const [lockDigits, setLockDigits] = useState<string[]>([]);
  const [lockError, setLockError] = useState(false);

  const [combineMode, setCombineMode] = useState(false);
  const [selectedForCombine, setSelectedForCombine] = useState<string[]>([]);

  const [drawerUnlocked, setDrawerUnlocked] = useState(false);
  const [boxOpened, setBoxOpened] = useState(false);
  const [paintingRemoved, setPaintingRemoved] = useState(false);
  const [curtainChecked, setCurtainChecked] = useState(false);

  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [combineCount, setCombineCount] = useState(0);
  const [endingType, setEndingType] = useState<EndingType>(null);

  const showMsg = useCallback(
    (text: string, type: "info" | "collect" | "empty" | "error") => {
      setMessage({ text, type });
      setLastHint(text);
      if (messageTimer) clearTimeout(messageTimer);
      const timer = setTimeout(() => setMessage(null), 2500);
      setMessageTimer(timer);
    },
    [messageTimer]
  );

  const hasExistingSave = useMemo(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as SaveData;
      if (data.version !== 1) return false;
      return (
        data.inventory.length > 0 ||
        (data.investigatedCells?.length ?? 0) > 0 ||
        data.drawerUnlocked ||
        data.boxOpened ||
        data.paintingRemoved ||
        data.curtainChecked ||
        data.escaped ||
        data.flashlightActive
      );
    } catch {
      return false;
    }
  }, [gameStarted]);

  const saveGame = useCallback(() => {
    try {
      const saveData: SaveData = {
        version: 1,
        savedAt: Date.now(),
        inventory: [...inventory],
        investigatedCells: Array.from(investigatedCells),
        drawerUnlocked,
        boxOpened,
        paintingRemoved,
        curtainChecked,
        escaped,
        escapeMethod,
        flashlightActive,
        lastHint,
        gameStartTime,
        combineCount,
        endingType,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error("保存游戏失败:", e);
    }
  }, [
    inventory,
    investigatedCells,
    drawerUnlocked,
    boxOpened,
    paintingRemoved,
    curtainChecked,
    escaped,
    escapeMethod,
    flashlightActive,
    lastHint,
    gameStartTime,
    combineCount,
    endingType,
  ]);

  const loadGame = useCallback(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as SaveData;
      if (data.version !== 1) return false;

      setInventory(data.inventory || []);
      setInvestigatedCells(new Set(data.investigatedCells || []));
      setDrawerUnlocked(!!data.drawerUnlocked);
      setBoxOpened(!!data.boxOpened);
      setPaintingRemoved(!!data.paintingRemoved);
      setCurtainChecked(!!data.curtainChecked);
      setEscaped(!!data.escaped);
      setEscapeMethod(data.escapeMethod || null);
      setFlashlightActive(!!data.flashlightActive);
      setLastHint(data.lastHint || "");
      setGameStartTime(data.gameStartTime || Date.now());
      setCombineCount(data.combineCount || 0);
      setEndingType(data.endingType || null);
      return true;
    } catch (e) {
      console.error("读取存档失败:", e);
      return false;
    }
  }, []);

  const clearSave = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error("清除存档失败:", e);
    }
  }, []);

  const resetGameState = useCallback(() => {
    setInventory([]);
    setInvestigatedCells(new Set());
    setDrawerUnlocked(false);
    setBoxOpened(false);
    setPaintingRemoved(false);
    setCurtainChecked(false);
    setEscaped(false);
    setEscapeMethod(null);
    setFlashlightActive(false);
    setLastHint("");
    setMessage(null);
    setDetailItem(null);
    setJustCollected(null);
    setFilterTab("all");
    setLockTarget(null);
    setLockDigits([]);
    setLockError(false);
    setCombineMode(false);
    setSelectedForCombine([]);
    setClueModalIndex(null);
    setGameStartTime(0);
    setCurrentTime(0);
    setCombineCount(0);
    setEndingType(null);
  }, []);

  const handleNewGame = useCallback(() => {
    clearSave();
    resetGameState();
    setGameStartTime(Date.now());
    setGameStarted(true);
  }, [clearSave, resetGameState]);

  const handleContinue = useCallback(() => {
    if (loadGame()) {
      setGameStarted(true);
      setTimeout(() => showMsg("📂 已加载存档，继续你的逃脱之旅！", "info"), 0);
    } else {
      handleNewGame();
    }
  }, [loadGame, handleNewGame, showMsg]);

  const handleRestart = useCallback(() => {
    if (confirm("确定要重新开始吗？当前进度将被清除且无法恢复。")) {
      clearSave();
      resetGameState();
      showMsg("🔄 游戏已重置，开始新的冒险！", "info");
    }
  }, [clearSave, resetGameState, showMsg]);

  useEffect(() => {
    if (gameStarted) {
      saveGame();
    }
  }, [
    gameStarted,
    inventory,
    investigatedCells,
    drawerUnlocked,
    boxOpened,
    paintingRemoved,
    curtainChecked,
    escaped,
    escapeMethod,
    flashlightActive,
    lastHint,
    combineCount,
    endingType,
    saveGame,
  ]);

  useEffect(() => {
    if (!gameStarted || escaped || gameStartTime === 0) return;
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, escaped, gameStartTime]);

  const formatTime = useCallback((ms: number): string => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const elapsedTime = currentTime > 0 && gameStartTime > 0 ? currentTime - gameStartTime : 0;

  const hasItem = (id: string) => inventory.includes(id);
  const hasFlashlight = hasItem("flashlight");
  const hasPoweredFlashlight = hasItem("powered_flashlight");
  const hasScrewdriver = hasItem("screwdriver");
  const hasCompleteKey = hasItem("complete_key");
  const hasBattery = hasItem("battery");
  const fragmentCount = inventory.filter(
    (id) => ITEMS[id]?.category === "key_fragment" && id !== "complete_key"
  ).length;
  const noteCount = inventory.filter((id) => ITEMS[id]?.category === "note").length;
  const toolCount = inventory.filter((id) => ITEMS[id]?.category === "tool").length;

  const hiddenClueCount = [
    hasItem("note_hidden_curtain"),
    hasItem("note_hidden_painting"),
    hasItem("note_hidden_lamp"),
  ].filter(Boolean).length;
  const hasAllHiddenClues = hiddenClueCount === 3;

  const findMatchingRecipe = useCallback((): CombineRecipe | null => {
    for (const recipe of COMBINE_RECIPES) {
      const allInputsSelected = recipe.inputs.every((inputId) =>
        selectedForCombine.includes(inputId)
      );
      const noExtraSelected = selectedForCombine.every((id) =>
        recipe.inputs.includes(id)
      );
      const countsMatch = recipe.inputs.length === selectedForCombine.length;
      const notAlreadyHave = !hasItem(recipe.output);
      if (allInputsSelected && noExtraSelected && countsMatch && notAlreadyHave) {
        return recipe;
      }
    }
    return null;
  }, [selectedForCombine, inventory]);

  const canCombine = findMatchingRecipe() !== null;

  const toggleCombineSelect = useCallback(
    (itemId: string) => {
      if (selectedForCombine.includes(itemId)) {
        setSelectedForCombine((prev) => prev.filter((id) => id !== itemId));
      } else if (selectedForCombine.length < 3) {
        setSelectedForCombine((prev) => [...prev, itemId]);
      }
    },
    [selectedForCombine]
  );

  const handleCombine = useCallback(() => {
    const recipe = findMatchingRecipe();
    if (!recipe) {
      showMsg("这几样东西似乎没法组合在一起。", "error");
      return;
    }

    setInventory((prev) => {
      let next = prev;
      if (recipe.consumesInputs) {
        next = prev.filter((id) => !recipe.inputs.includes(id));
      }
      if (!next.includes(recipe.output)) {
        next = [...next, recipe.output];
      }
      return next;
    });

    setCombineCount((prev) => prev + 1);
    setJustCollected(recipe.output);
    setTimeout(() => setJustCollected(null), 600);
    showMsg(recipe.successMessage, "collect");
    setSelectedForCombine([]);
    setCombineMode(false);
  }, [findMatchingRecipe, showMsg]);

  const toggleCombineMode = useCallback(() => {
    setCombineMode((prev) => !prev);
    setSelectedForCombine([]);
  }, []);

  const collectItem = useCallback(
    (itemId: string) => {
      setInventory((prev) => {
        if (prev.includes(itemId)) return prev;
        setJustCollected(itemId);
        setTimeout(() => setJustCollected(null), 600);
        return [...prev, itemId];
      });
    },
    []
  );

  const getCellContent = useCallback(
    (index: number): CellContent => {
      const cell = CELL_LABELS[index];
      const isInvestigated = investigatedCells.has(index);

      switch (cell.label) {
        case "书架": {
          const got = hasItem("note_bookshelf");
          return {
            description: got
              ? "一排落满灰尘的旧书，书脊上标注着奇怪的编号。"
              : "一排落满灰尘的旧书，书脊上标注着奇怪的编号，似乎藏着什么秘密。",
            clueDetail: got
              ? "书架上整齐排列着十几本老旧书籍，书脊上的编号从1到9依次排列。第7、3、1册位置明显被动过，不过夹层里的纸条已经被你取走了。"
              : "书架上整齐排列着十几本老旧书籍，书脊上的编号从1到9依次排列，但第7、3、1册的书脊颜色略有不同，似乎经常被人抽出过。仔细检查书架夹层，你发现了一张藏在书后的泛黄纸条。",
            nextHint: got
              ? "书架已经仔细检查过了，试试其他地方。"
              : "纸条上写着「书脊编号7-3-1，倒序即真相」，背面说这是抽屉的三位密码。倒序排列——1-3-7，这就是抽屉的密码！去试试抽屉吧。",
            itemId: got ? undefined : "note_bookshelf",
            alreadyChecked: got,
          };
        }

        case "花瓶": {
          const got = hasItem("frag_a");
          return {
            description: got
              ? "一只青花瓷花瓶，瓶口空着。"
              : "一只青花瓷花瓶，瓶口似乎塞着什么东西。",
            clueDetail: got
              ? "青花瓷瓶身上绘着缠枝莲纹，瓶底有「大明宣德年制」的落款。瓶口已经空了——你之前取出的那枚钥匙碎片就是从这里发现的。"
              : "青花瓷瓶身上绘着缠枝莲纹，瓶底有「大明宣德年制」的落款。瓶口塞着一团皱巴巴的纸条？不对——伸手进去摸索，你触碰到一块冰凉的金属碎片。",
            nextHint: got
              ? "花瓶里的东西已经被你取走了。"
              : "获得了一枚钥匙碎片！碎片上刻着符号「\u2299」。房间里应该还有其他碎片，继续寻找它们吧。也许书架上能找到更多线索？",
            itemId: got ? undefined : "frag_a",
            alreadyChecked: got,
          };
        }

        case "抽屉": {
          if (!drawerUnlocked) {
            const hasClue = hasItem("note_bookshelf");
            return {
              description: "一只上了锁的木抽屉，锁上是三位数字密码盘。",
              clueDetail: hasClue
                ? "木质抽屉已经有些老旧，导轨发出吱呀的响声。抽屉正面嵌着一个三位数字密码锁，锁旁有一些划痕，似乎有人曾尝试过暴力开锁。你从书架的纸条上得知了密码提示——7-3-1倒序就是1-3-7。"
                : "木质抽屉已经有些老旧，导轨发出吱呀的响声。抽屉正面嵌着一个三位数字密码锁，锁旁有一些划痕，似乎有人曾尝试过暴力开锁。但你不知道密码是什么……",
              nextHint: hasClue
                ? "输入三位密码1-3-7来打开抽屉！"
                : "抽屉被三位密码锁锁住了。也许房间里某个地方藏着密码的线索……去书架看看？",
              isLocked: true,
              lockReason: "三位密码锁",
            };
          } else {
            const gotScrewdriver = hasItem("screwdriver");
            const gotNote = hasItem("note_drawer");
            const gotBattery = hasItem("battery");
            const allGot = gotScrewdriver && gotNote && gotBattery;
            const remainingCount =
              (gotScrewdriver ? 0 : 1) + (gotNote ? 0 : 1) + (gotBattery ? 0 : 1);
            let itemToShow: string | undefined;
            if (!gotScrewdriver) itemToShow = "screwdriver";
            else if (!gotBattery) itemToShow = "battery";
            else if (!gotNote) itemToShow = "note_drawer";
            return {
              description: allGot
                ? "一个空木抽屉，里面散落着几张废纸。"
                : `一只打开的木抽屉，里面似乎还有${remainingCount}样东西。`,
              clueDetail: allGot
                ? "木质抽屉敞开着，里面除了几张没用的废纸，所有有价值的东西都被你取走了。底部的刻槽空空如也。"
                : "木质抽屉敞开着，抽屉里散落着几张没用的废纸，底部有一些铅笔涂鸦。抽屉底部内侧有一道细微的刻槽，旁边放着一把螺丝刀和一节电池！",
              nextHint: allGot
                ? "抽屉里的东西都被你取走了，继续探索其他地方吧。"
                : remainingCount === 2
                ? "抽屉里还有东西没拿完，继续探索吧！"
                : remainingCount === 1
                ? "抽屉里还有一样东西，别忘了拿走！"
                : "你在抽屉里发现了螺丝刀、电池和一张纸条！纸条提示：挂画背后和铁皮箱都需要螺丝刀才能打开。",
              itemId: itemToShow,
              alreadyChecked: allGot,
            };
          }
        }

        case "挂画": {
          if (!paintingRemoved) {
            return {
              description: hasScrewdriver
                ? "一幅暗色调油画，画框用螺丝固定着，可以用螺丝刀取下。"
                : "一幅暗色调油画，画框被螺丝牢牢固定在墙上。",
              clueDetail: hasScrewdriver
                ? "画作描绘的是一片阴沉的森林，色调压抑。画框的四角用螺丝钉牢牢固定在墙上——不过你手里有螺丝刀，正合适！"
                : "画作描绘的是一片阴沉的森林，色调压抑。画框的四角用螺丝钉牢牢固定在墙上，徒手根本取不下来。需要什么工具才能把它撬开呢？",
              nextHint: hasScrewdriver
                ? "用螺丝刀取下挂画，看看背后藏着什么！"
                : "挂画被螺丝钉固定住了，需要找到工具才能取下。也许抽屉里会有你需要的东西？",
              requires: "screwdriver",
              isLocked: true,
              lockReason: "需要螺丝刀",
            };
          } else {
            const gotFrag = hasItem("frag_b");
            const gotHidden = hasItem("note_hidden_painting");
            if (!gotFrag) {
              return {
                description: "墙上挂着的画被取下来了，挂钩上似乎挂着东西。",
                clueDetail:
                  "挂画被取下后靠在墙边，墙上原本挂画的位置露出了斑驳的石灰墙面。画框背面的挂钩上，挂着一片金属碎片，在手电筒光下闪着冷光。",
                nextHint:
                  "获得了第二枚钥匙碎片！内侧刻有「右转两次」的字样。继续寻找第三枚碎片——也许铁皮箱子里有线索？",
                itemId: "frag_b",
                alreadyChecked: false,
              };
            }
            if (!gotHidden) {
              return {
                description: "靠在墙边的画框，背面似乎还有未被发现的细节。",
                clueDetail:
                  "再次将画框翻到背面，在靠近挂钩的一个隐秘角落里——你之前没注意到的地方——发现了被人用小刀刻下的痕迹。凑近看，是一个数字「8」！",
                nextHint:
                  "获得了隐藏线索！挂画暗码是「8」。窗帘、挂画、台灯——三处暗码集齐后可解出隐藏密码。",
                itemId: "note_hidden_painting",
                alreadyChecked: false,
              };
            }
            return {
              description: "画框背面已被你彻底检查过了。",
              clueDetail:
                "画框被取下后靠在墙边。你已经取走了钥匙碎片，并在画框背面发现了隐藏的数字「8」。这里没有更多东西了。",
              nextHint: "挂画区域已彻底搜索完毕。",
              alreadyChecked: true,
            };
          }
        }

        case "地毯": {
          const got = hasItem("note_carpet");
          const canSee = flashlightActive && hasPoweredFlashlight;
          return {
            description: got
              ? "厚实的波斯地毯，边角微微翘起。"
              : canSee
              ? "厚实的波斯地毯，角落有荧光字迹在手电筒光下若隐若现。"
              : "厚实的波斯地毯，边角微微翘起，下面似乎压着东西。",
            clueDetail: got
              ? "波斯地毯图案繁复，织工精细。地毯边角微微翘起——不过荧光暗号已经被你记录下来了，这里没有更多东西了。"
              : canSee
              ? "波斯地毯图案繁复，织工精细。在手电筒的强光照射下，地毯角落的荧光墨水逐渐显现——那是一串数字和一些说明文字！"
              : hasFlashlight && !hasPoweredFlashlight
              ? "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。你有手电筒，但好像没装电池，亮不起来。"
              : "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。凑近仔细看，地毯角落隐约有一些痕迹，但光线太暗看不清楚。",
            nextHint: got
              ? "地毯的线索已经收集完毕。"
              : canSee
              ? "荧光暗号显示密码是1-3-7-9！这就是门锁的四位密码！如果你集齐了钥匙碎片和窗帘上的使用说明，也可以选择用钥匙开锁。"
              : hasPoweredFlashlight
              ? "地毯下似乎藏着秘密，先打开手电筒照照看！"
              : hasFlashlight
              ? "手电筒没电池，亮不起来。也许需要找一节电池来——抽屉里好像有工具？"
              : "地毯下似乎有痕迹但看不清楚。也许需要一盏能照亮暗处的工具——台灯旁边是不是有什么？",
            itemId: got ? undefined : canSee ? "note_carpet" : undefined,
            requires: canSee ? undefined : "powered_flashlight",
            alreadyChecked: got,
          };
        }

        case "台灯": {
          const gotFlashlight = hasItem("flashlight");
          const gotHidden = hasItem("note_hidden_lamp");
          if (!gotFlashlight) {
            return {
              description: "一盏复古台灯，灯罩下藏着小巧的手电筒。",
              clueDetail:
                "复古台灯造型优雅，灯罩是磨砂玻璃的。灯座旁放着一盏小巧的LED手电筒，看起来电量还很充足。",
              nextHint:
                "获得了手电筒！打开它可以照亮房间里的暗处——地毯下方似乎有什么东西需要光照才能看清。",
              itemId: "flashlight",
              alreadyChecked: false,
            };
          }
          if (!gotHidden) {
            return {
              description: "一盏复古台灯静静地立在那里，灯座下方似乎有些异样。",
              clueDetail:
                "再次仔细观察台灯，你注意到底座似乎微微翘起。小心地将台灯抬起——底座下方贴着一张几乎看不见的微型标签，上面用极小的字体印着一个数字「2」！",
              nextHint:
                "获得了隐藏线索！台灯暗码是「2」。窗帘「4」、挂画「8」、台灯「2」——按此顺序排列，隐藏密码就是 4-8-2！",
              itemId: "note_hidden_lamp",
              alreadyChecked: false,
            };
          }
          return {
            description: "复古台灯静静地立在那里，已被你彻底检查过。",
            clueDetail:
              "复古台灯造型优雅，灯罩是磨砂玻璃的。你已经拿走了灯座旁的手电筒，并在底座下方发现了隐藏的数字「2」。这里没有更多东西了。",
            nextHint: "台灯区域已彻底搜索完毕。",
            alreadyChecked: true,
          };
        }

        case "门锁": {
          if (escaped) {
            return {
              description: "一扇打开的铁门，外面是通往自由的走廊。",
              clueDetail: "厚重的铁门已经被打开，外面的走廊透进柔和的光线。你成功逃脱了！",
              nextHint: "你已经成功逃出密室了！",
              alreadyChecked: true,
            };
          }
          const missingSteps: string[] = [];
          if (!drawerUnlocked) missingSteps.push("打开抽屉");
          if (!paintingRemoved) missingSteps.push("取下挂画");
          if (!boxOpened) missingSteps.push("撬开箱子");
          if (!hasItem("note_curtain")) missingSteps.push("查看窗帘刻字");
          if (!hasItem("note_carpet")) missingSteps.push("找到地毯密码");

          const canUseKey = hasCompleteKey && hasItem("note_curtain") && drawerUnlocked && boxOpened && paintingRemoved;
          const canUsePassword = hasItem("note_carpet") && drawerUnlocked && boxOpened && paintingRemoved;
          const allExplored = drawerUnlocked && boxOpened && paintingRemoved;

          let hintText = "";
          if (missingSteps.length > 0) {
            hintText = `还需完成：${missingSteps.join("、")}。`;
          }
          if (canUseKey && canUsePassword) {
            hintText += " 一切就绪！可以用完整钥匙开锁，或输入密码 1-3-7-9 开门。";
          } else if (canUsePassword) {
            hintText += " 地毯暗号已知：1-3-7-9，可以输入密码开门了！";
          } else if (canUseKey) {
            hintText += " 完整钥匙和使用方法都已齐备，可以用钥匙开锁了！";
          } else if (allExplored && fragmentCount < 3) {
            hintText += ` 还需收集 ${3 - fragmentCount} 片钥匙碎片。`;
          } else if (allExplored && fragmentCount === 3 && !hasCompleteKey) {
            hintText += " 三枚碎片已齐，到物品栏组合成完整钥匙！";
          } else if (allExplored && hasCompleteKey && !hasItem("note_curtain")) {
            hintText += " 钥匙已组合好，但还需要查看窗帘上的使用方法。";
          }

          return {
            description: "一扇铁门上的密码锁，需要完成全部探索才能开启。",
            clueDetail:
              "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。锁下方刻着一行小字：「须尽搜此间所有机关，方可开启此门。」",
            nextHint: hintText || "继续探索房间，完成所有关键步骤后再来。",
            isLocked: true,
            lockReason: missingSteps.length > 0 ? `未完成：${missingSteps.join("、")}` : "需要密码或钥匙",
          };
        }

        case "箱子": {
          if (!boxOpened) {
            return {
              description: hasScrewdriver
                ? "一只贴着破旧封条的铁皮箱，用螺丝刀可以撬开。"
                : "一只贴着封条的铁皮箱，封条用铆钉固定，徒手无法打开。",
              clueDetail: hasScrewdriver
                ? "铁皮箱上贴着破旧的封条，写着「证物」二字。封条用铆钉固定得很紧——不过你的螺丝刀正好能派上用场！"
                : "铁皮箱上贴着破旧的封条，写着「证物」二字。封条用铆钉固定得很紧，徒手根本撕不开。需要什么工具才能撬开呢？",
              nextHint: hasScrewdriver
                ? "用螺丝刀撬开箱子的封条，看看里面藏着什么！"
                : "箱子被牢牢封住了，需要工具才能打开。抽屉里似乎能找到你需要的东西……",
              requires: "screwdriver",
              isLocked: true,
              lockReason: "需要螺丝刀撬开",
            };
          } else {
            const got = hasItem("frag_c");
            return {
              description: got
                ? "一只撬开的铁皮箱，空了。"
                : "一只撬开的铁皮箱，底部的暗格隐约可见金属光泽。",
              clueDetail: got
                ? "铁皮箱的封条已被撕毁，箱盖敞开着。底部暗格也被打开了，里面空空如也——那枚钥匙碎片已经被你取走。"
                : "铁皮箱的封条已被撕毁，箱盖敞开着。箱子里没有别的东西，但底部有一个暗格！打开暗格，里面躺着一枚钥匙的尾部碎片。",
              nextHint: got
                ? "箱子已经彻底搜过了。"
                : "获得了第三枚钥匙碎片！握柄背面刻着「三合一，门自开」。现在三枚碎片都齐了，可以去物品栏组合成完整钥匙了！",
              itemId: got ? undefined : "frag_c",
              alreadyChecked: got,
            };
          }
        }

        case "窗帘": {
          const gotNote = hasItem("note_curtain");
          const gotHidden = hasItem("note_hidden_curtain");
          if (!curtainChecked) {
            return {
              description: "厚重的深色窗帘，遮住了整个窗户。",
              clueDetail:
                "厚重的深色窗帘完全遮住了窗户，光线很难透进来。需要拉开窗帘仔细检查一下。",
              nextHint: "拉开窗帘后，发现窗帘背面有刻字——记下来，这对用钥匙开锁很重要！",
              alreadyChecked: false,
            };
          }
          if (!gotNote) {
            return {
              description: "厚重的深色窗帘，半拉开着遮住窗户。",
              clueDetail:
                "厚重的深色窗帘完全遮住了窗户，光线很难透进来。拉开窗帘，窗玻璃被封死了——但窗帘背面！有人用指甲在窗帘布上刻下了字迹。",
              nextHint:
                "窗帘背面刻着「向左三圈，再向右一圈」，这是使用完整钥匙开锁的转动方法！如果你已经集齐了三片钥匙碎片，就可以组合成完整钥匙了。",
              itemId: "note_curtain",
              alreadyChecked: false,
            };
          }
          if (!gotHidden) {
            return {
              description: "厚重的深色窗帘半拉开着，最深处的折缝中似乎藏着什么。",
              clueDetail:
                "将窗帘完全展开，在最深处的一道折缝中——你之前没有注意到的地方——发现了有人用针尖刻下的痕迹。凑近仔细辨认，是一个数字「4」！",
              nextHint:
                "获得了隐藏线索！窗帘暗码是「4」。继续寻找挂画和台灯的隐藏暗码，三处集齐后可解出隐藏密码。",
              itemId: "note_hidden_curtain",
              alreadyChecked: false,
            };
          }
          return {
            description: "厚重的深色窗帘半拉开着，已被你彻底检查过。",
            clueDetail:
              "厚重的深色窗帘被半拉开着，露出了被封死的窗户。你已经记录下了窗帘背面的开锁方法，并在最深处的折缝中发现了隐藏的数字「4」。这里没有更多东西了。",
            nextHint: "窗帘区域已彻底搜索完毕。",
            alreadyChecked: true,
          };
        }

        default:
          return {
            description: cell.label,
            clueDetail: "",
            nextHint: "",
          };
      }
    },
    [
      investigatedCells,
      inventory,
      drawerUnlocked,
      boxOpened,
      paintingRemoved,
      curtainChecked,
      escaped,
      fragmentCount,
      hasCompleteKey,
      flashlightActive,
    ]
  );

  const handleCellClick = useCallback(
    (index: number) => {
      if (escaped) return;
      const cell = CELL_LABELS[index];
      const content = getCellContent(index);

      if (!investigatedCells.has(index)) {
        setInvestigatedCells((prev) => new Set(prev).add(index));
      }

      if (cell.label === "门锁") {
        setLockTarget("door");
        setLockDigits([]);
        setLockError(false);
        return;
      }

      if (cell.label === "抽屉" && content.isLocked) {
        setLockTarget("drawer");
        setLockDigits([]);
        setLockError(false);
        return;
      }

      if (content.requires && !hasItem(content.requires)) {
        if (cell.label === "挂画") {
          showMsg("挂画被螺丝固定，需要螺丝刀才能取下。", "error");
        } else if (cell.label === "箱子") {
          showMsg("箱子封条太牢固，需要螺丝刀才能撬开。", "error");
        } else if (cell.label === "地毯" && content.requires === "powered_flashlight") {
          if (hasPoweredFlashlight && !flashlightActive) {
            showMsg("光线太暗，先打开手电筒看看。", "info");
          } else if (hasFlashlight && !hasPoweredFlashlight) {
            showMsg("手电筒没有电池，亮不起来。需要找到电池后组合使用。", "info");
          } else {
            showMsg("太暗了看不清，需要找到能发光的工具。", "info");
          }
        }
        setClueModalIndex(index);
        return;
      }

      if (cell.label === "挂画" && !paintingRemoved && hasScrewdriver) {
        setPaintingRemoved(true);
        showMsg("\uD83D\uDD27 用螺丝刀取下了挂画！", "collect");
      }

      if (cell.label === "箱子" && !boxOpened && hasScrewdriver) {
        setBoxOpened(true);
        showMsg("\uD83D\uDD27 用螺丝刀撬开了箱子封条！", "collect");
      }

      if (cell.label === "窗帘" && !curtainChecked) {
        setCurtainChecked(true);
      }

      if (content.itemId) {
        if (content.itemId === "note_hidden_curtain") {
          showMsg("\uD83D\uDD0D 你将窗帘完全展开，仔细检查着每一道折缝……", "info");
        } else if (content.itemId === "note_hidden_painting") {
          showMsg("\uD83D\uDD0D 你再次将画框翻到背面，仔细检查着每一个角落……", "info");
        } else if (content.itemId === "note_hidden_lamp") {
          showMsg("\uD83D\uDD0D 你小心地抬起台灯，仔细检查着底座下方……", "info");
        }
        collectItem(content.itemId);
      }

      setClueModalIndex(index);
    },
    [
      escaped,
      getCellContent,
      investigatedCells,
      paintingRemoved,
      boxOpened,
      curtainChecked,
      drawerUnlocked,
      hasScrewdriver,
      hasFlashlight,
      flashlightActive,
      collectItem,
      showMsg,
    ]
  );

  const handleItemClick = useCallback(
    (itemId: string) => {
      if (combineMode) {
        toggleCombineSelect(itemId);
        return;
      }
      if (itemId === "powered_flashlight") {
        setFlashlightActive((prev) => !prev);
        if (!flashlightActive) {
          showMsg("🔦 手电筒已打开，暗处的线索将显现！", "collect");
        } else {
          showMsg("手电筒已关闭", "info");
        }
      }
      setDetailItem(ITEMS[itemId]);
    },
    [combineMode, toggleCombineSelect, flashlightActive, showMsg]
  );

  const handleLockDigit = useCallback(
    (digit: string) => {
      const maxLen = lockTarget === "drawer" ? 3 : 4;
      if (lockDigits.length < maxLen) {
        setLockDigits((prev) => [...prev, digit]);
        setLockError(false);
      }
    },
    [lockDigits.length, lockTarget]
  );

  const handleLockDelete = useCallback(() => {
    setLockDigits((prev) => prev.slice(0, -1));
    setLockError(false);
  }, []);

  const handleLockSubmit = useCallback(() => {
    if (!lockTarget) return;

    const entered = lockDigits.join("");

    if (lockTarget === "drawer") {
      if (entered === DRAWER_PASSWORD) {
        setDrawerUnlocked(true);
        setLockTarget(null);
        collectItem("screwdriver");
        collectItem("note_drawer");
        collectItem("battery");
        showMsg("🗄️ 抽屉打开了！获得了螺丝刀、纸条和电池！", "collect");
      } else {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
      }
    } else if (lockTarget === "door") {
      if (!drawerUnlocked) {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
        showMsg("你还没有打开抽屉。必须先找到抽屉密码，取出螺丝刀推进探索！", "error");
        return;
      }
      if (!boxOpened) {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
        showMsg("你还没有撬开箱子。必须先用螺丝刀打开箱子，完整探索房间！", "error");
        return;
      }
      if (!paintingRemoved) {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
        showMsg("你还没有取下挂画。必须先用螺丝刀取下挂画，仔细检查每一处！", "error");
        return;
      }
      if (!hasItem("note_carpet")) {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
        showMsg("你还不知道密码是什么。打开手电筒照地毯，找到荧光暗号！", "error");
        return;
      }
      if (entered === DOOR_PASSWORD) {
        setEscapeMethod("password");
        setEndingType("normal_password");
        setEscaped(true);
        setLockTarget(null);
      } else {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
      }
    } else if (lockTarget === "hidden") {
      if (entered === HIDDEN_PASSWORD) {
        setEscapeMethod("password");
        setEndingType("true_ending");
        setEscaped(true);
        setLockTarget(null);
      } else {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
      }
    }
  }, [lockDigits, lockTarget, collectItem, showMsg]);

  const handleUseKeyOnDoor = useCallback(() => {
    if (!drawerUnlocked) {
      showMsg("抽屉还没打开，必须先完成基础探索才能用钥匙！", "error");
      return;
    }
    if (!boxOpened) {
      showMsg("箱子还没撬开，完整探索后再用钥匙！", "error");
      return;
    }
    if (!paintingRemoved) {
      showMsg("挂画还没取下，仔细检查每一处再用钥匙！", "error");
      return;
    }
    if (!hasCompleteKey) {
      showMsg("需要先集齐3片碎片并组合成完整钥匙。", "error");
      return;
    }
    if (!curtainChecked) {
      showMsg("你不知道钥匙要怎么转动，去看看窗帘上的刻字！", "error");
      return;
    }
    if (!hasItem("note_curtain")) {
      showMsg("先仔细查看窗帘背后刻的使用说明。", "error");
      return;
    }
    setEscapeMethod("key");
    setEndingType("normal_key");
    setEscaped(true);
    setLockTarget(null);
  }, [hasCompleteKey, curtainChecked, drawerUnlocked, boxOpened, paintingRemoved, showMsg]);

  const filteredInventory =
    filterTab === "all" ? inventory : inventory.filter((id) => ITEMS[id]?.category === filterTab);

  if (!gameStarted) {
    return (
      <main className="game-shell">
        <section className="hero">
          <p>密室文字逃脱 · H5Game</p>
          <h1>密室文字逃脱</h1>
          <span>点击场景收集线索，按顺序解开谜题，最终逃出密室</span>
        </section>
        <section className="start-panel">
          <div className="start-icon">🔐</div>
          <h2>欢迎来到密室逃脱</h2>
          <p className="start-desc">
            你醒来时发现自己被困在一间神秘的房间里。仔细观察四周，收集线索和道具，
            解开层层谜题，找到逃出密室的方法！
          </p>
          <div className="start-buttons">
            <button className="action-btn start-btn primary-btn" onClick={handleNewGame}>
              🎮 新游戏
            </button>
            {hasExistingSave && (
              <button className="action-btn start-btn continue-btn" onClick={handleContinue}>
                📂 继续游戏
              </button>
            )}
          </div>
          {hasExistingSave && (
            <p className="save-hint">检测到本地存档，点击「继续游戏」可恢复上次进度</p>
          )}
        </section>
      </main>
    );
  }

  if (escaped) {
    const isTrueEnding = endingType === "true_ending";
    const displayTime = formatTime(elapsedTime);

    return (
      <main className="game-shell">
        <section className="hero">
          <p>密室文字逃脱 · H5Game</p>
          <h1>密室文字逃脱</h1>
          <span>点击场景收集线索，按顺序解开谜题，最终逃出密室</span>
        </section>
        <section className={`victory-panel ${isTrueEnding ? "true-ending" : "normal-ending"}`}>
          <div className="victory-icon">
            {isTrueEnding ? "\uD83C\uDFC6" : "\uD83C\uDF89"}
          </div>
          <h2 className={`victory-title ${isTrueEnding ? "true-ending-title" : ""}`}>
            {isTrueEnding ? "真结局 · 真相大白" : "成功逃脱"}
          </h2>
          <p className="victory-ending-tag">
            {isTrueEnding
              ? "✨ 你揭开了所有隐藏的秘密"
              : endingType === "normal_key"
                ? "🗝️ 钥匙逃脱路线"
                : "🔢 密码逃脱路线"}
          </p>

          <div className="victory-story">
            {isTrueEnding ? (
              <>
                <p>
                  当你输入隐藏密码「4-8-2」的那一刻，铁门深处传来一阵低沉的机械转动声。
                  伴随着尘土簌簌落下，墙面缓缓移开，露出了一条从未被人发现的暗道。
                </p>
                <p>
                  你穿过暗道，走进了一间被刻意隐藏的密室。墙上贴满了照片、剪报和手绘的地图——
                  这一切都指向多年前那桩悬而未决的失踪案。
                </p>
                <p>
                  书桌上摊着一本日记，最后一页写着：
                  「如果你能读到这里，说明你比我更聪明。窗帘、挂画、台灯——
                  这三个地方留下的线索，是我留给这个世界最后的真相。」
                </p>
                <p>
                  你紧紧握住日记，走出了暗道。阳光洒在脸上，你知道——
                  这不仅仅是一场逃脱，更是一段尘封真相的揭开。
                </p>
              </>
            ) : endingType === "normal_key" ? (
              <>
                <p>
                  你集齐了三枚钥匙碎片，将它们按「\u2299」符号、「右转两次」刻字、「三合一」提示的顺序
                  小心翼翼地拼合在一起，形成了一把散发着冷光的完整钥匙。
                </p>
                <p>
                  按照窗帘背面刻下的指示——「向左三圈，再向右一圈」——你深吸一口气，
                  将钥匙插入门锁，伴随着清脆的"咔哒"声，沉重的铁门缓缓打开。
                </p>
                <p>
                  你走出密室，重获自由。但在门关上的瞬间，你隐约觉得——
                  这个房间里，似乎还有什么秘密没有被揭开……
                </p>
              </>
            ) : (
              <>
                <p>
                  你通过缜密的推理，依次解开了书架纸条暗示的抽屉密码「1-3-7」，
                  用螺丝刀取下挂画、撬开铁皮箱，收集齐所有关键线索。
                </p>
                <p>
                  最终，你用手电筒照亮地毯角落，发现了用荧光墨水写下的四位密码「1-3-7-9」。
                  当最后一位数字输入完毕，门锁应声而开。
                </p>
                <p>
                  你走出密室，呼吸着新鲜的空气。但回望那扇关闭的铁门时，
                  一丝疑虑涌上心头——窗帘、挂画、台灯，那三个被你匆匆略过的角落，
                  是否还藏着更深的秘密？
                </p>
              </>
            )}
          </div>

          <div className="victory-stats-grid">
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
              <span className="stat-value">{hiddenClueCount}/3</span>
              <span className="stat-label">隐藏线索</span>
            </div>
          </div>

          <div className="victory-buttons">
            <button className="action-btn victory-restart" onClick={handleNewGame}>
              🔄 再来一次
            </button>
            <button
              className="action-btn victory-restart secondary-btn"
              onClick={() => {
                clearSave();
                setGameStarted(false);
              }}
            >
              🏠 返回主菜单
            </button>
          </div>
        </section>
      </main>
    );
  }

  const getCellStatus = (index: number) => {
    const content = getCellContent(index);
    return {
      isLocked: content.isLocked,
      alreadyChecked: content.alreadyChecked,
      isLit: flashlightActive && hasPoweredFlashlight && CELL_LABELS[index].label === "地毯" && !hasItem("note_carpet"),
    };
  };

  return (
    <main className="game-shell">
      <section className="hero">
        <p>密室文字逃脱 · H5Game</p>
        <h1>密室文字逃脱</h1>
        <span>按顺序解开谜题：书架 → 抽屉 → 挂画/箱子 → 窗帘/地毯 → 门锁</span>
      </section>

      <section className="hud hud-5">
        <article>
          <small>用时</small>
          <strong>⏱️ {formatTime(elapsedTime)}</strong>
        </article>
        <article>
          <small>线索</small>
          <strong>📝 {noteCount}</strong>
        </article>
        <article>
          <small>道具</small>
          <strong>🎒 {inventory.length}</strong>
        </article>
        <article>
          <small>组合</small>
          <strong>🔧 {combineCount}</strong>
        </article>
        <article>
          <small>隐藏</small>
          <strong>
            {hiddenClueCount > 0 ? `\uD83D\uDDDD ${hiddenClueCount}/3` : "\uD83D\uDD12 0/3"}
          </strong>
        </article>
      </section>

      <section className="playground escape">
        <div className="board">
          {CELL_LABELS.map((cell, index) => {
            const status = getCellStatus(index);
            const content = getCellContent(index);
            const isInvestigated = investigatedCells.has(index);
            return (
              <button
                className={`board-cell ${status.alreadyChecked ? "collected" : ""} ${status.isLit ? "flashlight-lit" : ""} ${isInvestigated ? "investigated" : ""} ${status.isLocked ? "locked-cell" : ""}`}
                key={index}
                onClick={() => handleCellClick(index)}
                title={status.isLocked ? content.lockReason : ""}
              >
                <span className="cell-icon">{cell.icon}</span>
                <span className="cell-label">{cell.label}</span>
                {status.alreadyChecked && <span className="cell-check">✓</span>}
                {status.isLit && <span className="cell-glow">💡</span>}
                {status.isLocked && !status.alreadyChecked && <span className="cell-locked">🔒</span>}
                {isInvestigated && !status.alreadyChecked && !status.isLocked && (
                  <span className="cell-investigated">👁️</span>
                )}
              </button>
            );
          })}
        </div>

        <aside className="side-panel">
          <h2>物品栏</h2>

          <div className="inventory-summary">
            <span style={{ color: CATEGORY_COLOR.key_fragment }}>
              🗝️ {hasCompleteKey ? 1 : fragmentCount}
            </span>
            <span style={{ color: CATEGORY_COLOR.note }}>📝 {noteCount}</span>
            <span style={{ color: CATEGORY_COLOR.tool }}>
              🔧 {toolCount}
            </span>
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

          {combineMode && (
            <div className="combine-slots">
              <div className="combine-slots-title">
                选择要组合的道具（最多3个）
              </div>
              <div className="combine-slot-row">
                {[0, 1, 2].map((i) => {
                  const itemId = selectedForCombine[i];
                  const item = itemId ? ITEMS[itemId] : null;
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
              {inventory.length === 0
                ? "点击房间中的物品来收集道具。先从书架开始调查吧！"
                : "当前分类下没有道具"}
            </p>
          ) : (
            <div className="inventory-list">
              {filteredInventory.map((itemId) => {
                const item = ITEMS[itemId];
                if (!item) return null;
                const isNew = justCollected === itemId;
                const isActiveFlashlight = itemId === "powered_flashlight" && flashlightActive;
                const isSelected = selectedForCombine.includes(itemId);
                return (
                  <button
                    className={`inventory-item ${isNew ? "item-pop" : ""} ${isActiveFlashlight ? "item-active" : ""} ${isSelected ? "item-selected" : ""} ${combineMode ? "item-combine-mode" : ""}`}
                    key={itemId}
                    onClick={() => handleItemClick(itemId)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-tag" style={{ color: CATEGORY_COLOR[item.category] }}>
                        {CATEGORY_LABEL[item.category]}
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
                disabled={inventory.length < 2}
                title={inventory.length < 2 ? "至少需要2个道具才能组合" : "选择道具进行组合"}
              >
                🔧 组合道具
              </button>
            ) : (
              <>
                <button
                  className="action-btn combine-confirm-btn"
                  disabled={!canCombine}
                  onClick={canCombine ? handleCombine : undefined}
                  title={canCombine ? "确认组合选中的道具" : "选中的道具无法组合，请尝试其他搭配"}
                >
                  {canCombine ? "✨ 确认组合" : "无法组合"}
                </button>
                <button
                  className="action-btn combine-cancel-btn"
                  onClick={toggleCombineMode}
                >
                  取消
                </button>
              </>
            )}
            <button
              className="action-btn"
              disabled={
                !drawerUnlocked ||
                !boxOpened ||
                !paintingRemoved ||
                !hasCompleteKey ||
                !curtainChecked ||
                !hasItem("note_curtain")
              }
              onClick={
                drawerUnlocked &&
                boxOpened &&
                paintingRemoved &&
                hasCompleteKey &&
                curtainChecked &&
                hasItem("note_curtain")
                  ? handleUseKeyOnDoor
                  : undefined
              }
              title={
                !drawerUnlocked
                  ? "需要先打开抽屉"
                  : !boxOpened
                    ? "需要先撬开箱子"
                    : !paintingRemoved
                      ? "需要先取下挂画"
                      : !hasCompleteKey
                        ? "需要先集齐3片碎片并组合成完整钥匙"
                        : !curtainChecked
                          ? "需要先查看窗帘"
                          : !hasItem("note_curtain")
                            ? "需要获得钥匙使用说明纸条"
                            : ""
              }
            >
              {!drawerUnlocked
                ? "先打开抽屉"
                : !boxOpened
                  ? "先撬开箱子"
                  : !paintingRemoved
                    ? "先取下挂画"
                    : !hasCompleteKey
                      ? "需要完整钥匙"
                      : !curtainChecked
                        ? "先查看窗帘"
                        : !hasItem("note_curtain")
                          ? "需要钥匙说明"
                          : "🔑 用钥匙开锁"}
            </button>
          </div>

          <div className="game-menu">
            <button className="action-btn menu-btn restart-btn" onClick={handleRestart}>
              🔄 重新开始
            </button>
            <button
              className="action-btn menu-btn main-menu-btn"
              onClick={() => setGameStarted(false)}
            >
              🏠 主菜单
            </button>
          </div>
        </aside>
      </section>

      {message && (
        <div className={`toast toast-${message.type}`}>
          {message.type === "collect" && "✨ "}
          {message.type === "error" && "⚠️ "}
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
            {detailItem.id === "powered_flashlight" && (
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
          </div>
        </div>
      )}

      {clueModalIndex !== null && (() => {
        const cell = CELL_LABELS[clueModalIndex];
        const content = getCellContent(clueModalIndex);
        const gotClue = content.itemId ? ITEMS[content.itemId] : null;

        return (
          <div className="modal-overlay clue-modal-overlay" onClick={() => setClueModalIndex(null)}>
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
                <button className="modal-close" onClick={() => setClueModalIndex(null)}>
                  ✕
                </button>
              </div>

              <div className="clue-detail-section">
                <h4 className="clue-section-title">📖 场景描述</h4>
                <p className="clue-detail-text">{content.clueDetail}</p>
              </div>

              <div className="clue-detail-section">
                <h4 className="clue-section-title">
                  {gotClue ? "🎁 获得线索" : content.isLocked ? "🔒 当前状态" : "🔍 线索状态"}
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
                        setDetailItem(gotClue);
                        setClueModalIndex(null);
                      }}
                    >
                      查看详情
                    </button>
                  </div>
                ) : content.isLocked ? (
                  <p className="clue-status-text hint-text">
                    {content.lockReason === "三位密码锁"
                      ? "这个抽屉被三位密码锁锁住了。需要输入正确的密码才能打开。"
                      : content.lockReason === "需要螺丝刀"
                        ? "需要螺丝刀才能操作这里。先去找到螺丝刀吧——抽屉里似乎有工具。"
                        : content.lockReason === "需要螺丝刀撬开"
                          ? "箱子封条太牢固了，需要螺丝刀才能撬开。"
                          : "这里暂时无法操作。"}
                    {content.lockReason === "三位密码锁" && (
                      <button
                        className="action-btn clue-close-btn"
                        style={{ marginTop: "12px" }}
                        onClick={() => {
                          setClueModalIndex(null);
                          setLockTarget("drawer");
                          setLockDigits([]);
                          setLockError(false);
                        }}
                      >
                        🔢 输入密码
                      </button>
                    )}
                  </p>
                ) : content.requires === "powered_flashlight" ? (
                  <p className="clue-status-text hint-text">
                    {hasPoweredFlashlight && !flashlightActive
                      ? "这里似乎藏着荧光墨水书写的暗号。打开手电筒照照看！"
                      : hasFlashlight && !hasPoweredFlashlight
                        ? "你有手电筒，但没有电池亮不起来。去抽屉里找找电池，然后组合使用！"
                        : "光线太暗看不清楚，需要找到能发光的工具。台灯旁边似乎有一个……"}
                  </p>
                ) : (
                  <p className="clue-status-text">
                    {cell.label === "地毯" && flashlightActive && hasPoweredFlashlight
                      ? "地毯的线索已经被你记录下来了。"
                      : cell.label === "窗帘" && curtainChecked
                        ? "窗帘上的刻字你已经记下了。"
                        : "这里没有发现可收集的物品。"}
                  </p>
                )}
              </div>

              <div className="clue-detail-section">
                <h4 className="clue-section-title">💡 下一步提示</h4>
                <p className="clue-hint-text">{content.nextHint}</p>
              </div>

              <button
                className="action-btn clue-close-btn"
                onClick={() => setClueModalIndex(null)}
              >
                知道了
              </button>
            </div>
          </div>
        );
      })()}

      {lockTarget && (() => {
        const isDrawer = lockTarget === "drawer";
        const isHidden = lockTarget === "hidden";
        const isDoor = lockTarget === "door";
        const maxLen = isDrawer || isHidden ? 3 : 4;
        const title = isDrawer ? "抽屉密码锁" : isHidden ? "隐藏密码锁" : "门锁密码";
        const subtitle = isDrawer
          ? "请输入3位数字密码"
          : isHidden
            ? "请输入3位隐藏密码"
            : "请输入4位数字密码";
        const icon = isDrawer ? "🗄️" : isHidden ? "🗝️" : "🔒";
        const canUsePassword =
          isDoor &&
          hasItem("note_carpet") &&
          drawerUnlocked &&
          boxOpened &&
          paintingRemoved;
        const canUseKeyInModal =
          isDoor &&
          drawerUnlocked &&
          boxOpened &&
          paintingRemoved &&
          hasCompleteKey &&
          hasItem("note_curtain");

        const missingDoorSteps: string[] = [];
        if (!drawerUnlocked) missingDoorSteps.push("打开抽屉");
        if (!paintingRemoved) missingDoorSteps.push("取下挂画");
        if (!boxOpened) missingDoorSteps.push("撬开箱子");

        return (
          <div className="modal-overlay" onClick={() => setLockTarget(null)}>
            <div
              className={`modal-card lock-modal-card ${lockError ? "lock-shake" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <span className="modal-icon">{icon}</span>
                <div>
                  <h3>{title}</h3>
                  <span className="clue-status-tag">{subtitle}</span>
                </div>
                <button className="modal-close" onClick={() => setLockTarget(null)}>
                  ✕
                </button>
              </div>

              {isDoor && (
                <div style={{ marginBottom: "12px" }}>
                  {missingDoorSteps.length > 0 && (
                    <p className="lock-error-text" style={{ margin: "0 0 8px", textAlign: "left" }}>
                      ⚠️ 必须先完成：{missingDoorSteps.join("、")}，完整探索后才能开启门锁！
                    </p>
                  )}
                  {!hasItem("note_carpet") && missingDoorSteps.length === 0 && (
                    <p className="lock-error-text" style={{ margin: "0 0 8px", textAlign: "left" }}>
                      ⚠️ 你还不知道密码。需要先从地毯荧光暗号中找到密码线索。
                    </p>
                  )}
                  {canUseKeyInModal && (
                    <button
                      className="action-btn modal-use-btn"
                      style={{ width: "100%" }}
                      onClick={handleUseKeyOnDoor}
                    >
                      🔑 使用完整钥匙开锁
                    </button>
                  )}
                  {hasAllHiddenClues && missingDoorSteps.length === 0 && (
                    <button
                      className="action-btn"
                      style={{ width: "100%", marginTop: "10px", background: "linear-gradient(135deg, #fbbf24, #f97316)", color: "#0f172a" }}
                      onClick={() => {
                        setLockTarget("hidden");
                        setLockDigits([]);
                        setLockError(false);
                      }}
                    >
                      ✨ 尝试隐藏密码（真结局）
                    </button>
                  )}
                  {!hasAllHiddenClues && missingDoorSteps.length === 0 && hasItem("note_carpet") && hiddenClueCount > 0 && (
                    <p className="lock-error-text" style={{ margin: "10px 0 0", textAlign: "left", color: "#fbbf24" }}>
                      💡 已发现 {hiddenClueCount}/3 个隐藏线索，集齐后可尝试隐藏密码解锁真结局！
                    </p>
                  )}
                </div>
              )}

              {isHidden && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ margin: "0 0 8px", textAlign: "left", color: "#fbbf24", fontSize: "14px", lineHeight: "1.7" }}>
                    📜 你已集齐三处隐藏暗码：
                    <br />窗帘「4」· 挂画「8」· 台灯「2」
                    <br />按此顺序输入三位数字，揭开真结局的秘密……
                  </p>
                </div>
              )}

              <div className="lock-digits">
                {Array.from({ length: maxLen }).map((_, i) => (
                  <span
                    key={i}
                    className={`lock-digit ${lockError ? "lock-digit-error" : ""} ${i === lockDigits.length ? "lock-digit-active" : ""}`}
                  >
                    {lockDigits[i] || ""}
                  </span>
                ))}
              </div>

              {lockError && (
                <p className="lock-error-text">
                  {isDrawer
                    ? "密码错误，请重新输入。提示：书架纸条——7-3-1倒序！"
                    : isHidden
                      ? "隐藏密码错误。窗帘「4」· 挂画「8」· 台灯「2」，按顺序输入！"
                      : canUsePassword
                        ? "密码错误，请重新输入。地毯荧光暗号是1-3-7-9！"
                        : "你还不知道密码，先去找到线索！"}
                </p>
              )}

              <div className="lock-numpad">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button
                    key={d}
                    className="lock-numpad-key"
                    onClick={() => handleLockDigit(d)}
                  >
                    {d}
                  </button>
                ))}
                <button
                  className="lock-numpad-key lock-numpad-delete"
                  onClick={handleLockDelete}
                >
                  ⌫
                </button>
                <button
                  className="lock-numpad-key"
                  onClick={() => handleLockDigit("0")}
                >
                  0
                </button>
                <button
                  className={`lock-numpad-key lock-numpad-submit ${lockDigits.length === maxLen ? "lock-numpad-submit-active" : ""}`}
                  disabled={lockDigits.length < maxLen}
                  onClick={handleLockSubmit}
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <section className="result-panel">
        <h2>探索进度</h2>
        <p>
          已收集 {inventory.length} 件道具，钥匙碎片 {fragmentCount}/3，线索纸条 {noteCount} 张。
          {!drawerUnlocked && !hasItem("note_bookshelf") &&
            " 🔍 先从书架开始调查吧，也许能找到抽屉的密码线索。"}
          {!drawerUnlocked && hasItem("note_bookshelf") &&
            " 🔢 书架纸条提示密码7-3-1倒序即1-3-7，去打开抽屉吧！"}
          {drawerUnlocked && !paintingRemoved && hasScrewdriver &&
            " \uD83D\uDD27 有螺丝刀了，去取下挂画看看背后有什么！"}
          {drawerUnlocked && !boxOpened && hasScrewdriver && paintingRemoved &&
            " \uD83D\uDD27 挂画已取下，再去撬开箱子看看！"}
          {drawerUnlocked && paintingRemoved && boxOpened && !hasFlashlight &&
            " 💡 挂画和箱子都探索完了，去台灯那里看看有什么工具！"}
          {drawerUnlocked && paintingRemoved && boxOpened && hasFlashlight && !hasBattery && !hasPoweredFlashlight &&
            " 🔦 找到手电筒了，但没有电池亮不起来。去抽屉里找找有没有电池？"}
          {hasFlashlight && hasBattery && !hasPoweredFlashlight &&
            " 🔋 手电筒和电池都有了！去物品栏组合一下，让手电筒亮起来！"}
          {hasPoweredFlashlight && !flashlightActive && !hasItem("note_carpet") &&
            " 🔦 打开手电筒，去地毯那里找找荧光暗号！"}
          {flashlightActive && hasPoweredFlashlight && !hasItem("note_carpet") &&
            " 🔦 手电筒已开，去地毯那里找找荧光暗号！"}
          {drawerUnlocked && paintingRemoved && boxOpened && !curtainChecked &&
            " 🪟 别忘了查看窗帘背后有没有刻字！"}
          {fragmentCount === 3 && !hasCompleteKey &&
            " 🗝️ 三枚碎片已齐，可以组合成完整钥匙了！"}
          {hasCompleteKey && !hasItem("note_curtain") &&
            " 🪟 钥匙已组合好，但还需要查看窗帘上的使用方法！"}
          {drawerUnlocked && paintingRemoved && boxOpened && hasCompleteKey && hasItem("note_curtain") && hasItem("note_carpet") && !hasAllHiddenClues &&
            ` ✅ 基础线索已集齐！可逃脱，或继续探索隐藏线索 (${hiddenClueCount}/3)。窗帘、挂画、台灯处似乎还有更深的秘密…`}
          {drawerUnlocked && paintingRemoved && boxOpened && hasCompleteKey && hasItem("note_curtain") && hasItem("note_carpet") && hasAllHiddenClues &&
            " 🌟 全部线索与隐藏暗码已集齐！去门锁处尝试隐藏密码 482 解锁真结局！"}
        </p>
        {lastHint && (
          <div className="last-hint">
            <span className="last-hint-label">💡 最近提示</span>
            <span className="last-hint-text">{lastHint}</span>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
