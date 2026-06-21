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
  note_shelf: {
    id: "note_shelf",
    name: "纸条·储物架密码",
    category: "note",
    icon: "📝",
    description: "储物架上夹着的破旧纸条，字迹潦草。",
    detail:
      "纸条上歪歪扭扭地写着：\n\n「档案柜密码：5 - 2 - 7」\n\n背面还有一行被水渍模糊的小字：「第三个数字……看不清了……应该是7吧？」\n\n这是储物间档案柜的三位密码！",
  },
  wire_cutters: {
    id: "wire_cutters",
    name: "钢丝钳",
    category: "tool",
    icon: "✂️",
    description: "一把坚固的钢丝钳，刃口锋利。",
    detail:
      "钢丝钳手感沉甸甸的，刃口闪着寒光，足以剪断粗铁丝。储物间的通风口似乎被铁丝网封住了——也许用得上这个。",
  },
  circuit_board: {
    id: "circuit_board",
    name: "电路板",
    category: "tool",
    icon: "💠",
    description: "一块精密的电子电路板，似乎是大门的控制组件。",
    detail:
      "电路板上密布着芯片和线路，边缘有标准的插槽接口。背面贴着标签：「最终大门·主控电路」。看来需要将这块电路板插入最终大门的控制面板。",
  },
  note_workbench: {
    id: "note_workbench",
    name: "纸条·工作台记录",
    category: "note",
    icon: "📝",
    description: "工作台上散落的便签纸，记录着某些实验数据。",
    detail:
      "便签纸上用蓝色圆珠笔写着：\n\n「电路板已从工作台拆下，可用于修复最终大门的控制面板。」\n\n「通风口铁丝网需要钢丝钳才能剪开，里面藏着重要的东西。」\n\n「润滑油可以用于……算了，先不管这个。」",
  },
  oil_can: {
    id: "oil_can",
    name: "润滑油",
    category: "tool",
    icon: "🛢️",
    description: "一小罐工业润滑油，瓶身标注「高渗透配方」。",
    detail:
      "润滑油罐身印着产品型号，密封完好。也许某些生锈或卡住的机械装置需要用到它？",
  },
  note_cabinet: {
    id: "note_cabinet",
    name: "纸条·档案柜档案",
    category: "note",
    icon: "📝",
    description: "从档案柜中取出的机密文件，记录着最终大门的密码。",
    detail:
      "文件上方盖着「机密」印章，内容如下：\n\n「最终大门紧急密码：8 - 5 - 2 - 3」\n\n「此密码仅在电路板正常工作时方可使用。如电路板损坏，需更换后方可输入。」\n\n「另外，若持有组合钥匙与窗帘上的使用说明，也可选择用钥匙开锁。」",
  },
  key_core: {
    id: "key_core",
    name: "钥匙核心",
    category: "key_fragment",
    icon: "💎",
    description: "一块晶莹的金属核心，似乎是某种高级钥匙的内部组件。",
    detail:
      "钥匙核心通体散发着淡蓝色的光泽，表面刻着精密的齿纹和定位槽。它的大小恰好能嵌入完整钥匙的握柄——也许可以组合成更强大的钥匙？",
  },
  note_dark: {
    id: "note_dark",
    name: "纸条·暗角留言",
    category: "note",
    icon: "📝",
    description: "在暗角中发现的旧信封，里面有一封信。",
    detail:
      "信封已经泛黄，但信纸保存完好。上面写着：\n\n「如果你能看到这封信，说明你已经走到了这一步。」\n\n「最终大门不仅需要电路板和密码，如果你拥有更强大的钥匙，也可以用它开启另一条路。」\n\n「通风口里的东西，是钥匙的关键组成部分。」",
  },
  note_hidden_shelf: {
    id: "note_hidden_shelf",
    name: "暗码·储物架",
    category: "note",
    icon: "📜",
    description: "储物架深处贴着的微型数字暗号。",
    detail:
      "在储物架的最里层，有一张几乎与木板融为一体的标签。凑近辨认，上面用极小的字体印着一个数字：\n\n「5」\n\n这是隐藏密码的第四位数字！窗帘「4」、挂画「8」、台灯「2」、储物架「5」——还有一处暗码未找到……",
  },
  note_hidden_workbench: {
    id: "note_hidden_workbench",
    name: "暗码·工作台",
    category: "note",
    icon: "📜",
    description: "工作台底部刻下的数字暗号。",
    detail:
      "趴下身子查看工作台底部，在一块松动的木板后面，发现了被人用烙铁刻下的数字：\n\n「6」\n\n这是隐藏密码的第五位数字！窗帘「4」、挂画「8」、台灯「2」、储物架「5」、工作台「6」——五处暗码集齐，按此顺序排列就是隐藏密码：4-8-2-5-6！",
  },
  assembled_key: {
    id: "assembled_key",
    name: "组合钥匙",
    category: "key_fragment",
    icon: "🏆",
    description: "完整钥匙与钥匙核心组合而成的超级钥匙，散发着耀眼的光芒。",
    detail:
      "将完整钥匙的握柄与钥匙核心精密嵌合，形成一把散发着淡蓝色光芒的组合钥匙。核心的能量渗透入钥匙的每一道齿纹，使其不仅能开启普通门锁，还能打开最终大门的特殊锁孔。",
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
  {
    id: "assembled_key",
    inputs: ["complete_key", "key_core"],
    output: "assembled_key",
    consumesInputs: true,
    successMessage: "🏆 完整钥匙与钥匙核心成功组合成组合钥匙！",
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
      "窗帘、挂画、台灯——你已经在这三个地方找到过东西了。但它们的秘密也许不止这些，再回头看看？储物间里似乎也有类似的暗码……",
      "这五处各自藏着一位数字，藏得非常隐蔽：窗帘的折缝最深处、画框的隐秘角落、台灯底座的下面，还有储物间的储物架和工作台。",
      "五处暗码分别藏在窗帘、挂画、台灯、储物架、工作台。按「窗帘→挂画→台灯→储物架→工作台」的顺序排起来就是隐藏密码。五位数字，你可以自己去发掘。",
    ],
    completedCondition: { type: "flagTrue", flagId: "_all_hidden_clues" } as Condition,
    availableCondition: any(
      hasItem("note_curtain"),
      flagTrue("paintingRemoved"),
      hasItem("flashlight"),
      hasItem("powered_flashlight"),
      flagTrue("secretDoorOpened")
    ),
  },
  {
    id: "secret_door_open",
    title: "暗门开启",
    icon: "🚪",
    hints: [
      "这面墙后面似乎有一扇暗门，但需要完成书房的全部探索才能开启。",
      "抽屉、挂画、铁皮箱——这三个地方的机关都与暗门有关。把它们全部解开，暗门自然会打开。",
      "打开抽屉、取下挂画、撬开铁皮箱——完成这三件事后，暗门就会自动开启。",
    ],
    completedCondition: flagTrue("secretDoorOpened"),
    availableCondition: any(
      flagTrue("drawerUnlocked"),
      flagTrue("paintingRemoved"),
      flagTrue("boxOpened")
    ),
  },
  {
    id: "storage_workbench",
    title: "工作台探索",
    icon: "🛠️",
    hints: [
      "储物间的工作台似乎被螺丝锁住了，需要工具才能打开。",
      "你在书房里是不是找到过一把螺丝刀？储物间的工作台正好需要它！",
      "用螺丝刀打开工作台，里面应该有有用的工具和零件。",
    ],
    completedCondition: flagTrue("workbenchOpened"),
    availableCondition: flagTrue("secretDoorOpened"),
  },
  {
    id: "filing_cabinet_code",
    title: "档案柜密码",
    icon: "📁",
    hints: [
      "档案柜被三位密码锁锁住了，储物间的某个地方应该有密码线索。",
      "储物架上有一张破旧的纸条，上面似乎写着什么数字……",
      "储物架上的纸条明确写着档案柜密码是5-2-7，直接输入即可。",
    ],
    completedCondition: flagTrue("cabinetOpened"),
    availableCondition: flagTrue("secretDoorOpened"),
  },
  {
    id: "vent_open",
    title: "通风口开启",
    icon: "🔲",
    hints: [
      "通风口被铁丝网封住了，徒手打不开。需要什么工具才能剪开？",
      "工作台里可能藏着能剪铁丝的工具。先想办法打开工作台吧。",
      "用钢丝钳剪开通风口的铁丝网，里面藏着重要的东西——和钥匙有关的组件。",
    ],
    completedCondition: flagTrue("ventOpened"),
    availableCondition: hasItem("wire_cutters"),
  },
  {
    id: "dark_corner_explore",
    title: "暗角探索",
    icon: "🌑",
    hints: [
      "储物间的暗角漆黑一片，什么也看不见。需要光源才能探索那里。",
      "你在书房找到的手电筒可以照亮暗角——记得打开它。",
      "打开手电筒后去暗角，那里有一封信，里面写着关于最终大门的重要提示。",
    ],
    completedCondition: hasItem("note_dark"),
    availableCondition: all(flagTrue("secretDoorOpened"), hasItem("powered_flashlight")),
  },
  {
    id: "final_door_escape",
    title: "最终大门逃脱",
    icon: "🚪",
    hints: [
      "最终大门需要电路板才能激活控制面板，还需要密码或更强大的钥匙才能开启。",
      "先从工作台取下电路板插入大门，然后从档案柜的机密文件里找到四位密码。或者，如果你有组合钥匙和窗帘上的使用说明，也可以用钥匙开锁。",
      "两条路线任选其一：①插入电路板后输入四位密码（档案柜文件中有记录）；②组合完整钥匙与钥匙核心成组合钥匙，配合窗帘使用说明开锁。",
    ],
    completedCondition: { type: "flagTrue", flagId: "_escaped" } as Condition,
    availableCondition: all(
      flagTrue("secretDoorOpened"),
      hasItem("circuit_board")
    ),
  },
  {
    id: "key_assembly",
    title: "组合钥匙",
    icon: "🏆",
    hints: [
      "完整钥匙似乎还有提升的空间——也许可以和其他组件组合？",
      "通风口里藏着一块「钥匙核心」，它恰好能嵌入完整钥匙的握柄。",
      "用组合道具把完整钥匙和钥匙核心拼在一起，就能得到能开启最终大门的组合钥匙！",
    ],
    completedCondition: hasItem("assembled_key"),
    availableCondition: any(hasItem("complete_key"), hasItem("key_core")),
  },
];

export const ESCAPE_ROOM_CONFIG: GameConfig = {
  id: "dual_room_escape_01",
  title: "密室文字逃脱",
  subtitle: "书房→暗门→储物间→最终大门，两个房间共享物品栏和进度",
  saveKey: "escape_room_save_v2",
  saveVersion: 2,
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
      "你醒来时发现自己被困在一间神秘的书房里。仔细观察四周，收集线索和道具，解开层层谜题，找到暗门通往储物间，最终逃出密室！",
  },
  progressSummary: [
    { key: "time", icon: "⏱️", label: "用时", countMode: "custom" },
    { key: "notes", icon: "📝", label: "线索", countMode: "inventoryCategory", category: "note" },
    { key: "items", icon: "🎒", label: "道具", countMode: "inventorySize" },
    { key: "combine", icon: "🔧", label: "组合", countMode: "combineCount" },
    { key: "hidden", icon: "🗝️", label: "隐藏", countMode: "flag", flagId: "_hidden_clue_count", total: 5 },
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
        "你将组合钥匙插入最终大门的锁孔，按照窗帘背面刻下的指示——「向左三圈，再向右一圈」——小心翼翼地转动钥匙。",
        "随着最后一圈转动，钥匙核心爆发出一阵耀眼的光芒，大门深处的机械结构应声解锁。沉重的铁门缓缓向两侧分开，一股新鲜的空气扑面而来。",
        "你跨出大门，重获自由。阳光洒在脸上，但回望那扇关闭的铁门，你隐约觉得——这个密室里，似乎还有更深的秘密没有被揭开……",
      ],
    },
    normal_password: {
      id: "normal_password",
      title: "成功逃脱",
      icon: "🎉",
      tag: "🔢 密码逃脱路线",
      story: [
        "你将电路板插入控制面板，面板上的指示灯依次亮起。根据档案柜中机密文件的记录，你依次输入了四位密码「8-5-2-3」。",
        "随着最后一位数字确认，控制面板发出一声清脆的提示音，大门的电子锁应声解锁。沉重的铁门缓缓向两侧分开，走廊尽头透来微弱的光线。",
        "你跨出大门，呼吸着新鲜的空气。但回望那扇关闭的铁门时，一丝疑虑涌上心头——窗帘、挂画、台灯、储物架、工作台，那些被你匆匆略过的角落，是否还藏着更深的秘密？",
      ],
    },
    true_ending: {
      id: "true_ending",
      title: "真结局 · 真相大白",
      icon: "🏆",
      tag: "✨ 你揭开了所有隐藏的秘密",
      isTrueEnding: true,
      story: [
        "当你输入五位隐藏密码「4-8-2-5-6」的那一刻，最终大门深处传来一阵低沉的机械转动声。不仅门锁应声而开，大门右侧的墙壁也缓缓移开，露出了一条从未被人发现的暗道。",
        "你穿过暗道，走进了一间被刻意隐藏的密室。墙上贴满了照片、剪报和手绘的地图——这一切都指向多年前那桩悬而未决的失踪案。",
        "书桌上摊着一本日记，最后一页写着：「如果你能读到这里，说明你比我更聪明。窗帘、挂画、台灯、储物架、工作台——这五个地方留下的线索，是我留给这个世界最后的真相。」",
        "你紧紧握住日记，走出了暗道。阳光洒在脸上，你知道——这不仅仅是一场逃脱，更是一段尘封真相的揭开。",
      ],
    },
  },
  hintPuzzles: HINT_PUZZLES,
  autoAdvanceCellIds: ["carpet", "secret_door", "final_door", "dark_corner"],
  clueBook: [
    {
      id: "group_study",
      name: "书房",
      icon: "📚",
      entries: [
        {
          id: "clue_bookshelf_note",
          title: "书脊密码",
          icon: "📝",
          description: "从书架夹层中掉落的泛黄纸条",
          sourceItemId: "note_bookshelf",
          revealCondition: hasItem("note_bookshelf"),
        },
        {
          id: "clue_drawer_note",
          title: "抽屉暗语",
          icon: "📝",
          description: "抽屉底部刻槽中取出的薄纸片",
          sourceItemId: "note_drawer",
          revealCondition: hasItem("note_drawer"),
        },
        {
          id: "clue_curtain_note",
          title: "窗帘刻字",
          icon: "📝",
          description: "窗帘背后被人用指甲刻下的留言",
          sourceItemId: "note_curtain",
          revealCondition: hasItem("note_curtain"),
        },
        {
          id: "clue_carpet_note",
          title: "地毯暗号",
          icon: "📝",
          description: "用手电筒照亮的荧光墨水暗号",
          sourceItemId: "note_carpet",
          revealCondition: hasItem("note_carpet"),
        },
        {
          id: "clue_drawer_lock",
          title: "抽屉密码锁",
          icon: "🗄️",
          description: "三位数字密码锁，用于打开书房抽屉",
          sourceLockId: "drawer",
          revealCondition: flagTrue("drawerUnlocked"),
        },
        {
          id: "clue_hidden_curtain",
          title: "暗码·窗帘",
          icon: "📜",
          description: "窗帘最深折痕处隐约刻下的数字暗号",
          sourceItemId: "note_hidden_curtain",
          revealCondition: hasItem("note_hidden_curtain"),
        },
        {
          id: "clue_hidden_painting",
          title: "暗码·挂画",
          icon: "📜",
          description: "画框内侧隐秘角落刻下的数字暗号",
          sourceItemId: "note_hidden_painting",
          revealCondition: hasItem("note_hidden_painting"),
        },
        {
          id: "clue_hidden_lamp",
          title: "暗码·台灯",
          icon: "📜",
          description: "台灯底座下方贴着的微型数字暗号",
          sourceItemId: "note_hidden_lamp",
          revealCondition: hasItem("note_hidden_lamp"),
        },
      ],
    },
    {
      id: "group_storage",
      name: "储物间",
      icon: "📦",
      entries: [
        {
          id: "clue_shelf_note",
          title: "储物架密码",
          icon: "📝",
          description: "储物架上夹着的破旧纸条，字迹潦草",
          sourceItemId: "note_shelf",
          revealCondition: hasItem("note_shelf"),
        },
        {
          id: "clue_workbench_note",
          title: "工作台记录",
          icon: "📝",
          description: "工作台上散落的便签纸，记录着某些实验数据",
          sourceItemId: "note_workbench",
          revealCondition: hasItem("note_workbench"),
        },
        {
          id: "clue_cabinet_note",
          title: "档案柜档案",
          icon: "📝",
          description: "从档案柜中取出的机密文件",
          sourceItemId: "note_cabinet",
          revealCondition: hasItem("note_cabinet"),
        },
        {
          id: "clue_dark_note",
          title: "暗角留言",
          icon: "📝",
          description: "在暗角中发现的旧信封，里面有一封信",
          sourceItemId: "note_dark",
          revealCondition: hasItem("note_dark"),
        },
        {
          id: "clue_cabinet_lock",
          title: "档案柜密码锁",
          icon: "📁",
          description: "三位数字密码锁，用于打开储物间档案柜",
          sourceLockId: "filing_cabinet",
          revealCondition: flagTrue("cabinetOpened"),
        },
        {
          id: "clue_hidden_shelf",
          title: "暗码·储物架",
          icon: "📜",
          description: "储物架深处贴着的微型数字暗号",
          sourceItemId: "note_hidden_shelf",
          revealCondition: hasItem("note_hidden_shelf"),
        },
        {
          id: "clue_hidden_workbench",
          title: "暗码·工作台",
          icon: "📜",
          description: "工作台底部刻下的数字暗号",
          sourceItemId: "note_hidden_workbench",
          revealCondition: hasItem("note_hidden_workbench"),
        },
      ],
    },
    {
      id: "group_final_door",
      name: "最终大门",
      icon: "🚪",
      entries: [
        {
          id: "clue_final_password",
          title: "大门四位密码",
          icon: "🔢",
          description: "档案柜机密文件中记录的最终大门密码",
          sourceItemId: "note_cabinet",
          revealCondition: hasItem("note_cabinet"),
        },
        {
          id: "clue_key_method",
          title: "钥匙使用方法",
          icon: "🗝️",
          description: "窗帘背面刻下的组合钥匙开锁方法",
          sourceItemId: "note_curtain",
          revealCondition: hasItem("note_curtain"),
        },
        {
          id: "clue_final_lock",
          title: "最终大门密码锁",
          icon: "🚪",
          description: "四位数字密码锁，用于开启最终大门",
          sourceLockId: "final_door",
          revealCondition: any(hasItem("note_cabinet"), hasItem("assembled_key")),
        },
        {
          id: "clue_hidden_password",
          title: "隐藏密码（真结局）",
          icon: "🌟",
          description: "集齐五处隐藏暗码后可解出的五位隐藏密码",
          sourceLockId: "final_hidden",
          revealCondition: all(
            hasItem("note_hidden_curtain"),
            hasItem("note_hidden_painting"),
            hasItem("note_hidden_lamp"),
            hasItem("note_hidden_shelf"),
            hasItem("note_hidden_workbench")
          ),
        },
      ],
    },
  ],
  progressHints: [
    {
      priority: 1,
      condition: all(flagFalse("drawerUnlocked"), notHasItem("note_bookshelf")),
      text: "🔍 先从书架开始调查吧，也许能找到抽屉的密码线索。",
    },
    {
      priority: 2,
      condition: all(flagFalse("drawerUnlocked"), hasItem("note_bookshelf")),
      text: "🔢 书架纸条提示密码7-3-1倒序即1-3-7，去打开抽屉吧！",
    },
    {
      priority: 3,
      condition: all(flagTrue("drawerUnlocked"), flagFalse("paintingRemoved"), hasItem("screwdriver")),
      text: "🔧 有螺丝刀了，去取下挂画看看背后有什么！",
    },
    {
      priority: 4,
      condition: all(flagTrue("drawerUnlocked"), flagFalse("boxOpened"), hasItem("screwdriver"), flagTrue("paintingRemoved")),
      text: "🔧 挂画已取下，再去撬开箱子看看！",
    },
    {
      priority: 5,
      condition: all(flagTrue("drawerUnlocked"), flagTrue("paintingRemoved"), flagTrue("boxOpened"), notHasItem("flashlight")),
      text: "💡 挂画和箱子都探索完了，去台灯那里看看有什么工具！",
    },
    {
      priority: 6,
      condition: all(flagTrue("drawerUnlocked"), flagTrue("paintingRemoved"), flagTrue("boxOpened"), hasItem("flashlight"), notHasItem("battery"), notHasItem("powered_flashlight")),
      text: "🔦 找到手电筒了，但没有电池亮不起来。去抽屉里找找有没有电池？",
    },
    {
      priority: 7,
      condition: all(hasItem("flashlight"), hasItem("battery"), notHasItem("powered_flashlight")),
      text: "🔋 手电筒和电池都有了！去物品栏组合一下，让手电筒亮起来！",
    },
    {
      priority: 8,
      condition: all(hasItem("powered_flashlight"), flagFalse("flashlightActive"), notHasItem("note_carpet")),
      text: "🔦 打开手电筒，去地毯那里找找荧光暗号！",
    },
    {
      priority: 9,
      condition: all(flagTrue("flashlightActive"), hasItem("powered_flashlight"), notHasItem("note_carpet")),
      text: "🔦 手电筒已开，去地毯那里找找荧光暗号！",
    },
    {
      priority: 10,
      condition: all(flagTrue("drawerUnlocked"), flagTrue("paintingRemoved"), flagTrue("boxOpened"), flagFalse("curtainChecked")),
      text: "🪟 别忘了查看窗帘背后有没有刻字！",
    },
    {
      priority: 11,
      condition: all(flagTrue("fragment1Found"), flagTrue("fragment2Found"), flagTrue("fragment3Found"), notHasItem("complete_key")),
      text: "🗝️ 三枚碎片已齐，可以组合成完整钥匙了！",
    },
    {
      priority: 12,
      condition: all(hasItem("complete_key"), notHasItem("note_curtain")),
      text: "🪟 钥匙已组合好，但还需要查看窗帘上的使用方法！",
    },
    {
      priority: 13,
      condition: all(flagTrue("drawerUnlocked"), flagTrue("paintingRemoved"), flagTrue("boxOpened"), flagFalse("secretDoorOpened")),
      text: "🚪 书房三个机关都解开了！暗门应该已经可以开启了，去检查暗门吧！",
    },
    {
      priority: 14,
      condition: all(flagTrue("secretDoorOpened"), flagFalse("workbenchOpened"), hasItem("screwdriver")),
      text: "🔧 进入储物间了！用螺丝刀打开工作台，里面应该有有用的工具！",
    },
    {
      priority: 15,
      condition: all(flagTrue("secretDoorOpened"), flagFalse("workbenchOpened"), notHasItem("screwdriver")),
      text: "🛠️ 工作台需要螺丝刀才能打开——回书房的抽屉里找找？",
    },
    {
      priority: 16,
      condition: all(flagTrue("secretDoorOpened"), hasItem("note_shelf"), flagFalse("cabinetOpened")),
      text: "📁 储物架纸条上有档案柜密码5-2-7，去打开档案柜吧！",
    },
    {
      priority: 17,
      condition: all(flagTrue("secretDoorOpened"), notHasItem("note_shelf"), flagFalse("cabinetOpened")),
      text: "📦 先检查储物架，也许有档案柜的密码线索！",
    },
    {
      priority: 18,
      condition: all(hasItem("wire_cutters"), flagFalse("ventOpened")),
      text: "✂️ 有钢丝钳了，去剪开通风口的铁丝网吧！",
    },
    {
      priority: 19,
      condition: all(flagTrue("secretDoorOpened"), hasItem("powered_flashlight"), notHasItem("note_dark"), flagFalse("flashlightActive")),
      text: "🌑 打开手电筒，去暗角那里照亮看看！",
    },
    {
      priority: 20,
      condition: all(hasItem("circuit_board"), flagFalse("circuitBoardInserted")),
      text: "💠 把电路板插入最终大门的控制面板！",
    },
    {
      priority: 21,
      condition: all(hasItem("complete_key"), hasItem("key_core"), notHasItem("assembled_key")),
      text: "🏆 完整钥匙和钥匙核心都有了！去物品栏组合成组合钥匙！",
    },
    {
      priority: 22,
      condition: all(
        flagTrue("drawerUnlocked"),
        flagTrue("paintingRemoved"),
        flagTrue("boxOpened"),
        hasItem("complete_key"),
        hasItem("note_curtain"),
        hasItem("note_carpet"),
        any(
          notHasItem("note_hidden_curtain"),
          notHasItem("note_hidden_painting"),
          notHasItem("note_hidden_lamp"),
          notHasItem("note_hidden_shelf"),
          notHasItem("note_hidden_workbench")
        )
      ),
      text: "✅ 基础线索已集齐！可继续探索隐藏线索。窗帘、挂画、台灯、储物架、工作台处似乎还有更深的秘密…",
    },
    {
      priority: 23,
      condition: all(
        flagTrue("drawerUnlocked"),
        flagTrue("paintingRemoved"),
        flagTrue("boxOpened"),
        hasItem("note_hidden_curtain"),
        hasItem("note_hidden_painting"),
        hasItem("note_hidden_lamp"),
        hasItem("note_hidden_shelf"),
        hasItem("note_hidden_workbench")
      ),
      text: "🌟 全部隐藏暗码已集齐！去最终大门尝试隐藏密码 48256 解锁真结局！",
    },
  ],
  rooms: [
    {
      id: "room_study",
      name: "书房",
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
        {
          id: "secret_door",
          label: "暗门",
          icon: "🚪",
          initialStageId: "locked",
          stages: {
            locked: {
              id: "locked",
              description: "墙角处有一道不自然的裂缝，似乎隐藏着一扇暗门。",
              clueDetail:
                "仔细观察墙角，你发现一道与周围墙壁纹理不同的区域——这分明是一扇被巧妙伪装的暗门！但门上似乎有三道机关，分别与抽屉、挂画和箱子相关。",
              nextHint:
                "暗门被三道机关锁住了。需要打开抽屉、取下挂画、撬开箱子——完成这三件事后，暗门就会开启。",
              isLocked: true,
              lockReason: "需要完成书房全部探索",
              requires: all(
                flagTrue("drawerUnlocked"),
                flagTrue("paintingRemoved"),
                flagTrue("boxOpened")
              ),
              requiresMet: {
                description: "暗门上的三道机关都已解除，门缝中透出微弱的光线。",
                clueDetail:
                  "三道机关依次解除，暗门发出低沉的机械声，缓缓向内移开。门后是一条狭长的走廊，尽头隐约可见另一间房间。",
                nextHint: "暗门打开了！走进去探索储物间吧！",
              },
              onUnlock: {
                setFlags: { secretDoorOpened: true },
                showMessage: "🚪 暗门缓缓开启！门后是储物间！",
                messageType: "collect",
              },
              moveToStage: "opened",
            },
            opened: {
              id: "opened",
              description: "暗门已经打开，通往储物间的走廊清晰可见。",
              clueDetail:
                "暗门完全敞开，露出一条狭长的走廊。走廊尽头是另一间房间——储物间。那里也许藏着逃出密室的关键道具。",
              nextHint: "暗门已经打开，前往储物间继续探索吧！",
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
      ],
    },
    {
      id: "room_storage",
      name: "储物间",
      cells: [
        {
          id: "storage_shelf",
          label: "储物架",
          icon: "📦",
          initialStageId: "has_note",
          stages: {
            has_note: {
              id: "has_note",
              description: "一个堆满杂物的大型储物架，中间夹着一张破旧的纸条。",
              clueDetail:
                "储物架上堆满了落灰的杂物——旧报纸、空罐头、废弃零件。但在一层架板的夹缝中，你发现了一张被压住的破旧纸条，字迹虽然潦草但依稀可辨。",
              nextHint: "纸条上写着档案柜密码是5-2-7！去试试打开档案柜吧。",
              onInteract: {
                giveItems: ["note_shelf"],
                showMessage: "📝 在储物架上发现了一张破旧纸条！",
                messageType: "collect",
              },
              moveToStage: "has_hidden",
            },
            has_hidden: {
              id: "has_hidden",
              description: "储物架上杂物已被翻动过，最里层似乎还藏着什么。",
              clueDetail:
                "你继续往储物架深处摸索，在最里层的木板上方——一个几乎不可能被注意到的位置——贴着一张与木板颜色相近的微型标签。凑近辨认，上面用极小的字体印着一个数字「5」！",
              nextHint:
                "获得了隐藏线索！储物架暗码是「5」。继续寻找其他隐藏暗码——五处暗码集齐后可解出隐藏密码。",
              onInteract: {
                giveItems: ["note_hidden_shelf"],
                showMessage: "🔍 你在储物架最深处摸索，仔细检查着每一寸木板……",
                messageType: "info",
              },
              collectMessage: "📜 获得隐藏线索！储物架暗码是「5」！",
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "储物架上的东西已被你彻底翻遍。",
              clueDetail:
                "储物架上堆满了落灰的杂物，但所有有价值的东西都已经被你取走了。最里层的隐藏暗码也已经被你发现。",
              nextHint: "储物架已经彻底搜索完毕。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "workbench",
          label: "工作台",
          icon: "🛠️",
          initialStageId: "locked",
          stages: {
            locked: {
              id: "locked",
              description: "一张重型工作台，台面被螺丝牢牢锁住，无法打开。",
              clueDetail:
                "工作台是金属材质的，台面上有多个工具槽和零件位，但台面被四颗大号螺丝锁死了，徒手根本打不开。需要一把合适的螺丝刀才行。",
              nextHint: "工作台被螺丝锁住了。你需要一把螺丝刀——也许书房的抽屉里有？",
              isLocked: true,
              lockReason: "需要螺丝刀",
              requires: hasItem("screwdriver"),
              requiresMet: {
                description: "一张重型工作台，台面用螺丝锁着，可以用螺丝刀打开。",
                clueDetail:
                  "工作台是金属材质的，台面上有多个工具槽和零件位。四颗大号螺丝——你的螺丝刀刚好能拧开！",
                nextHint: "用螺丝刀拧开工作台的螺丝，看看里面藏着什么！",
              },
              onUnlock: {
                setFlags: { workbenchOpened: true },
                showMessage: "🔧 用螺丝刀拧开了工作台的螺丝！",
                messageType: "collect",
              },
              moveToStage: "opened",
            },
            opened: {
              id: "opened",
              description: "工作台已经打开，工具槽里整齐地摆放着几样东西。",
              clueDetail:
                "工作台台面被掀起，露出内部的工具槽。里面整齐地摆放着一把钢丝钳、一块电路板和一张便签纸——都是重要的道具。",
              nextHint:
                "获得了钢丝钳、电路板和工作台记录！钢丝钳可以剪铁丝，电路板是最终大门的组件。记得查看便签上的提示！",
              onInteract: {
                giveItems: ["wire_cutters", "circuit_board", "note_workbench"],
                showMessage: "🛠️ 在工作台中发现了钢丝钳、电路板和便签纸！",
                messageType: "collect",
              },
              moveToStage: "has_hidden",
            },
            has_hidden: {
              id: "has_hidden",
              description: "工作台底部似乎还有些未被发现的细节。",
              clueDetail:
                "你蹲下身子查看工作台底部，在一块松动的木板后面，发现了被人用烙铁刻下的痕迹。凑近辨认，是一个数字「6」！",
              nextHint:
                "获得了隐藏线索！工作台暗码是「6」。窗帘「4」、挂画「8」、台灯「2」、储物架「5」、工作台「6」——五处暗码集齐，隐藏密码就是 4-8-2-5-6！",
              onInteract: {
                giveItems: ["note_hidden_workbench"],
                showMessage: "🔍 你趴下身子查看工作台底部，仔细检查着每一块木板……",
                messageType: "info",
              },
              collectMessage: "📜 获得隐藏线索！工作台暗码是「6」！",
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "工作台已被你彻底检查过了。",
              clueDetail:
                "工作台台面敞开着，工具槽里的东西都已被你取走，底部的隐藏暗码也已被你发现。这里没有更多东西了。",
              nextHint: "工作台区域已彻底搜索完毕。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "filing_cabinet",
          label: "档案柜",
          icon: "📁",
          initialStageId: "locked",
          stages: {
            locked: {
              id: "locked",
              description: "一只灰色铁皮档案柜，柜门上装着三位数字密码锁。",
              clueDetail:
                "铁皮档案柜虽然有些锈迹，但结构依然坚固。柜门正面嵌着一个三位数字密码锁，锁面上有明显的使用痕迹。柜子里应该存放着重要文件。",
              nextHint: "档案柜被三位密码锁锁住了。也许储物间某个地方藏着密码线索——储物架上的纸条？",
              isLocked: true,
              lockReason: "三位密码锁",
              lockTargetId: "filing_cabinet",
            },
            empty: {
              id: "empty",
              description: "档案柜门敞开着，里面的文件已被你取走。",
              clueDetail: "铁皮档案柜的门敞开着，你取走了里面的所有重要文件。柜子深处空空如也。",
              nextHint: "档案柜已经被彻底搜过了。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "vent",
          label: "通风口",
          icon: "🔲",
          initialStageId: "sealed",
          stages: {
            sealed: {
              id: "sealed",
              description: "墙面高处的通风口被铁丝网牢牢封住，徒手无法打开。",
              clueDetail:
                "通风口位于墙面高处，铁丝网被牢牢钉在四周的框架上，网格密实。徒手根本撕不开——需要一把能剪断铁丝的工具。",
              nextHint: "通风口被封死了，需要能剪铁丝的工具。工作台里也许有你需要的东西……",
              isLocked: true,
              lockReason: "需要钢丝钳",
              requires: hasItem("wire_cutters"),
              requiresMet: {
                description: "通风口被铁丝网封住，用钢丝钳可以剪开。",
                clueDetail:
                  "通风口位于墙面高处，铁丝网被牢牢钉在四周的框架上——不过你的钢丝钳刃口锋利，正好能派上用场！",
                nextHint: "用钢丝钳剪开通风口的铁丝网，看看里面藏着什么！",
              },
              onUnlock: {
                setFlags: { ventOpened: true },
                showMessage: "✂️ 用钢丝钳剪开了铁丝网！",
                messageType: "collect",
              },
              moveToStage: "opened",
            },
            opened: {
              id: "opened",
              description: "通风口的铁丝网已被剪开，里面隐约可见金属光泽。",
              clueDetail:
                "铁丝网被剪开后，通风管道内壁干净整洁。在管道深处，你发现了一块散发着淡蓝色光泽的金属物体——似乎是某种精密组件。",
              nextHint: "获得了钥匙核心！它似乎能和完整钥匙组合——去物品栏试试组合功能！",
              onInteract: {
                giveItems: ["key_core"],
                showMessage: "💎 在通风管道里发现了钥匙核心！",
                messageType: "collect",
              },
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "通风口的铁丝网已被剪开，管道里空了。",
              clueDetail: "通风口的铁丝网已被剪开，管道内部空空如也——那块钥匙核心已经被你取走了。",
              nextHint: "通风口已经彻底搜过了。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "dark_corner",
          label: "暗角",
          icon: "🌑",
          initialStageId: "dark",
          stages: {
            dark: {
              id: "dark",
              description: "储物间最深处的角落，一片漆黑，什么也看不见。",
              clueDetail:
                "你朝储物间最深处的角落走去，但那里漆黑一片。你的眼睛逐渐适应了黑暗，隐约能看到角落的轮廓，但完全看不清任何细节。需要光源才能探索这里。",
              nextHint: "暗角太暗了，需要能发光的工具。你在书房找到的手电筒可以派上用场——但需要装上电池并打开。",
              isLocked: true,
              lockReason: "太暗了，需要光源",
              requires: hasItem("powered_flashlight"),
              requiresMet: {
                description: "暗角漆黑一片，你有手电筒但似乎没打开。",
                clueDetail:
                  "储物间最深处的角落漆黑一片。你有装好电池的手电筒但还没打开——先打开手电筒再看看！",
                nextHint: "打开手电筒，去暗角那里照亮看看！",
                lockReason: "需要打开手电筒",
              },
              moveToStage: "need_turn_on",
            },
            need_turn_on: {
              id: "need_turn_on",
              description: "储物间最深处的角落，一片漆黑，什么也看不见。",
              clueDetail:
                "储物间最深处的角落漆黑一片。你有装好电池的手电筒但还没打开——先打开手电筒再看看！",
              nextHint: "打开手电筒，去暗角那里照亮看看！",
              isLocked: true,
              lockReason: "需要打开手电筒",
              requires: flagTrue("flashlightActive"),
              requiresMet: {
                description: "储物间暗角在手电筒光下逐渐清晰，角落里似乎藏着什么东西。",
                clueDetail:
                  "储物间最深处的角落，手电筒的强光划破黑暗。在光线照射下，角落里隐约可见一个旧信封——似乎藏着什么重要的留言。",
                nextHint: "暗角被照亮了！去检查角落里的东西吧！",
              },
              moveToStage: "lit",
            },
            lit: {
              id: "lit",
              description: "储物间暗角在手电筒光下逐渐清晰，角落里似乎藏着什么东西。",
              clueDetail:
                "储物间最深处的角落，手电筒的强光划破黑暗。在光线照射下，角落里隐约可见一个旧信封——似乎藏着什么重要的留言。",
              nextHint: "获得了一封信！里面提到了最终大门的关键信息和通风口里藏着的钥匙组件。",
              onInteract: {
                giveItems: ["note_dark"],
                showMessage: "📝 在暗角里发现了一封旧信！",
                messageType: "collect",
              },
              moveToStage: "empty",
            },
            empty: {
              id: "empty",
              description: "储物间暗角已被你彻底检查过了。",
              clueDetail: "储物间最深处的角落，旧信封已经被你取走了。这里没有更多东西了。",
              nextHint: "暗角已经彻底搜过了。",
              alreadyChecked: true,
            },
          },
        },
        {
          id: "final_door",
          label: "最终大门",
          icon: "🚪",
          initialStageId: "need_circuit",
          stages: {
            need_circuit: {
              id: "need_circuit",
              description: "一扇厚重的铁门，门旁有一个空的控制面板，需要插入电路板。",
              clueDetail:
                "厚重的铁门牢牢封锁着出口。门旁的控制面板指示灯全灭，面板上有一个空的插槽——需要插入电路板才能激活控制系统。",
              nextHint: "最终大门的控制面板需要电路板才能启动。工作台里应该有电路板！",
              isLocked: true,
              lockReason: "需要电路板",
              requires: hasItem("circuit_board"),
              requiresMet: {
                description: "一扇厚重的铁门，控制面板已可插入电路板。",
                clueDetail:
                  "厚重的铁门牢牢封锁着出口。你手里有电路板，刚好可以插入控制面板的插槽。但仅靠电路板还不够——还需要密码或者更强大的钥匙才能开启大门。",
                nextHint: "插入电路板激活控制面板！然后需要找到密码或组合钥匙来开锁。",
              },
              onUnlock: {
                setFlags: { circuitBoardInserted: true },
                showMessage: "💠 电路板已插入控制面板！",
                messageType: "collect",
              },
              moveToStage: "need_method",
            },
            need_method: {
              id: "need_method",
              description: "一扇厚重的铁门，控制面板已激活，但还需要开锁方式。",
              clueDetail:
                "厚重的铁门牢牢封锁着出口。控制面板已经激活，指示灯闪烁着。但你还需要一种开锁方式——要么找到密码，要么用更强大的钥匙。",
              nextHint: "两条路任选其一：从档案柜的机密文件中找到四位密码，或用组合钥匙配合窗帘使用说明开锁。",
              isLocked: true,
              lockReason: "还需要开锁方式",
              requires: any(
                hasItem("note_cabinet"),
                all(hasItem("assembled_key"), hasItem("note_curtain"))
              ),
              requiresMet: {
                description: "一扇厚重的铁门——控制面板已激活，开锁条件全部就绪！",
                clueDetail:
                  "厚重的铁门就在眼前。控制面板已激活，你已具备开锁条件！点击门锁选择你的方式开锁——输入密码或使用组合钥匙！",
                nextHint: "一切就绪！点击门锁选择你的方式开锁！",
                lockReason: "开锁条件已满足",
              },
              moveToStage: "ready",
            },
            ready: {
              id: "ready",
              description: "一扇厚重的铁门——所有条件全部就绪，可以开锁了！",
              clueDetail:
                "厚重的铁门就在眼前，所有条件都已满足！是时候逃出去了！点击门锁选择开锁方式！",
              nextHint: "一切就绪！可以输入密码或使用组合钥匙！",
              isLocked: true,
              lockTargetId: "final_door",
            },
          },
        },
      ],
      locks: [
        {
          id: "filing_cabinet",
          label: "档案柜密码锁",
          icon: "📁",
          password: "527",
          digits: 3,
          errorHint: "密码错误，请重新输入。提示：储物架纸条——5-2-7！",
          onSuccess: {
            giveItems: ["oil_can", "note_cabinet"],
            setFlags: { cabinetOpened: true },
            setCellStage: { cellId: "filing_cabinet", stageId: "empty" },
            successMessage: "📁 档案柜打开了！获得了润滑油和机密文件！",
          },
        },
        {
          id: "final_door",
          label: "最终大门密码",
          icon: "🚪",
          password: "8523",
          digits: 4,
          beforeSubmit: all(
            flagTrue("drawerUnlocked"),
            flagTrue("paintingRemoved"),
            flagTrue("boxOpened"),
            flagTrue("circuitBoardInserted"),
            hasItem("note_cabinet")
          ),
          beforeSubmitMessage: "必须先完成全部探索并插入电路板后才能开启最终大门！",
          errorHint: "密码错误，请重新输入。提示：档案柜文件——8-5-2-3！",
          onSuccess: {
            triggerEnding: "normal_password",
            successMessage: "🔓 密码正确！最终大门应声而开！",
          },
          modalHints: [
            {
              condition: any(
                flagFalse("drawerUnlocked"),
                flagFalse("paintingRemoved"),
                flagFalse("boxOpened"),
                flagFalse("circuitBoardInserted")
              ),
              text: "必须先完成：打开抽屉、取下挂画、撬开箱子、插入电路板，完整探索后才能开启最终大门！",
              type: "warning",
            },
            {
              condition: all(
                flagTrue("drawerUnlocked"),
                flagTrue("paintingRemoved"),
                flagTrue("boxOpened"),
                flagTrue("circuitBoardInserted"),
                notHasItem("note_cabinet")
              ),
              text: "你还不知道密码。需要先从档案柜的机密文件中找到密码线索。",
              type: "warning",
            },
            {
              condition: all(
                flagTrue("drawerUnlocked"),
                flagTrue("paintingRemoved"),
                flagTrue("boxOpened"),
                flagTrue("circuitBoardInserted"),
                hasItem("note_cabinet"),
                any(
                  hasItem("note_hidden_curtain"),
                  hasItem("note_hidden_painting"),
                  hasItem("note_hidden_lamp"),
                  hasItem("note_hidden_shelf"),
                  hasItem("note_hidden_workbench")
                ),
                any(
                  notHasItem("note_hidden_curtain"),
                  notHasItem("note_hidden_painting"),
                  notHasItem("note_hidden_lamp"),
                  notHasItem("note_hidden_shelf"),
                  notHasItem("note_hidden_workbench")
                )
              ),
              text: "已发现部分隐藏线索，集齐全部五处暗码后可尝试隐藏密码解锁真结局！",
              type: "partial",
            },
          ],
          keyUnlock: {
            steps: [
              { condition: flagTrue("circuitBoardInserted"), reason: "需要先插入电路板", sidebarLabel: "先插入电路板" },
              { condition: hasItem("assembled_key"), reason: "需要先组合成组合钥匙", sidebarLabel: "需要组合钥匙" },
              { condition: hasItem("note_curtain"), reason: "需要获得钥匙使用说明", sidebarLabel: "需要钥匙说明" },
            ],
            buttonText: "🔑 使用组合钥匙开锁",
            keyItemId: "assembled_key",
            requiredNoteId: "note_curtain",
            defaultButtonText: "🔑 用钥匙开锁",
            unlockEffects: {
              triggerEnding: "normal_key",
              showMessage: "🔑 你按照窗帘背面刻下的指示——「向左三圈，再向右一圈」——小心翼翼地转动组合钥匙……",
              messageType: "collect",
            },
          },
          hiddenPassword: {
            lockId: "final_hidden",
            digits: 5,
            password: "48256",
            showCondition: all(
              flagTrue("drawerUnlocked"),
              flagTrue("paintingRemoved"),
              flagTrue("boxOpened"),
              flagTrue("circuitBoardInserted"),
              hasItem("note_hidden_curtain"),
              hasItem("note_hidden_painting"),
              hasItem("note_hidden_lamp"),
              hasItem("note_hidden_shelf"),
              hasItem("note_hidden_workbench")
            ),
            buttonText: "✨ 尝试隐藏密码（真结局）",
            hiddenClueItemIds: [
              "note_hidden_curtain",
              "note_hidden_painting",
              "note_hidden_lamp",
              "note_hidden_shelf",
              "note_hidden_workbench",
            ],
            partialHintCondition: all(
              flagTrue("drawerUnlocked"),
              flagTrue("paintingRemoved"),
              flagTrue("boxOpened"),
              flagTrue("circuitBoardInserted"),
              any(
                hasItem("note_hidden_curtain"),
                hasItem("note_hidden_painting"),
                hasItem("note_hidden_lamp"),
                hasItem("note_hidden_shelf"),
                hasItem("note_hidden_workbench")
              ),
              any(
                notHasItem("note_hidden_curtain"),
                notHasItem("note_hidden_painting"),
                notHasItem("note_hidden_lamp"),
                notHasItem("note_hidden_shelf"),
                notHasItem("note_hidden_workbench")
              )
            ),
            partialHintText: "💡 已发现 {found}/{total} 个隐藏线索，集齐后可尝试隐藏密码解锁真结局！",
            onSuccess: {
              triggerEnding: "true_ending",
              successMessage: "🌟 隐藏密码正确！墙面缓缓移开，一条暗道出现在你眼前……",
            },
          },
        },
        {
          id: "final_hidden",
          label: "隐藏密码锁",
          icon: "🗝️",
          password: "48256",
          digits: 5,
          errorHint: "隐藏密码错误。窗帘「4」·挂画「8」·台灯「2」·储物架「5」·工作台「6」，按顺序输入！",
          onSuccess: {
            triggerEnding: "true_ending",
            successMessage: "🌟 隐藏密码正确！墙面缓缓移开，一条暗道出现在你眼前……",
          },
          descriptionLines: [
            "📜 你已集齐五处隐藏暗码：",
            "窗帘「4」·挂画「8」·台灯「2」·储物架「5」·工作台「6」",
            "按此顺序输入五位数字，揭开真结局的秘密……",
          ],
        },
      ],
    },
  ],
};