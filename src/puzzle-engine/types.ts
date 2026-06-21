export type ItemCategory = "key_fragment" | "note" | "tool";

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string;
  description: string;
  detail: string;
}

export type ConditionType =
  | "hasItem"
  | "notHasItem"
  | "flagTrue"
  | "flagFalse"
  | "all"
  | "any";

export interface Condition {
  type: ConditionType;
  itemId?: string;
  flagId?: string;
  conditions?: Condition[];
}

export type MessageType = "info" | "collect" | "empty" | "error";

export interface InteractionEffect {
  giveItems?: string[];
  setFlags?: Record<string, boolean>;
  showMessage?: string;
  messageType?: MessageType;
  triggerEnding?: string;
}

export interface StageOverride {
  description?: string;
  clueDetail?: string;
  nextHint?: string;
  lockReason?: string;
}

export interface InteractionStage {
  id: string;
  description: string;
  clueDetail: string;
  nextHint: string;
  isLocked?: boolean;
  lockReason?: string;
  requires?: Condition;
  requiresMet?: StageOverride;
  onInteract?: InteractionEffect;
  onUnlock?: InteractionEffect;
  moveToStage?: string;
  lockTargetId?: string;
  collectMessage?: string;
  alreadyChecked?: boolean;
}

export interface CellDef {
  id: string;
  label: string;
  icon: string;
  initialStageId: string;
  stages: Record<string, InteractionStage>;
}

export interface LockResult {
  giveItems?: string[];
  setFlags?: Record<string, boolean>;
  triggerEnding?: string;
  setCellStage?: { cellId: string; stageId: string };
  successMessage: string;
}

export interface LockDef {
  id: string;
  label: string;
  icon: string;
  password: string;
  digits: number;
  beforeSubmit?: Condition;
  beforeSubmitMessage?: string;
  onSuccess: LockResult;
  errorHint?: string;
}

export interface CombineRecipe {
  id: string;
  inputs: string[];
  output: string;
  consumesInputs: boolean;
  successMessage: string;
  failMessage: string;
}

export interface EndingDef {
  id: string;
  title: string;
  icon: string;
  tag: string;
  isTrueEnding?: boolean;
  story: string[];
}

export interface HintPuzzleDef {
  id: string;
  title: string;
  icon: string;
  hints: [string, string, string];
  completedCondition: Condition;
  availableCondition: Condition;
}

export interface RoomDef {
  id: string;
  name: string;
  cells: CellDef[];
  locks: LockDef[];
}

export interface CategoryConfig {
  label: string;
  color: string;
}

export interface GameConfig {
  id: string;
  title: string;
  subtitle: string;
  saveKey: string;
  saveVersion: number;
  categoryLabels: Record<ItemCategory, string>;
  categoryColors: Record<ItemCategory, string>;
  filterTabs: { key: "all" | ItemCategory; label: string }[];
  rooms: RoomDef[];
  items: Record<string, ItemDef>;
  combineRecipes: CombineRecipe[];
  endings: Record<string, EndingDef>;
  hintPuzzles: HintPuzzleDef[];
  intro: {
    title: string;
    description: string;
  };
  progressSummary: {
    key: string;
    icon: string;
    label: string;
    condition?: Condition;
    countMode?: "inventoryCategory" | "inventorySize" | "flag" | "combineCount" | "custom";
    category?: ItemCategory;
    flagId?: string;
    total?: number;
    customValue?: (state: EngineState) => string;
  }[];
}

export interface SaveData {
  version: number;
  savedAt: number;
  inventory: string[];
  investigatedCellIds: string[];
  cellStageIds: Record<string, string>;
  flags: Record<string, boolean>;
  flashlightActive: boolean;
  escaped: boolean;
  endingId: string | null;
  lastHint: string;
  gameStartTime: number;
  combineCount: number;
  hintUsage: Record<string, number>;
}

export interface EngineState {
  inventory: string[];
  investigatedCellIds: Set<string>;
  cellStageIds: Record<string, string>;
  flags: Record<string, boolean>;
  flashlightActive: boolean;
  escaped: boolean;
  endingId: string | null;
  combineCount: number;
  hintUsage: Record<string, number>;
  lastHint: string;
  gameStartTime: number;
}

export interface EngineActions {
  hasItem: (id: string) => boolean;
  checkCondition: (cond: Condition) => boolean;
  getCell: (cellId: string) => CellDef | undefined;
  getCellStage: (cellId: string) => InteractionStage | undefined;
  getCellContent: (cellId: string) => {
    description: string;
    clueDetail: string;
    nextHint: string;
    itemId?: string;
    isLocked?: boolean;
    lockReason?: string;
    alreadyChecked?: boolean;
    requiresText?: string;
    lockTargetId?: string;
  };
  collectItem: (itemId: string, customMessage?: string) => void;
  interactCell: (cellId: string) => {
    effects: InteractionEffect[];
    openLockId?: string;
    showClue?: boolean;
  };
  findMatchingRecipe: (selectedIds: string[]) => CombineRecipe | null;
  performCombine: (recipe: CombineRecipe) => void;
  submitLock: (lockId: string, digits: string[]) => {
    success: boolean;
    errorMessage?: string;
    effects?: InteractionEffect;
  };
  canUseKeyOnLock: (lockId: string) => { canUse: boolean; reason?: string };
  useKeyOnLock: (lockId: string, keyItemId: string, requiredItemId: string) => void;
  toggleFlashlight: () => void;
  markInvestigated: (cellId: string) => void;
  revealHint: (puzzleId: string) => { level: number; title: string } | null;
  reset: () => void;
  getState: () => EngineState;
  getSaveData: () => SaveData;
  loadSaveData: (data: SaveData) => boolean;
}

export type PuzzleEngine = EngineState & EngineActions;
