import type { GameConfig, ItemDef, CombineRecipe, Condition, HintPuzzleDef } from "./types";

export const ITEMS: Record<string, ItemDef> = {
  frag_a: {
    id: "frag_a",
    name: "钥匙碎片·甲",
    category: "key_fragment",
    icon: "🗝️",
    description: "一把锈迹斑斑的钥匙残片，边缘呈锯齿状。",
    detail:
      "这是钥匙的顶部，齿纹清晰可辨。上面刻着一个微小的符号「⊙」，似乎暗示着某种机关。碎片边缘的锯齿恰好能与另一片吻合——也许还有更多碎片散落在房间里。",
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
    icon: "🔧",
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
      "将三片碎片按「⊙」符号、「右转两次」刻字、「三合一」提示的顺序组合，形成一把完整的钥匙。钥匙柄上有三道刻痕，提示着使用方法：向左三圈，再向右一圈。",
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

export const COMBINE_RECIPES: CombineRecipe[] = [
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

const hasItem = (id: string): Condition => ({ type: "hasItem", itemId: id });
const notHasItem = (id: string): Condition => ({ type: "notHasItem", itemId: id });
const flagTrue = (id: string): Condition => ({ type: "flagTrue", flagId: id });
const flagFalse = (id: string): Condition => ({ type: "flagFalse", flagId: id });
const all = (...conds: Condition[]): Condition => ({ type: "all", conditions: conds });
const any = (...conds: Condition[]): Condition => ({ type: "any", conditions: conds });

export const HINT_PUZZLES: HintPuzzleDef[] = [
  {
    id: "bookshelf_clue",
    title: "书架的秘密",
    icon: "📚",
    hints: [
      "书架上的书脊编号有高有低，某几册的位置似乎经常被人翻动过——颜色比旁边的浅一些。",
      "书脊上印着从 1 到 9 的编号，但有三本的书脊颜色和其他不一样。记住它们的数字，再看看纸条背面写了什么。",
      "纸条说「倒序即真相」——把那三个特殊的数字反过来排，就是一个三位数的密码。哪个地方需要三位密码呢？去探索一下吧。",
    ],
    completedCondition: hasItem("note_bookshelf"),
    availableCondition: { type: "all", conditions: [] },
  },
  {
    id: "drawer_unlock",
    title: "抽屉密码锁",
    icon: "🗄️",
    hints: [
      "抽屉被牢牢锁住了，密码是三位数。房间里某个地方应该能找到和数字相关的线索。",
      "书架的纸条上有三个数字，旁边还写着「倒序即真相」。先找到纸条，再把数字倒过来试试。",
      "把纸条上的三个数从右往左重新排列，就是抽屉的密码。输入的时候按从左到右的顺序。",
    ],
    completedCondition: flagTrue("drawerUnlocked"),
    availableCondition: { type: "all", conditions: [] },
  },
  {
    id: "screwdriver_use",
    title: "螺丝刀的用处",
    icon: "🔧",
    hints: [
      "螺丝刀是很常用的工具。环顾房间，有什么东西是被螺丝或者封条固定住、徒手打不开的？",
      "墙上的画看起来钉得很牢，角落有螺丝的痕迹。还有一个铁皮箱贴着封条，封条的铆钉看起来也能撬开。",
      "挂画和铁皮箱都可以用螺丝刀打开。先试试哪一个都行——两个地方都藏着重要的东西。",
    ],
    completedCondition: all(flagTrue("paintingRemoved"), flagTrue("boxOpened")),
    availableCondition: hasItem("screwdriver"),
  },
  {
    id: "fragments_collect",
    title: "钥匙碎片收集",
    icon: "🗝️",
    hints: [
      "你已经找到一片钥匙碎片了，房间里应该还有两片。仔细回想一下——哪些地方你还没有彻底搜过？",
      "花瓶里、挂画后面、铁皮箱里——这三个地方似乎都和钥匙碎片有关。看看你已经去了哪里，还缺哪里。",
      "三片碎片分别藏在三个不同的容器里：一个是瓷器里、一个是挂画背后、一个是箱子暗格。对照一下你已有的，去找缺的那几片。",
    ],
    completedCondition: any(hasItem("complete_key"), {
      type: "flagTrue",
      flagId: "_fragment_count_3",
    } as Condition),
    availableCondition: { type: "flagTrue", flagId: "_has_any_fragment" } as Condition,
  },
  {
    id: "combine_items",
    title: "物品组合",
    icon: "🔧",
    hints: [
      "物品栏里有一个「组合道具」按钮——有些东西单独放着没用，拼在一起才能发挥作用。",
      "三枚钥匙碎片肯定是要组合的。还有手电筒——它现在亮不起来，是不是缺了什么能源？",
      "打开组合模式，试试把看起来相关的东西放在一起。钥匙碎片有三片，手电筒需要一节电池。",
    ],
    completedCondition: any(hasItem("complete_key"), hasItem("powered_flashlight")),
    availableCondition: { type: "flagTrue", flagId: "_inventory_size_ge_2" } as Condition,
  },
  {
    id: "flashlight_power",
    title: "点亮手电筒",
    icon: "🔦",
    hints: [
      "手电筒不亮——因为没有电。找找房间里有没有电池类的东西。",
      "抽屉里除了螺丝刀和纸条，还有一个小东西你是不是忘了拿？它可能正好能装手电筒里。",
      "找到电池后，用「组合道具」功能把手电筒和电池拼在一起。组合好的手电筒点击就能开关。",
    ],
    completedCondition: hasItem("powered_flashlight"),
    availableCondition: hasItem("flashlight"),
  },
  {
    id: "carpet_clue",
    title: "地毯荧光暗号",
    icon: "🧶",
    hints: [
      "地毯下面似乎藏着东西，但房间的光线太暗了，看不清楚。需要更强的光源来照明。",
      "你有没有试过用手电筒照地毯？听说有些墨水只有在强光下才会显现——比如荧光墨水。",
      "打开手电筒，然后仔细检查地毯的角落。你会发现一串数字，那是门锁的密码——位数比抽屉密码多一位。",
    ],
    completedCondition: hasItem("note_carpet"),
    availableCondition: all(flagTrue("drawerUnlocked"), hasItem("flashlight")),
  },
  {
    id: "curtain_instruction",
    title: "窗帘的刻字",
    icon: "🪟",
    hints: [
      "窗帘挡住了整扇窗户。拉开它，不仅能看看窗户的情况，也许窗帘背面还有什么意外发现。",
      "窗帘布很厚，背面似乎刻着什么东西——是有人用指甲划的，关于钥匙怎么用的提示。",
      "完整的钥匙不能直接插进锁里就拧，需要按照特定的方向和圈数来转。窗帘背面就写着这个方法。",
    ],
    completedCondition: hasItem("note_curtain"),
    availableCondition: flagTrue("drawerUnlocked"),
  },
  {
    id: "hidden_clues",
    title: "隐藏暗码（真结局）",
    icon: "🌟",
    hints: [
      "窗帘、挂画、台灯——你已经在这三个地方找到过东西了。但它们的秘密也许不止这些，再回头看看？",
      "这三处各自藏着一位数字，藏得非常隐蔽：窗帘的折缝最深处、画框的隐秘角落、台灯底座的下面。",
      "三位数字分别藏在窗帘、挂画、台灯处。按「窗帘→挂画→台灯」的顺序排起来就是隐藏密码。三位数字，你可以自己去发掘。",
    ],
    completedCondition: { type: "flagTrue", flagId: "_all_hidden_clues" } as Condition,
    availableCondition: any(
      hasItem("note_curtain"),
      flagTrue("paintingRemoved"),
      hasItem("flashlight"),
      hasItem("powered_flashlight")
    ),
  },
  {
    id: "door_escape",
    title: "开启门锁逃脱",
    icon: "🔒",
    hints: [
      "门锁有两种开启方式：用钥匙，或者输密码。你现在收集到的东西更倾向于哪一条路线？",
      "用钥匙的话，你需要先凑齐三片碎片组合成完整钥匙，还需要知道怎么转动它——窗帘上有说明。用密码的话，你需要从地毯的荧光暗号里找到那串数字。",
      "不管走哪条路线，基础探索都得做完：抽屉、挂画、箱子，这三个地方是关键。把这些都搞定后，再根据你收集到的东西选择用钥匙还是密码开门。",
    ],
    completedCondition: { type: "flagTrue", flagId: "_escaped" } as Condition,
    availableCondition: all(flagTrue("drawerUnlocked"), flagTrue("paintingRemoved"), flagTrue("boxOpened")),
  },
];

export const ESCAPE_ROOM_CONFIG: GameConfig = {
  id: "classic_room_01",
  title: "密室文字逃脱",
  subtitle: "点击场景收集线索，按顺序解开谜题，最终逃出密室",
  saveKey: "escape_room_save_v1",
  saveVersion: 1,
  categoryLabels: {
    key_fragment: "钥匙",
    note: "纸条",
    tool: "工具",
  },
  categoryColors: {
    key_fragment: "#f97316",
    note: "#a855f7",
    tool: "#22d3ee",
  },
  filterTabs: [
    { key: "all", label: "全部" },
    { key: "key_fragment", label: "钥匙" },
    { key: "note", label: "纸条" },
    { key: "tool", label: "工具" },
  ],
  intro: {
    title: "欢迎来到密室逃脱",
    description:
      "你醒来时发现自己被困在一间神秘的房间里。仔细观察四周，收集线索和道具，解开层层谜题，找到逃出密室的方法！",
  },
  progressSummary: [
    { key: "time", icon: "⏱️", label: "用时", countMode: "custom" },
    { key: "notes", icon: "📝", label: "线索", countMode: "inventoryCategory", category: "note" },
    { key: "items", icon: "🎒", label: "道具", countMode: "inventorySize" },
    { key: "combine", icon: "🔧", label: "组合", countMode: "combineCount" },
    { key: "hidden", icon: "🗝️", label: "隐藏", countMode: "flag", flagId: "_hidden_clue_count", total: 3 },
    { key: "hints", icon: "💡", label: "提示", countMode: "custom" },
  ],
  items: ITEMS,
  combineRecipes: COMBINE_RECIPES,
  endings: {
    normal_key: {
      id: "normal_key",
      title: "成功逃脱",
      icon: "🎉",
      tag: "🗝️ 钥匙逃脱路线",
      story: [
        "你集齐了三枚钥匙碎片，将它们按「⊙」符号、「右转两次」刻字、「三合一」提示的顺序小心翼翼地拼合在一起，形成了一把散发着冷光的完整钥匙。",
        "按照窗帘背面刻下的指示——「向左三圈，再向右一圈」——你深吸一口气，将钥匙插入门锁，伴随着清脆的\"咔哒\"声，沉重的铁门缓缓打开。",
        "你走出密室，重获自由。但在门关上的瞬间，你隐约觉得——这个房间里，似乎还有什么秘密没有被揭开……",
      ],
    },
    normal_password: {
      id: "normal_password",
      title: "成功逃脱",
      icon: "🎉",
      tag: "🔢 密码逃脱路线",
      story: [
        "你通过缜密的推理，依次解开了书架纸条暗示的抽屉密码「1-3-7」，用螺丝刀取下挂画、撬开铁皮箱，收集齐所有关键线索。",
        "最终，你用手电筒照亮地毯角落，发现了用荧光墨水写下的四位密码「1-3-7-9」。当最后一位数字输入完毕，门锁应声而开。",
        "你走出密室，呼吸着新鲜的空气。但回望那扇关闭的铁门时，一丝疑虑涌上心头——窗帘、挂画、台灯，那三个被你匆匆略过的角落，是否还藏着更深的秘密？",
      ],
    },
    true_ending: {
      id: "true_ending",
      title: "真结局 · 真相大白",
      icon: "🏆",
      tag: "✨ 你揭开了所有隐藏的秘密",
      isTrueEnding: true,
      story: [
        "当你输入隐藏密码「4-8-2」的那一刻，铁门深处传来一阵低沉的机械转动声。伴随着尘土簌簌落下，墙面缓缓移开，露出了一条从未被人发现的暗道。",
        "你穿过暗道，走进了一间被刻意隐藏的密室。墙上贴满了照片、剪报和手绘的地图——这一切都指向多年前那桩悬而未决的失踪案。",
        "书桌上摊着一本日记，最后一页写着：「如果你能读到这里，说明你比我更聪明。窗帘、挂画、台灯——这三个地方留下的线索，是我留给这个世界最后的真相。」",
        "你紧紧握住日记，走出了暗道。阳光洒在脸上，你知道——这不仅仅是一场逃脱，更是一段尘封真相的揭开。",
      ],
    },
  },
  hintPuzzles: HINT_PUZZLES,
  autoAdvanceCellIds: ["carpet", "door"],
  progressHints: [
    {
      priority: 1,
      condition: { type: "all", conditions: [
        { type: "flagFalse", flagId: "drawerUnlocked" },
        { type: "notHasItem", itemId: "note_bookshelf" }
      ]},
      text: "🔍 先从书架开始调查吧，也许能找到抽屉的密码线索。"
    },
    {
      priority: 2,
      condition: { type: "all", conditions: [
        { type: "flagFalse", flagId: "drawerUnlocked" },
        { type: "hasItem", itemId: "note_bookshelf" }
      ]},
      text: "🔢 书架纸条提示密码7-3-1倒序即1-3-7，去打开抽屉吧！"
    },
    {
      priority: 3,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "drawerUnlocked" },
        { type: "flagFalse", flagId: "paintingRemoved" },
        { type: "hasItem", itemId: "screwdriver" }
      ]},
      text: "🔧 有螺丝刀了，去取下挂画看看背后有什么！"
    },
    {
      priority: 4,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "drawerUnlocked" },
        { type: "flagFalse", flagId: "boxOpened" },
        { type: "hasItem", itemId: "screwdriver" },
        { type: "flagTrue", flagId: "paintingRemoved" }
      ]},
      text: "🔧 挂画已取下，再去撬开箱子看看！"
    },
    {
      priority: 5,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "drawerUnlocked" },
        { type: "flagTrue", flagId: "paintingRemoved" },
        { type: "flagTrue", flagId: "boxOpened" },
        { type: "notHasItem", itemId: "flashlight" }
      ]},
      text: "💡 挂画和箱子都探索完了，去台灯那里看看有什么工具！"
    },
    {
      priority: 6,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "drawerUnlocked" },
        { type: "flagTrue", flagId: "paintingRemoved" },
        { type: "flagTrue", flagId: "boxOpened" },
        { type: "hasItem", itemId: "flashlight" },
        { type: "notHasItem", itemId: "battery" },
        { type: "notHasItem", itemId: "powered_flashlight" }
      ]},
      text: "🔦 找到手电筒了，但没有电池亮不起来。去抽屉里找找有没有电池？"
    },
    {
      priority: 7,
      condition: { type: "all", conditions: [
        { type: "hasItem", itemId: "flashlight" },
        { type: "hasItem", itemId: "battery" },
        { type: "notHasItem", itemId: "powered_flashlight" }
      ]},
      text: "🔋 手电筒和电池都有了！去物品栏组合一下，让手电筒亮起来！"
    },
    {
      priority: 8,
      condition: { type: "all", conditions: [
        { type: "hasItem", itemId: "powered_flashlight" },
        { type: "flagFalse", flagId: "flashlightActive" },
        { type: "notHasItem", itemId: "note_carpet" }
      ]},
      text: "🔦 打开手电筒，去地毯那里找找荧光暗号！"
    },
    {
      priority: 9,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "flashlightActive" },
        { type: "hasItem", itemId: "powered_flashlight" },
        { type: "notHasItem", itemId: "note_carpet" }
      ]},
      text: "🔦 手电筒已开，去地毯那里找找荧光暗号！"
    },
    {
      priority: 10,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "drawerUnlocked" },
        { type: "flagTrue", flagId: "paintingRemoved" },
        { type: "flagTrue", flagId: "boxOpened" },
        { type: "flagFalse", flagId: "curtainChecked" }
      ]},
      text: "🪟 别忘了查看窗帘背后有没有刻字！"
    },
    {
      priority: 11,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "fragment1Found" },
        { type: "flagTrue", flagId: "fragment2Found" },
        { type: "flagTrue", flagId: "fragment3Found" },
        { type: "notHasItem", itemId: "complete_key" }
      ]},
      text: "🗝️ 三枚碎片已齐，可以组合成完整钥匙了！"
    },
    {
      priority: 12,
      condition: { type: "all", conditions: [
        { type: "hasItem", itemId: "complete_key" },
        { type: "notHasItem", itemId: "note_curtain" }
      ]},
      text: "🪟 钥匙已组合好，但还需要查看窗帘上的使用方法！"
    },
    {
      priority: 13,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "drawerUnlocked" },
        { type: "flagTrue", flagId: "paintingRemoved" },
        { type: "flagTrue", flagId: "boxOpened" },
        { type: "hasItem", itemId: "complete_key" },
        { type: "hasItem", itemId: "note_curtain" },
        { type: "hasItem", itemId: "note_carpet" },
        { type: "any", conditions: [
          { type: "notHasItem", itemId: "note_hidden_curtain" },
          { type: "notHasItem", itemId: "note_hidden_painting" },
          { type: "notHasItem", itemId: "note_hidden_lamp" }
        ]}
      ]},
      text: "✅ 基础线索已集齐！可逃脱，或继续探索隐藏线索。窗帘、挂画、台灯处似乎还有更深的秘密…"
    },
    {
      priority: 14,
      condition: { type: "all", conditions: [
        { type: "flagTrue", flagId: "drawerUnlocked" },
        { type: "flagTrue", flagId: "paintingRemoved" },
        { type: "flagTrue", flagId: "boxOpened" },
        { type: "hasItem", itemId: "complete_key" },
        { type: "hasItem", itemId: "note_curtain" },
        { type: "hasItem", itemId: "note_carpet" },
        { type: "hasItem", itemId: "note_hidden_curtain" },
        { type: "hasItem", itemId: "note_hidden_painting" },
        { type: "hasItem", itemId: "note_hidden_lamp" }
      ]},
      text: "🌟 全部线索与隐藏暗码已集齐！去门锁处尝试隐藏密码 482 解锁真结局！"
    }
  ],
  rooms: [
    {
      id: "room_01",
      name: "主密室",
      cells: [
        {
          id: "bookshelf",
          label: "书架",
          icon: "📚",
          initialStageId: "has_note",
          stages: {
            has_note: {
              id: "has_note",
              description: "一排落满灰尘的旧书，书脊上标注着奇怪的编号，似乎藏着什么秘密。",
              clueDetail:
                "书架上整齐排列着十几本老旧书籍，书脊上的编号从1到9依次排列，但第7、3、1册的书脊颜色略有不同，似乎经常被人抽出过。仔细检查书架夹层，你发现了一张藏在书后的泛黄纸条。",
              nextHint:
                "纸条上写着「书脊编号7-3-1，倒序即真相」，背面说这是抽屉的三位密码。倒序排列——1-3-7，这就是抽屉的密码！去试试抽屉吧。",
              onInteract: {
                giveItems: ["note_bookshelf"],
                showMessage: "📝 获得了一张泛黄的纸条！",
                messageType: "collect",
              },
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "一排落满灰尘的旧书，书脊上标注着奇怪的编号。",
              clueDetail:
                "书架上整齐排列着十几本老旧书籍，书脊上的编号从1到9依次排列。第7、3、1册位置明显被动过，不过夹层里的纸条已经被你取走了。",
              nextHint: "书架已经仔细检查过了，试试其他地方。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "vase",
          label: "花瓶",
          icon: "🏺",
          initialStageId: "has_frag",
          stages: {
            has_frag: {
              id: "has_frag",
              description: "一只青花瓷花瓶，瓶口似乎塞着什么东西。",
              clueDetail:
                "青花瓷瓶身上绘着缠枝莲纹，瓶底有「大明宣德年制」的落款。瓶口塞着一团皱巴巴的纸条？不对——伸手进去摸索，你触碰到一块冰凉的金属碎片。",
              nextHint:
                "获得了一枚钥匙碎片！碎片上刻着符号「⊙」。房间里应该还有其他碎片，继续寻找它们吧。也许书架上能找到更多线索？",
              onInteract: {
                giveItems: ["frag_a"],
                showMessage: "🗝️ 在花瓶里发现了一枚钥匙碎片！",
                messageType: "collect",
              },
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "一只青花瓷花瓶，瓶口空着。",
              clueDetail:
                "青花瓷瓶身上绘着缠枝莲纹，瓶底有「大明宣德年制」的落款。瓶口已经空了——你之前取出的那枚钥匙碎片就是从这里发现的。",
              nextHint: "花瓶里的东西已经被你取走了。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "drawer",
          label: "抽屉",
          icon: "🗄️",
          initialStageId: "locked",
          stages: {
            locked: {
              id: "locked",
              description: "一只上了锁的木抽屉，锁上是三位数字密码盘。",
              clueDetail:
                "木质抽屉已经有些老旧，导轨发出吱呀的响声。抽屉正面嵌着一个三位数字密码锁，锁旁有一些划痕，似乎有人曾尝试过暴力开锁。",
              nextHint:
                "抽屉被三位密码锁锁住了。也许房间里某个地方藏着密码的线索……去书架看看？",
              isLocked: true,
              lockReason: "三位密码锁",
              lockTargetId: "drawer",
            },
            empty: {
              id: "empty",
              description: "一个空木抽屉，里面散落着几张废纸。",
              clueDetail:
                "木质抽屉敞开着，里面除了几张没用的废纸，所有有价值的东西都被你取走了。底部的刻槽空空如也。",
              nextHint: "抽屉里的东西都被你取走了，继续探索其他地方吧。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "painting",
          label: "挂画",
          icon: "🖼️",
          initialStageId: "on_wall",
          stages: {
            on_wall: {
              id: "on_wall",
              description: "一幅暗色调油画，画框被螺丝牢牢固定在墙上。",
              clueDetail:
                "画作描绘的是一片阴沉的森林，色调压抑。画框的四角用螺丝钉牢牢固定在墙上，徒手根本取不下来。需要什么工具才能把它撬开呢？",
              nextHint:
                "挂画被螺丝钉固定住了，需要找到工具才能取下。也许抽屉里会有你需要的东西？",
              isLocked: true,
              lockReason: "需要螺丝刀",
              requires: hasItem("screwdriver"),
              requiresMet: {
                description: "一幅暗色调油画，画框用螺丝固定着，可以用螺丝刀取下。",
                clueDetail:
                  "画作描绘的是一片阴沉的森林，色调压抑。画框的四角用螺丝钉牢牢固定在墙上——不过你手里有螺丝刀，正合适！",
                nextHint: "用螺丝刀取下挂画，看看背后藏着什么！",
              },
              onUnlock: {
                setFlags: { paintingRemoved: true },
                showMessage: "🔧 用螺丝刀取下了挂画！",
                messageType: "collect",
              },
              moveToStage: "has_frag",
            },
            has_frag: {
              id: "has_frag",
              description: "墙上挂着的画被取下来了，挂钩上似乎挂着东西。",
              clueDetail:
                "挂画被取下后靠在墙边，墙上原本挂画的位置露出了斑驳的石灰墙面。画框背面的挂钩上，挂着一片金属碎片，在手电筒光下闪着冷光。",
              nextHint:
                "获得了第二枚钥匙碎片！内侧刻有「右转两次」的字样。继续寻找第三枚碎片——也许铁皮箱子里有线索？",
              onInteract: {
                giveItems: ["frag_b"],
                showMessage: "🗝️ 在挂画挂钩上发现了第二枚钥匙碎片！",
                messageType: "collect",
              },
              moveToStage: "has_hidden",
            },
            has_hidden: {
              id: "has_hidden",
              description: "靠在墙边的画框，背面似乎还有未被发现的细节。",
              clueDetail:
                "再次将画框翻到背面，在靠近挂钩的一个隐秘角落里——你之前没注意到的地方——发现了被人用小刀刻下的痕迹。凑近看，是一个数字「8」！",
              nextHint:
                "获得了隐藏线索！挂画暗码是「8」。窗帘、挂画、台灯——三处暗码集齐后可解出隐藏密码。",
              onInteract: {
                giveItems: ["note_hidden_painting"],
                showMessage: "🔍 你再次将画框翻到背面，仔细检查着每一个角落……",
                messageType: "info",
              },
              collectMessage: "📜 获得隐藏线索！挂画暗码是「8」！",
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "画框背面已被你彻底检查过了。",
              clueDetail:
                "画框被取下后靠在墙边。你已经取走了钥匙碎片，并在画框背面发现了隐藏的数字「8」。这里没有更多东西了。",
              nextHint: "挂画区域已彻底搜索完毕。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "carpet",
          label: "地毯",
          icon: "🧶",
          initialStageId: "need_flashlight",
          stages: {
            need_flashlight: {
              id: "need_flashlight",
              description: "厚实的波斯地毯，边角微微翘起，下面似乎压着东西。",
              clueDetail:
                "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。凑近仔细看，地毯角落隐约有一些痕迹，但光线太暗看不清楚。",
              nextHint:
                "地毯下似乎有痕迹但看不清楚。也许需要一盏能照亮暗处的工具——台灯旁边是不是有什么？",
              isLocked: true,
              lockReason: "需要能照亮暗处的工具",
              requires: hasItem("flashlight"),
              requiresMet: {
                description: "厚实的波斯地毯，边角微微翘起，下面似乎压着东西。",
                clueDetail:
                  "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。你有手电筒，但好像没装电池，亮不起来。",
                nextHint: "手电筒没有电池，亮不起来。需要找到电池后组合使用。去抽屉里找找电池吧！",
                lockReason: "手电筒缺少电池",
              },
              moveToStage: "need_battery",
            },
            need_battery: {
              id: "need_battery",
              description: "厚实的波斯地毯，边角微微翘起，下面似乎压着东西。",
              clueDetail:
                "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。你有手电筒，但好像没装电池，亮不起来。",
              nextHint: "手电筒没有电池，亮不起来。需要找到电池后组合使用。去抽屉里找找电池吧！",
              isLocked: true,
              lockReason: "手电筒缺少电池",
              requires: hasItem("powered_flashlight"),
              requiresMet: {
                description: "厚实的波斯地毯，边角微微翘起，下面似乎压着东西。",
                clueDetail:
                  "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。你有手电筒但好像没打开——先打开它再看看！",
                nextHint: "地毯下似乎藏着荧光墨水书写的暗号。先打开手电筒照照看！",
                lockReason: "需要打开手电筒",
              },
              moveToStage: "need_turn_on",
            },
            need_turn_on: {
              id: "need_turn_on",
              description: "厚实的波斯地毯，边角微微翘起，下面似乎压着东西。",
              clueDetail:
                "波斯地毯图案繁复，织工精细。地毯边角微微翘起，下面似乎压着什么东西。你有手电筒但好像没打开——先打开它再看看！",
              nextHint: "地毯下似乎藏着荧光墨水书写的暗号。先打开手电筒照照看！",
              isLocked: true,
              lockReason: "需要打开手电筒",
              requires: flagTrue("flashlightActive"),
              requiresMet: {
                description: "厚实的波斯地毯，角落有荧光字迹在手电筒光下若隐若现。",
                clueDetail:
                  "波斯地毯图案繁复，织工精细。在手电筒的强光照射下，地毯角落的荧光墨水逐渐显现——那是一串数字和一些说明文字！",
                nextHint:
                  "荧光暗号显示密码是1-3-7-9！这就是门锁的四位密码！如果你集齐了钥匙碎片和窗帘上的使用说明，也可以选择用钥匙开锁。",
              },
              moveToStage: "lit",
            },
            lit: {
              id: "lit",
              description: "厚实的波斯地毯，角落有荧光字迹在手电筒光下若隐若现。",
              clueDetail:
                "波斯地毯图案繁复，织工精细。在手电筒的强光照射下，地毯角落的荧光墨水逐渐显现——那是一串数字和一些说明文字！",
              nextHint:
                "荧光暗号显示密码是1-3-7-9！这就是门锁的四位密码！如果你集齐了钥匙碎片和窗帘上的使用说明，也可以选择用钥匙开锁。",
              onInteract: {
                giveItems: ["note_carpet"],
                showMessage: "📝 在手电筒光下发现了荧光暗号！",
                messageType: "collect",
              },
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "厚实的波斯地毯，边角微微翘起。",
              clueDetail:
                "波斯地毯图案繁复，织工精细。地毯边角微微翘起——不过荧光暗号已经被你记录下来了，这里没有更多东西了。",
              nextHint: "地毯的线索已经收集完毕。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "lamp",
          label: "台灯",
          icon: "💡",
          initialStageId: "has_flashlight",
          stages: {
            has_flashlight: {
              id: "has_flashlight",
              description: "一盏复古台灯，灯罩下藏着小巧的手电筒。",
              clueDetail:
                "复古台灯造型优雅，灯罩是磨砂玻璃的。灯座旁放着一盏小巧的LED手电筒，看起来电量还很充足。",
              nextHint:
                "获得了手电筒！打开它可以照亮房间里的暗处——地毯下方似乎有什么东西需要光照才能看清。",
              onInteract: {
                giveItems: ["flashlight"],
                showMessage: "🔦 获得了手电筒！",
                messageType: "collect",
              },
              moveToStage: "has_hidden",
            },
            has_hidden: {
              id: "has_hidden",
              description: "一盏复古台灯静静地立在那里，灯座下方似乎有些异样。",
              clueDetail:
                "再次仔细观察台灯，你注意到底座似乎微微翘起。小心地将台灯抬起——底座下方贴着一张几乎看不见的微型标签，上面用极小的字体印着一个数字「2」！",
              nextHint:
                "获得了隐藏线索！台灯暗码是「2」。窗帘「4」、挂画「8」、台灯「2」——按此顺序排列，隐藏密码就是 4-8-2！",
              onInteract: {
                giveItems: ["note_hidden_lamp"],
                showMessage: "🔍 你小心地抬起台灯，仔细检查着底座下方……",
                messageType: "info",
              },
              collectMessage: "📜 获得隐藏线索！台灯暗码是「2」！",
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "复古台灯静静地立在那里，已被你彻底检查过。",
              clueDetail:
                "复古台灯造型优雅，灯罩是磨砂玻璃的。你已经拿走了灯座旁的手电筒，并在底座下方发现了隐藏的数字「2」。这里没有更多东西了。",
              nextHint: "台灯区域已彻底搜索完毕。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "door",
          label: "门锁",
          icon: "🔒",
          initialStageId: "need_drawer",
          stages: {
            need_drawer: {
              id: "need_drawer",
              description: "一扇铁门上的密码锁，需要完成全部探索才能开启。",
              clueDetail:
                "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。锁下方刻着一行小字：「须尽搜此间所有机关，方可开启此门。",
              nextHint: "密室的秘密藏在各处——先去打开抽屉看看，那里应该能找到你需要的工具和线索。",
              isLocked: true,
              lockReason: "未完成探索：打开抽屉",
              requires: flagTrue("drawerUnlocked"),
              requiresMet: {
                description: "一扇铁门上的密码锁，需要完成全部探索才能开启。",
                clueDetail:
                  "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。锁下方刻着一行小字：「须尽搜此间所有机关，方可开启此门。",
                nextHint: "抽屉已打开！接下来去取下挂画——墙上的挂画，看看背后藏着什么！",
                lockReason: "未完成探索：取下挂画",
              },
              moveToStage: "need_painting",
            },
            need_painting: {
              id: "need_painting",
              description: "一扇铁门上的密码锁，需要完成全部探索才能开启。",
              clueDetail:
                "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。锁下方刻着一行小字：「须尽搜此间所有机关，方可开启此门。",
              nextHint: "挂画被螺丝牢牢固定在墙上，需要螺丝刀才能取下——你应该能找到螺丝刀！",
              isLocked: true,
              lockReason: "未完成探索：取下挂画",
              requires: flagTrue("paintingRemoved"),
              requiresMet: {
                description: "一扇铁门上的密码锁，需要完成全部探索才能开启。",
                clueDetail:
                  "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。锁下方刻着一行小字：「须尽搜此间所有机关，方可开启此门。",
                nextHint: "挂画已取下！接下来去撬开箱子——铁皮箱子里藏着重要的东西！",
                lockReason: "未完成探索：撬开箱子",
              },
              moveToStage: "need_box",
            },
            need_box: {
              id: "need_box",
              description: "一扇铁门上的密码锁，需要完成全部探索才能开启。",
              clueDetail:
                "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。锁下方刻着一行小字：「须尽搜此间所有机关，方可开启此门。",
              nextHint: "箱子被封条封死了，需要螺丝刀才能撬开——你找到螺丝刀了吗？",
              isLocked: true,
              lockReason: "未完成探索：撬开箱子",
              requires: flagTrue("boxOpened"),
              requiresMet: {
                description: "一扇铁门上的密码锁，需要完成全部探索才能开启。",
                lockReason: "未完成探索：收集开锁线索",
                clueDetail:
                  "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。锁下方刻着一行小字：「须尽搜此间所有机关，方可开启此门。",
                nextHint:
                  "所有主要探索都完成了！现在需要：要么找到地毯上的四位密码暗号，要么集齐钥匙碎片组合完整钥匙并查看窗帘上的使用说明！",
              },
              moveToStage: "need_clue",
            },
            need_clue: {
              id: "need_clue",
              description: "一扇铁门上的密码锁，就差最后的开锁线索了！",
              clueDetail:
                "厚重的铁门牢牢锁住了出口。门上有一个四位数字密码锁，锁旁还有一个钥匙孔。主要机关均已开启！现在只差最后的线索了！",
              nextHint:
                "两条路任选其一：①找到地毯上的暗号（需要能发光的手电筒)，或②集齐3片钥匙碎片组合成完整钥匙并查看窗帘上的使用说明！",
              isLocked: true,
              lockReason: "还差开锁线索",
              requires: any(
                hasItem("note_carpet"),
                all(hasItem("note_curtain"), hasItem("complete_key"))
              ),
              requiresMet: {
                description: "一扇铁门上的密码锁——所有条件全部就绪，可以开锁了！",
                clueDetail:
                  "厚重的铁门就在眼前——所有条件都已满足！是时候逃出去了！",
                nextHint:
                  "一切就绪！点击门锁选择你的方式开锁——可以用密码开锁或用钥匙开锁！",
                lockReason: "一切就绪，可以开启！",
              },
              moveToStage: "ready",
            },
            ready: {
              id: "ready",
              description: "一扇铁门——所有条件全部就绪，可以开锁了！",
              clueDetail:
                "厚重的铁门就在眼前，所有条件都已满足！是时候逃出去了！点击门锁选择开锁方式！",
              nextHint: "一切就绪！可以输入密码或使用钥匙！",
              isLocked: true,
              lockTargetId: "door",
            },
          },
        },
        {
          id: "box",
          label: "箱子",
          icon: "📦",
          initialStageId: "sealed",
          stages: {
            sealed: {
              id: "sealed",
              description: "一只贴着封条的铁皮箱，封条用铆钉固定，徒手无法打开。",
              clueDetail:
                "铁皮箱上贴着破旧的封条，写着「证物」二字。封条用铆钉固定得很紧，徒手根本撕不开。需要什么工具才能撬开呢？",
              nextHint:
                "箱子被牢牢封住了，需要工具才能打开。抽屉里似乎能找到你需要的东西……",
              isLocked: true,
              lockReason: "需要螺丝刀撬开",
              requires: hasItem("screwdriver"),
              requiresMet: {
                description: "一只贴着破旧封条的铁皮箱，用螺丝刀可以撬开。",
                clueDetail:
                  "铁皮箱上贴着破旧的封条，写着「证物」二字。封条用铆钉固定得很紧——不过你的螺丝刀正好能派上用场！",
                nextHint: "用螺丝刀撬开箱子的封条，看看里面藏着什么！",
              },
              onUnlock: {
                setFlags: { boxOpened: true },
                showMessage: "🔧 用螺丝刀撬开了箱子封条！",
                messageType: "collect",
              },
              moveToStage: "opened",
            },
            opened: {
              id: "opened",
              description: "一只撬开的铁皮箱，底部的暗格隐约可见金属光泽。",
              clueDetail:
                "铁皮箱的封条已被撕毁，箱盖敞开着。箱子里没有别的东西，但底部有一个暗格！打开暗格，里面躺着一枚钥匙的尾部碎片。",
              nextHint:
                "获得了第三枚钥匙碎片！握柄背面刻着「三合一，门自开」。现在三枚碎片都齐了，可以去物品栏组合成完整钥匙了！",
              onInteract: {
                giveItems: ["frag_c"],
                showMessage: "🗝️ 在箱子暗格里发现了第三枚钥匙碎片！",
                messageType: "collect",
              },
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "一只撬开的铁皮箱，空了。",
              clueDetail:
                "铁皮箱的封条已被撕毁，箱盖敞开着。底部暗格也被打开了，里面空空如也——那枚钥匙碎片已经被你取走。",
              nextHint: "箱子已经彻底搜过了。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "curtain",
          label: "窗帘",
          icon: "🪟",
          initialStageId: "closed",
          stages: {
            closed: {
              id: "closed",
              description: "厚重的深色窗帘，遮住了整个窗户。",
              clueDetail:
                "厚重的深色窗帘完全遮住了窗户，光线很难透进来。需要拉开窗帘仔细检查一下。",
              nextHint:
                "拉开窗帘后，发现窗帘背面有刻字——记下来，这对用钥匙开锁很重要！",
              onInteract: {
                setFlags: { curtainChecked: true },
              },
              moveToStage: "has_note",
            },
            has_note: {
              id: "has_note",
              description: "厚重的深色窗帘，半拉开着遮住窗户。",
              clueDetail:
                "厚重的深色窗帘完全遮住了窗户，光线很难透进来。拉开窗帘，窗玻璃被封死了——但窗帘背面！有人用指甲在窗帘布上刻下了字迹。",
              nextHint:
                "窗帘背面刻着「向左三圈，再向右一圈」，这是使用完整钥匙开锁的转动方法！如果你已经集齐了三片钥匙碎片，就可以组合成完整钥匙了。",
              onInteract: {
                giveItems: ["note_curtain"],
                showMessage: "📝 在窗帘背面发现了刻字！",
                messageType: "collect",
              },
              moveToStage: "has_hidden",
            },
            has_hidden: {
              id: "has_hidden",
              description: "厚重的深色窗帘半拉开着，最深处的折缝中似乎藏着什么。",
              clueDetail:
                "将窗帘完全展开，在最深处的一道折缝中——你之前没有注意到的地方——发现了有人用针尖刻下的痕迹。凑近仔细辨认，是一个数字「4」！",
              nextHint:
                "获得了隐藏线索！窗帘暗码是「4」。继续寻找挂画和台灯的隐藏暗码，三处集齐后可解出隐藏密码。",
              onInteract: {
                giveItems: ["note_hidden_curtain"],
                showMessage: "🔍 你将窗帘完全展开，仔细检查着每一道折缝……",
                messageType: "info",
              },
              collectMessage: "📜 获得隐藏线索！窗帘暗码是「4」！",
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "厚重的深色窗帘半拉开着，已被你彻底检查过。",
              clueDetail:
                "厚重的深色窗帘被半拉开着，露出了被封死的窗户。你已经记录下了窗帘背面的开锁方法，并在最深处的折缝中发现了隐藏的数字「4」。这里没有更多东西了。",
              nextHint: "窗帘区域已彻底搜索完毕。",
              alreadyChecked: true,
            },
          },
        },
      ],
      locks: [
        {
          id: "drawer",
          label: "抽屉密码锁",
          icon: "🗄️",
          password: "137",
          digits: 3,
          errorHint: "密码错误，请重新输入。提示：书架纸条——7-3-1倒序！",
          onSuccess: {
            giveItems: ["screwdriver", "battery", "note_drawer"],
            setFlags: { drawerUnlocked: true },
            setCellStage: { cellId: "drawer", stageId: "empty" },
            successMessage: "🗄️ 抽屉打开了！获得了螺丝刀、纸条和电池！",
          },
        },
        {
          id: "door",
          label: "门锁密码",
          icon: "🔒",
          password: "1379",
          digits: 4,
          beforeSubmit: all(
            flagTrue("drawerUnlocked"),
            flagTrue("boxOpened"),
            flagTrue("paintingRemoved"),
            hasItem("note_carpet")
          ),
          errorHint: "密码错误，请重新输入。地毯荧光暗号是1-3-7-9！",
          onSuccess: {
            triggerEnding: "normal_password",
            successMessage: "🔓 密码正确！门锁应声而开！",
          },
          modalHints: [
            {
              condition: { type: "any", conditions: [
                { type: "flagFalse", flagId: "drawerUnlocked" },
                { type: "flagFalse", flagId: "paintingRemoved" },
                { type: "flagFalse", flagId: "boxOpened" }
              ]},
              text: "必须先完成：打开抽屉、取下挂画、撬开箱子，完整探索后才能开启门锁！",
              type: "warning"
            },
            {
              condition: { type: "all", conditions: [
                { type: "flagTrue", flagId: "drawerUnlocked" },
                { type: "flagTrue", flagId: "paintingRemoved" },
                { type: "flagTrue", flagId: "boxOpened" },
                { type: "notHasItem", itemId: "note_carpet" }
              ]},
              text: "你还不知道密码。需要先从地毯荧光暗号中找到密码线索。",
              type: "warning"
            },
            {
              condition: { type: "all", conditions: [
                { type: "flagTrue", flagId: "drawerUnlocked" },
                { type: "flagTrue", flagId: "paintingRemoved" },
                { type: "flagTrue", flagId: "boxOpened" },
                { type: "hasItem", itemId: "note_carpet" },
                { type: "any", conditions: [
                  { type: "hasItem", itemId: "note_hidden_curtain" },
                  { type: "hasItem", itemId: "note_hidden_painting" },
                  { type: "hasItem", itemId: "note_hidden_lamp" }
                ]},
                { type: "any", conditions: [
                  { type: "notHasItem", itemId: "note_hidden_curtain" },
                  { type: "notHasItem", itemId: "note_hidden_painting" },
                  { type: "notHasItem", itemId: "note_hidden_lamp" }
                ]}
              ]},
              text: "已发现 1/3 至 2/3 个隐藏线索，集齐后可尝试隐藏密码解锁真结局！",
              type: "partial"
            }
          ],
          keyUnlock: {
            steps: [
              { condition: flagTrue("drawerUnlocked"), reason: "需要先打开抽屉", sidebarLabel: "先打开抽屉" },
              { condition: flagTrue("boxOpened"), reason: "需要先撬开箱子", sidebarLabel: "先撬开箱子" },
              { condition: flagTrue("paintingRemoved"), reason: "需要先取下挂画", sidebarLabel: "先取下挂画" },
              { condition: hasItem("complete_key"), reason: "需要先集齐3片碎片并组合成完整钥匙", sidebarLabel: "需要完整钥匙" },
              { condition: flagTrue("curtainChecked"), reason: "需要先查看窗帘", sidebarLabel: "先查看窗帘" },
              { condition: hasItem("note_curtain"), reason: "需要获得钥匙使用说明纸条", sidebarLabel: "需要钥匙说明" }
            ],
            buttonText: "🔑 使用完整钥匙开锁",
            keyItemId: "complete_key",
            requiredNoteId: "note_curtain",
            defaultButtonText: "🔑 用钥匙开锁",
            unlockEffects: {
              triggerEnding: "normal_key",
              showMessage: "🔑 你按照窗帘背面刻下的指示——「向左三圈，再向右一圈」——小心翼翼地转动钥匙……",
              messageType: "collect"
            }
          },
          hiddenPassword: {
            lockId: "hidden",
            digits: 3,
            password: "482",
            showCondition: all(
              flagTrue("drawerUnlocked"),
              flagTrue("boxOpened"),
              flagTrue("paintingRemoved"),
              hasItem("note_hidden_curtain"),
              hasItem("note_hidden_painting"),
              hasItem("note_hidden_lamp")
            ),
            buttonText: "✨ 尝试隐藏密码（真结局）",
            hiddenClueItemIds: [
              "note_hidden_curtain",
              "note_hidden_painting",
              "note_hidden_lamp"
            ],
            partialHintCondition: all(
              flagTrue("drawerUnlocked"),
              flagTrue("boxOpened"),
              flagTrue("paintingRemoved"),
              hasItem("note_carpet"),
              any(
                hasItem("note_hidden_curtain"),
                hasItem("note_hidden_painting"),
                hasItem("note_hidden_lamp")
              ),
              any(
                notHasItem("note_hidden_curtain"),
                notHasItem("note_hidden_painting"),
                notHasItem("note_hidden_lamp")
              )
            ),
            partialHintText: "💡 已发现 {found}/{total} 个隐藏线索，集齐后可尝试隐藏密码解锁真结局！",
            onSuccess: {
              triggerEnding: "true_ending",
              successMessage: "🌟 隐藏密码正确！墙面缓缓移开，一条暗道出现在你眼前……",
            }
          }
        },
        {
          id: "hidden",
          label: "隐藏密码锁",
          icon: "🗝️",
          password: "482",
          digits: 3,
          errorHint: "隐藏密码错误。窗帘「4」· 挂画「8」· 台灯「2」，按顺序输入！",
          onSuccess: {
            triggerEnding: "true_ending",
            successMessage: "🌟 隐藏密码正确！墙面缓缓移开，一条暗道出现在你眼前……",
          },
          descriptionLines: [
            "📜 你已集齐三处隐藏暗码：",
            "窗帘「4」· 挂画「8」· 台灯「2」",
            "按此顺序输入三位数字，揭开真结局的秘密……"
          ],
        },
      ],
    },
  ],
};
