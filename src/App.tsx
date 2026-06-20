import { useState, useCallback } from "react";
import "./styles.css";

type ItemCategory = "key_fragment" | "note" | "tool";

interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string;
  description: string;
  detail: string;
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

type LockTarget = "drawer" | "box" | "door" | null;

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
    name: "手电筒",
    category: "tool",
    icon: "🔦",
    description: "一盏小巧的LED手电筒，电量充足。",
    detail:
      "手电筒开关灵敏，光束聚焦良好。照亮暗处时似乎能看到平时肉眼难以察觉的痕迹——也许房间某些角落还藏着用荧光墨水书写的暗号。\n\n提示：打开手电筒后，检查地毯下方。",
  },
  screwdriver: {
    id: "screwdriver",
    name: "螺丝刀",
    category: "tool",
    icon: "🪛",
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
      "将三片碎片按「☉」符号、「右转两次」刻字、「三合一」提示的顺序组合，形成一把完整的钥匙。钥匙柄上有三道刻痕，提示着使用方法：向左三圈，再向右一圈。",
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

  const [lockTarget, setLockTarget] = useState<LockTarget>(null);
  const [lockDigits, setLockDigits] = useState<string[]>([]);
  const [lockError, setLockError] = useState(false);

  const [drawerUnlocked, setDrawerUnlocked] = useState(false);
  const [boxOpened, setBoxOpened] = useState(false);
  const [paintingRemoved, setPaintingRemoved] = useState(false);
  const [curtainChecked, setCurtainChecked] = useState(false);

  const showMsg = useCallback(
    (text: string, type: "info" | "collect" | "empty" | "error") => {
      setMessage({ text, type });
      if (messageTimer) clearTimeout(messageTimer);
      const timer = setTimeout(() => setMessage(null), 2500);
      setMessageTimer(timer);
    },
    [messageTimer]
  );

  const hasItem = (id: string) => inventory.includes(id);
  const hasFlashlight = hasItem("flashlight");
  const hasScrewdriver = hasItem("screwdriver");
  const hasCompleteKey = hasItem("complete_key");
  const fragmentCount = inventory.filter(
    (id) => ITEMS[id]?.category === "key_fragment" && id !== "complete_key"
  ).length;
  const noteCount = inventory.filter((id) => ITEMS[id]?.category === "note").length;

  const collectItem = useCallback(
    (itemId: string) => {
      if (!hasItem(itemId)) {
        setInventory((prev) => [...prev, itemId]);
        setJustCollected(itemId);
        setTimeout(() => setJustCollected(null), 600);
      }
    },
    [inventory]
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
              : "获得了一枚钥匙碎片！碎片上刻着符号「☉」。房间里应该还有其他碎片，继续寻找它们吧。也许书架上能找到更多线索？",
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
            const allGot = gotScrewdriver && gotNote;
            return {
              description: allGot
                ? "一个空木抽屉，里面散落着几张废纸。"
                : "一只打开的木抽屉，里面似乎还有东西。",
              clueDetail: allGot
                ? "木质抽屉敞开着，里面除了几张没用的废纸，所有有价值的东西都被你取走了。底部的刻槽空空如也。"
                : "木质抽屉敞开着，抽屉里散落着几张没用的废纸，底部有一些铅笔涂鸦。抽屉底部内侧有一道细微的刻槽，旁边还放着一把螺丝刀！",
              nextHint: allGot
                ? "抽屉里的东西都被你取走了，继续探索其他地方吧。"
                : gotNote
                ? "抽屉里还有一把螺丝刀！拿上它，也许能撬开挂画和箱子。"
                : gotScrewdriver
                ? "抽屉底部的刻槽里还有一张薄纸片，写着挂画和箱子都需要螺丝刀才能打开。"
                : "你在抽屉里发现了一把螺丝刀和一张纸条！纸条提示：挂画背后和铁皮箱都需要螺丝刀才能打开。",
              itemId: gotNote ? (gotScrewdriver ? undefined : "screwdriver") : "screwdriver",
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
            const got = hasItem("frag_b");
            return {
              description: got
                ? "墙上挂着的画被取下来了，露出了斑驳的墙面。"
                : "墙上挂着的画被取下来了，挂钩上似乎挂着东西。",
              clueDetail: got
                ? "挂画被取下后靠在墙边，墙上原本挂画的位置露出了斑驳的石灰墙面。挂钩已经空了——你取走的那枚钥匙碎片原来就挂在这里。"
                : "挂画被取下后靠在墙边，墙上原本挂画的位置露出了斑驳的石灰墙面。画框背面的挂钩上，挂着一片金属碎片，在手电筒光下闪着冷光。",
              nextHint: got
                ? "挂画区域已经搜索完毕。"
                : "获得了第二枚钥匙碎片！内侧刻有「右转两次」的字样。继续寻找第三枚碎片——也许铁皮箱子里有线索？",
              itemId: got ? undefined : "frag_b",
              alreadyChecked: got,
            };
          }
        }

        case "地毯": {
          const got = hasItem("note_carpet");
          const canSee = flashlightActive;
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
              : "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。凑近仔细看，地毯角落隐约有一些痕迹，但光线太暗看不清楚。",
            nextHint: got
              ? "地毯的线索已经收集完毕。"
              : canSee
              ? "荧光暗号显示密码是1-3-7-9！这就是门锁的四位密码！如果你集齐了钥匙碎片和窗帘上的使用说明，也可以选择用钥匙开锁。"
              : hasFlashlight
              ? "地毯下似乎藏着秘密，但光线太暗看不清楚。打开手电筒照照看！"
              : "地毯下似乎有痕迹但看不清楚。也许需要一盏能照亮暗处的工具——台灯旁边是不是有什么？",
            itemId: got ? undefined : canSee ? "note_carpet" : undefined,
            requires: canSee ? undefined : "flashlight",
            alreadyChecked: got,
          };
        }

        case "台灯": {
          const got = hasItem("flashlight");
          return {
            description: got
              ? "一盏复古台灯，静静地立在那里。"
              : "一盏复古台灯，灯罩下藏着小巧的手电筒。",
            clueDetail: got
              ? "复古台灯造型优雅，灯罩是磨砂玻璃的。灯座旁原本放着的手电筒已经被你拿走了。"
              : "复古台灯造型优雅，灯罩是磨砂玻璃的。灯座旁放着一盏小巧的LED手电筒，看起来电量还很充足。",
            nextHint: got
              ? "台灯旁边的东西已经被你取走了。"
              : "获得了手电筒！打开它可以照亮房间里的暗处——地毯下方似乎有什么东西需要光照才能看清。",
            itemId: got ? undefined : "flashlight",
            alreadyChecked: got,
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
          const canUseKey = hasCompleteKey && curtainChecked;
          const canUsePassword = hasItem("note_carpet");
          return {
            description: "一扇铁门上的密码锁，需要输入4位数字或使用完整钥匙。",
            clueDetail:
              "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。密码锁旁还有操作说明：「可凭四位密码开启，或凭完整钥匙按特定方向转动开启。」",
            nextHint: canUseKey
              ? "你已经集齐了完整钥匙，也看过窗帘上刻的使用方法（向左三圈，再向右一圈）！可以用钥匙开锁了。"
              : canUsePassword
              ? "你已经从地毯的荧光暗号中得知了四位密码1-3-7-9，可以输入密码开门了！"
              : hasCompleteKey
              ? "三片碎片已拼成完整钥匙，但你还不知道转动方法——窗帘背面似乎刻着相关提示，去看看吧。"
              : fragmentCount === 3
              ? "三枚钥匙碎片已齐，但需要先把它们组合成完整钥匙。另外你还需要找到使用钥匙的方法和/或门锁密码。"
              : `当前钥匙碎片仅有${fragmentCount}/3，还需要找到密码线索或集齐钥匙。继续探索吧。`,
            isLocked: true,
            lockReason: "需要密码或钥匙",
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
          const got = hasItem("note_curtain");
          return {
            description: got
              ? "厚重的深色窗帘，半拉开着遮住窗户。"
              : "厚重的深色窗帘，遮住了整个窗户。",
            clueDetail: got
              ? "厚重的深色窗帘被半拉开着，露出了被封死的窗户。窗帘背面刻的字迹你已经记录下来了。"
              : curtainChecked
              ? "厚重的深色窗帘完全遮住了窗户，光线很难透进来。拉开窗帘，窗玻璃被封死了——但窗帘背面！有人用指甲在窗帘布上刻下了字迹。"
              : "厚重的深色窗帘完全遮住了窗户，光线很难透进来。需要拉开窗帘仔细检查一下。",
            nextHint: got
              ? "窗帘上的线索已经记录下来了。"
              : curtainChecked
              ? "窗帘背面刻着「向左三圈，再向右一圈」，这是使用完整钥匙开锁的转动方法！如果你已经集齐了三片钥匙碎片，就可以组合成完整钥匙了。"
              : "拉开窗帘后，发现窗帘背面有刻字——记下来，这对用钥匙开锁很重要！",
            itemId: got ? undefined : curtainChecked ? "note_curtain" : undefined,
            alreadyChecked: got,
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
        } else if (cell.label === "地毯" && content.requires === "flashlight") {
          if (hasFlashlight && !flashlightActive) {
            showMsg("光线太暗，先打开手电筒看看。", "info");
          } else {
            showMsg("太暗了看不清，需要找到手电筒。", "info");
          }
        }
        setClueModalIndex(index);
        return;
      }

      if (cell.label === "挂画" && !paintingRemoved && hasScrewdriver) {
        setPaintingRemoved(true);
        showMsg("🪛 用螺丝刀取下了挂画！", "collect");
      }

      if (cell.label === "箱子" && !boxOpened && hasScrewdriver) {
        setBoxOpened(true);
        showMsg("🪛 用螺丝刀撬开了箱子封条！", "collect");
      }

      if (cell.label === "窗帘" && !curtainChecked) {
        setCurtainChecked(true);
      }

      if (cell.label === "抽屉" && drawerUnlocked) {
        if (!hasItem("screwdriver")) {
          collectItem("screwdriver");
        }
        if (!hasItem("note_drawer")) {
          collectItem("note_drawer");
        }
      }

      if (content.itemId) {
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
    if (fragmentCount < 3) return;
    if (hasCompleteKey) return;
    const newInventory = inventory.filter(
      (id) => !(ITEMS[id]?.category === "key_fragment" && id !== "complete_key")
    );
    newInventory.push("complete_key");
    setInventory(newInventory);
    setJustCollected("complete_key");
    setTimeout(() => setJustCollected(null), 600);
    showMsg("🔑 三片碎片成功组合成完整钥匙！", "collect");
  }, [fragmentCount, hasCompleteKey, inventory, showMsg]);

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
        showMsg("🗄️ 抽屉打开了！获得了螺丝刀和纸条！", "collect");
      } else {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
      }
    } else if (lockTarget === "door") {
      const canUsePassword = hasItem("note_carpet");
      if (!canUsePassword) {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
        showMsg("你还不知道密码是什么，先去找到密码线索！", "error");
        return;
      }
      if (entered === DOOR_PASSWORD) {
        setEscapeMethod("password");
        setEscaped(true);
        setLockTarget(null);
      } else {
        setLockError(true);
        setTimeout(() => setLockError(false), 600);
      }
    }
  }, [lockDigits, lockTarget, collectItem, showMsg]);

  const handleUseKeyOnDoor = useCallback(() => {
    if (!hasCompleteKey) {
      showMsg("需要先组合成完整钥匙。", "error");
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
    setEscaped(true);
    setLockTarget(null);
  }, [hasCompleteKey, curtainChecked, showMsg]);

  const filteredInventory =
    filterTab === "all" ? inventory : inventory.filter((id) => ITEMS[id]?.category === filterTab);

  if (escaped) {
    return (
      <main className="game-shell">
        <section className="hero">
          <p>密室文字逃脱 · H5Game</p>
          <h1>密室文字逃脱</h1>
          <span>点击场景收集线索，按顺序解开谜题，最终逃出密室</span>
        </section>
        <section className="victory-panel">
          <div className="victory-icon">🎉</div>
          <h2>成功逃脱！</h2>
          <p>
            {escapeMethod === "key"
              ? "你集齐了三枚钥匙碎片，组合成完整钥匙，并按照窗帘上「向左三圈，再向右一圈」的提示成功打开门锁，逃出了密室！"
              : "你通过缜密的推理，依次解开抽屉密码、用螺丝刀探索挂画和箱子，最终用手电筒发现地毯下的荧光密码「1-3-7-9」，成功打开了门锁！"}
          </p>
          <p className="victory-stats">
            收集道具 {inventory.length} 件 · 线索纸条 {noteCount} 张 · 钥匙碎片 3/3
          </p>
          <button className="action-btn victory-restart" onClick={() => window.location.reload()}>
            🔄 再来一次
          </button>
        </section>
      </main>
    );
  }

  const getCellStatus = (index: number) => {
    const content = getCellContent(index);
    return {
      isLocked: content.isLocked,
      alreadyChecked: content.alreadyChecked,
      isLit: flashlightActive && CELL_LABELS[index].label === "地毯" && !hasItem("note_carpet"),
    };
  };

  return (
    <main className="game-shell">
      <section className="hero">
        <p>密室文字逃脱 · H5Game</p>
        <h1>密室文字逃脱</h1>
        <span>按顺序解开谜题：书架 → 抽屉 → 挂画/箱子 → 窗帘/地毯 → 门锁</span>
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
          <strong>
            {flashlightActive
              ? "🔦 照明中"
              : hasCompleteKey && curtainChecked
                ? "🔑 可用钥匙"
                : hasItem("note_carpet")
                  ? "🔢 已知密码"
                  : "探索中"}
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
              🔧 {(hasFlashlight ? 1 : 0) + (hasScrewdriver ? 1 : 0)}
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
              disabled={fragmentCount < 3 || hasCompleteKey}
              onClick={fragmentCount >= 3 && !hasCompleteKey ? handleCombineKey : undefined}
            >
              {hasCompleteKey
                ? "🔑 已有完整钥匙"
                : fragmentCount < 3
                  ? `组合钥匙（${fragmentCount}/3）`
                  : "🔓 组合钥匙碎片"}
            </button>
            <button
              className="action-btn"
              disabled={!hasCompleteKey || !curtainChecked}
              onClick={hasCompleteKey && curtainChecked ? handleUseKeyOnDoor : undefined}
              title={
                !hasCompleteKey
                  ? "需要先集齐3片碎片并组合成完整钥匙"
                  : !curtainChecked
                    ? "需要先查看窗帘上的使用说明"
                    : ""
              }
            >
              {!hasCompleteKey
                ? "需要完整钥匙"
                : !curtainChecked
                  ? "先查看窗帘刻字"
                  : !hasItem("note_curtain")
                    ? "需要钥匙使用说明"
                    : "🔑 用钥匙开锁"}
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
                ) : content.requires === "flashlight" && !flashlightActive ? (
                  <p className="clue-status-text hint-text">
                    {hasFlashlight
                      ? "这里似乎藏着荧光墨水书写的暗号。打开手电筒照照看！"
                      : "光线太暗看不清楚，需要找到手电筒。台灯旁边似乎有一个……"}
                  </p>
                ) : (
                  <p className="clue-status-text">
                    {cell.label === "地毯" && flashlightActive
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
        const maxLen = isDrawer ? 3 : 4;
        const title = isDrawer ? "抽屉密码锁" : "门锁密码";
        const subtitle = isDrawer ? "请输入3位数字密码" : "请输入4位数字密码";
        const icon = isDrawer ? "🗄️" : "🔒";
        const canUsePassword = !isDrawer && hasItem("note_carpet");

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

              {!isDrawer && (
                <div style={{ marginBottom: "12px" }}>
                  {!canUsePassword && (
                    <p className="lock-error-text" style={{ margin: "0 0 8px", textAlign: "left" }}>
                      ⚠️ 你还不知道密码。需要先从地毯荧光暗号中找到密码线索。
                    </p>
                  )}
                  {hasCompleteKey && curtainChecked && (
                    <button
                      className="action-btn modal-use-btn"
                      style={{ width: "100%" }}
                      onClick={handleUseKeyOnDoor}
                    >
                      🔑 使用完整钥匙开锁
                    </button>
                  )}
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
            " 🪛 有螺丝刀了，去取下挂画看看背后有什么！"}
          {drawerUnlocked && !boxOpened && hasScrewdriver &&
            " 🪛 有螺丝刀了，去撬开箱子看看！"}
          {flashlightActive && !hasItem("note_carpet") &&
            " 🔦 手电筒已开，去地毯那里找找荧光暗号！"}
          {!flashlightActive && hasFlashlight && !hasItem("note_carpet") &&
            " 💡 记得打开手电筒检查地毯！"}
          {fragmentCount === 3 && !hasCompleteKey &&
            " 🗝️ 三枚碎片已齐，可以组合成完整钥匙了！"}
          {hasCompleteKey && !curtainChecked &&
            " 🪟 钥匙已组合好，但还需要查看窗帘上的使用方法！"}
          {hasCompleteKey && curtainChecked && hasItem("note_curtain") &&
            " 🔑 一切就绪，可以用钥匙开锁或者输入密码1379！"}
          {!drawerUnlocked &&
            " 继续探索房间，收集更多线索与道具。"}
        </p>
      </section>
    </main>
  );
}

export default App;
