import { describe, it, expect } from "vitest";
import {
  checkCondition,
  applyEffects,
  findMatchingRecipePure,
  verifyLockPassword,
  validateSaveVersion,
  collectItemPure,
} from "./engine";
import type { Condition, InteractionEffect, GameConfig } from "./types";
import { ESCAPE_ROOM_CONFIG, COMBINE_RECIPES } from "./gameData";

const mockConfig = ESCAPE_ROOM_CONFIG as GameConfig;

describe("checkCondition - 条件判断", () => {
  const emptyState = { inventory: [], flags: {} };

  it("hasItem: 拥有道具返回 true", () => {
    const cond: Condition = { type: "hasItem", itemId: "screwdriver" };
    expect(checkCondition(cond, { inventory: ["screwdriver"], flags: {} })).toBe(true);
  });

  it("hasItem: 未拥有道具返回 false", () => {
    const cond: Condition = { type: "hasItem", itemId: "screwdriver" };
    expect(checkCondition(cond, emptyState)).toBe(false);
  });

  it("hasItem: 缺少 itemId 时返回 false", () => {
    const cond: Condition = { type: "hasItem" };
    expect(checkCondition(cond, { inventory: ["screwdriver"], flags: {} })).toBe(false);
  });

  it("notHasItem: 未拥有道具返回 true", () => {
    const cond: Condition = { type: "notHasItem", itemId: "screwdriver" };
    expect(checkCondition(cond, emptyState)).toBe(true);
  });

  it("notHasItem: 已拥有道具返回 false", () => {
    const cond: Condition = { type: "notHasItem", itemId: "screwdriver" };
    expect(checkCondition(cond, { inventory: ["screwdriver"], flags: {} })).toBe(false);
  });

  it("notHasItem: 缺少 itemId 时返回 true", () => {
    const cond: Condition = { type: "notHasItem" };
    expect(checkCondition(cond, emptyState)).toBe(true);
  });

  it("flagTrue: flag 为 true 返回 true", () => {
    const cond: Condition = { type: "flagTrue", flagId: "drawerUnlocked" };
    expect(checkCondition(cond, { inventory: [], flags: { drawerUnlocked: true } })).toBe(true);
  });

  it("flagTrue: flag 为 false 返回 false", () => {
    const cond: Condition = { type: "flagTrue", flagId: "drawerUnlocked" };
    expect(checkCondition(cond, { inventory: [], flags: { drawerUnlocked: false } })).toBe(false);
  });

  it("flagTrue: 缺少 flagId 返回 false", () => {
    const cond: Condition = { type: "flagTrue" };
    expect(checkCondition(cond, { inventory: [], flags: { drawerUnlocked: true } })).toBe(false);
  });

  it("flagFalse: flag 为 false 返回 true", () => {
    const cond: Condition = { type: "flagFalse", flagId: "drawerUnlocked" };
    expect(checkCondition(cond, { inventory: [], flags: { drawerUnlocked: false } })).toBe(true);
  });

  it("flagFalse: flag 为 true 返回 false", () => {
    const cond: Condition = { type: "flagFalse", flagId: "drawerUnlocked" };
    expect(checkCondition(cond, { inventory: [], flags: { drawerUnlocked: true } })).toBe(false);
  });

  it("flagFalse: 缺少 flagId 返回 true", () => {
    const cond: Condition = { type: "flagFalse" };
    expect(checkCondition(cond, emptyState)).toBe(true);
  });

  it("all: 所有子条件都满足时返回 true", () => {
    const cond: Condition = {
      type: "all",
      conditions: [
        { type: "hasItem", itemId: "screwdriver" },
        { type: "flagTrue", flagId: "drawerUnlocked" },
      ],
    };
    expect(
      checkCondition(cond, {
        inventory: ["screwdriver"],
        flags: { drawerUnlocked: true },
      })
    ).toBe(true);
  });

  it("all: 任意子条件不满足时返回 false", () => {
    const cond: Condition = {
      type: "all",
      conditions: [
        { type: "hasItem", itemId: "screwdriver" },
        { type: "flagTrue", flagId: "drawerUnlocked" },
      ],
    };
    expect(
      checkCondition(cond, {
        inventory: ["screwdriver"],
        flags: { drawerUnlocked: false },
      })
    ).toBe(false);
  });

  it("all: 空条件数组返回 true", () => {
    const cond: Condition = { type: "all", conditions: [] };
    expect(checkCondition(cond, emptyState)).toBe(true);
  });

  it("all: 缺少 conditions 返回 true", () => {
    const cond: Condition = { type: "all" };
    expect(checkCondition(cond, emptyState)).toBe(true);
  });

  it("any: 任意子条件满足时返回 true", () => {
    const cond: Condition = {
      type: "any",
      conditions: [
        { type: "hasItem", itemId: "screwdriver" },
        { type: "flagTrue", flagId: "drawerUnlocked" },
      ],
    };
    expect(
      checkCondition(cond, {
        inventory: [],
        flags: { drawerUnlocked: true },
      })
    ).toBe(true);
  });

  it("any: 所有子条件都不满足时返回 false", () => {
    const cond: Condition = {
      type: "any",
      conditions: [
        { type: "hasItem", itemId: "screwdriver" },
        { type: "flagTrue", flagId: "drawerUnlocked" },
      ],
    };
    expect(checkCondition(cond, emptyState)).toBe(false);
  });

  it("any: 空条件数组返回 false", () => {
    const cond: Condition = { type: "any", conditions: [] };
    expect(checkCondition(cond, emptyState)).toBe(false);
  });

  it("any: 缺少 conditions 返回 false", () => {
    const cond: Condition = { type: "any" };
    expect(checkCondition(cond, emptyState)).toBe(false);
  });

  it("嵌套 all + any 组合条件", () => {
    const cond: Condition = {
      type: "all",
      conditions: [
        {
          type: "any",
          conditions: [
            { type: "hasItem", itemId: "screwdriver" },
            { type: "hasItem", itemId: "battery" },
          ],
        },
        { type: "flagTrue", flagId: "drawerUnlocked" },
      ],
    };
    expect(
      checkCondition(cond, {
        inventory: ["battery"],
        flags: { drawerUnlocked: true },
      })
    ).toBe(true);
    expect(
      checkCondition(cond, {
        inventory: ["battery"],
        flags: { drawerUnlocked: false },
      })
    ).toBe(false);
  });
});

describe("findMatchingRecipePure - 道具组合匹配", () => {
  it("完全匹配配方时返回对应配方", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["flashlight", "battery"],
      []
    );
    expect(recipe).not.toBeNull();
    expect(recipe?.output).toBe("powered_flashlight");
  });

  it("顺序无关，只要输入集合匹配即可", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["battery", "flashlight"],
      []
    );
    expect(recipe).not.toBeNull();
    expect(recipe?.output).toBe("powered_flashlight");
  });

  it("三片钥匙碎片组合匹配", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["frag_a", "frag_b", "frag_c"],
      []
    );
    expect(recipe).not.toBeNull();
    expect(recipe?.output).toBe("complete_key");
  });

  it("缺少输入项时返回 null", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["flashlight"],
      []
    );
    expect(recipe).toBeNull();
  });

  it("多了不相关的道具时返回 null", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["flashlight", "battery", "screwdriver"],
      []
    );
    expect(recipe).toBeNull();
  });

  it("数量不对时返回 null（多一个碎片）", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["frag_a", "frag_b"],
      []
    );
    expect(recipe).toBeNull();
  });

  it("已拥有产物时返回 null（避免重复组合）", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["flashlight", "battery"],
      ["powered_flashlight"]
    );
    expect(recipe).toBeNull();
  });

  it("空选择返回 null", () => {
    const recipe = findMatchingRecipePure(COMBINE_RECIPES, [], []);
    expect(recipe).toBeNull();
  });

  it("完全不相关的道具组合返回 null", () => {
    const recipe = findMatchingRecipePure(
      COMBINE_RECIPES,
      ["screwdriver", "battery"],
      []
    );
    expect(recipe).toBeNull();
  });
});

describe("collectItemPure & applyEffects - 重复获得道具去重", () => {
  it("collectItemPure: 新道具正常添加", () => {
    const result = collectItemPure([], "screwdriver");
    expect(result).toEqual(["screwdriver"]);
  });

  it("collectItemPure: 已有道具时不重复添加，返回原数组", () => {
    const inventory = ["screwdriver", "battery"];
    const result = collectItemPure(inventory, "screwdriver");
    expect(result).toBe(inventory);
    expect(result).toEqual(["screwdriver", "battery"]);
  });

  it("collectItemPure: 多个不同道具依次添加不重复", () => {
    let inv: string[] = [];
    inv = collectItemPure(inv, "screwdriver");
    inv = collectItemPure(inv, "battery");
    inv = collectItemPure(inv, "screwdriver");
    inv = collectItemPure(inv, "flashlight");
    expect(inv).toEqual(["screwdriver", "battery", "flashlight"]);
    expect(inv.length).toBe(3);
  });

  it("applyEffects: giveItems 不会重复添加已拥有的道具", () => {
    const effects: InteractionEffect = {
      giveItems: ["screwdriver", "battery", "note_drawer"],
    };
    const state = {
      inventory: ["screwdriver"],
      flags: {},
      escaped: false,
      endingId: null as string | null,
    };
    const result = applyEffects(effects, state, mockConfig);
    expect(result.newInventory).toContain("screwdriver");
    expect(result.newInventory).toContain("battery");
    expect(result.newInventory).toContain("note_drawer");
    expect(result.newInventory.indexOf("screwdriver")).toBe(
      result.newInventory.lastIndexOf("screwdriver")
    );
    expect(result.collectedItemIds).toEqual(["battery", "note_drawer"]);
    expect(result.collectedItemIds).not.toContain("screwdriver");
  });

  it("applyEffects: giveItems 中全部已有时 collectedItemIds 为空", () => {
    const effects: InteractionEffect = {
      giveItems: ["screwdriver", "battery"],
    };
    const state = {
      inventory: ["screwdriver", "battery", "flashlight"],
      flags: {},
      escaped: false,
      endingId: null as string | null,
    };
    const result = applyEffects(effects, state, mockConfig);
    expect(result.newInventory).toEqual(["screwdriver", "battery", "flashlight"]);
    expect(result.collectedItemIds).toEqual([]);
  });

  it("applyEffects: 不存在于 config.items 中的道具不会被添加", () => {
    const effects: InteractionEffect = {
      giveItems: ["screwdriver", "nonexistent_item_xyz"],
    };
    const state = {
      inventory: [],
      flags: {},
      escaped: false,
      endingId: null as string | null,
    };
    const result = applyEffects(effects, state, mockConfig);
    expect(result.newInventory).toEqual(["screwdriver"]);
    expect(result.collectedItemIds).toEqual(["screwdriver"]);
  });

  it("applyEffects: setFlags 正常设置 flag", () => {
    const effects: InteractionEffect = {
      setFlags: { drawerUnlocked: true, boxOpened: true },
    };
    const state = {
      inventory: [],
      flags: { drawerUnlocked: false },
      escaped: false,
      endingId: null as string | null,
    };
    const result = applyEffects(effects, state, mockConfig);
    expect(result.newFlags.drawerUnlocked).toBe(true);
    expect(result.newFlags.boxOpened).toBe(true);
  });

  it("applyEffects: triggerEnding 正确设置逃脱状态", () => {
    const effects: InteractionEffect = {
      triggerEnding: "normal_key",
    };
    const state = {
      inventory: [],
      flags: {},
      escaped: false,
      endingId: null as string | null,
    };
    const result = applyEffects(effects, state, mockConfig);
    expect(result.newEscaped).toBe(true);
    expect(result.newEndingId).toBe("normal_key");
    expect(result.newFlags.escaped).toBe(true);
  });
});

describe("verifyLockPassword - 密码锁提交成功/失败", () => {
  const drawerLock = {
    password: "137",
    digits: 3,
    errorHint: "密码错误，请重新输入。提示：书架纸条——7-3-1倒序！",
  };

  it("输入正确密码返回 success: true", () => {
    const result = verifyLockPassword(
      drawerLock,
      ["1", "3", "7"],
      { inventory: [], flags: {} }
    );
    expect(result.success).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it("输入错误密码返回 success: false 并附带错误提示", () => {
    const result = verifyLockPassword(
      drawerLock,
      ["7", "3", "1"],
      { inventory: [], flags: {} }
    );
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe(
      "密码错误，请重新输入。提示：书架纸条——7-3-1倒序！"
    );
  });

  it("位数不足（部分输入）返回失败", () => {
    const result = verifyLockPassword(
      drawerLock,
      ["1", "3"],
      { inventory: [], flags: {} }
    );
    expect(result.success).toBe(false);
  });

  it("空输入返回失败", () => {
    const result = verifyLockPassword(
      drawerLock,
      [],
      { inventory: [], flags: {} }
    );
    expect(result.success).toBe(false);
  });

  it("beforeSubmit 前置条件满足时允许提交", () => {
    const lockWithBefore = {
      password: "137",
      digits: 3,
      beforeSubmit: { type: "hasItem", itemId: "note_bookshelf" } as Condition,
      beforeSubmitMessage: "请先找到书架的纸条",
      errorHint: "密码错误",
    };
    const result = verifyLockPassword(
      lockWithBefore,
      ["1", "3", "7"],
      { inventory: ["note_bookshelf"], flags: {} }
    );
    expect(result.success).toBe(true);
  });

  it("beforeSubmit 前置条件不满足时返回前置错误", () => {
    const lockWithBefore = {
      password: "137",
      digits: 3,
      beforeSubmit: { type: "hasItem", itemId: "note_bookshelf" } as Condition,
      beforeSubmitMessage: "请先找到书架的纸条",
      errorHint: "密码错误",
    };
    const result = verifyLockPassword(
      lockWithBefore,
      ["1", "3", "7"],
      { inventory: [], flags: {} }
    );
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("请先找到书架的纸条");
  });

  it("beforeSubmit 前置条件不满足时即使密码正确也不通过", () => {
    const lockWithBefore = {
      password: "137",
      digits: 3,
      beforeSubmit: { type: "flagTrue", flagId: "drawerUnlocked" } as Condition,
      beforeSubmitMessage: "抽屉尚未解锁",
      errorHint: "密码错误",
    };
    const result = verifyLockPassword(
      lockWithBefore,
      ["1", "3", "7"],
      { inventory: [], flags: { drawerUnlocked: false } }
    );
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("抽屉尚未解锁");
  });

  it("无 errorHint 时使用默认错误消息", () => {
    const simpleLock = { password: "9999", digits: 4 };
    const result = verifyLockPassword(
      simpleLock,
      ["0", "0", "0", "0"],
      { inventory: [], flags: {} }
    );
    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe("密码错误");
  });
});

describe("validateSaveVersion - 存档数据版本校验", () => {
  const currentVersion = ESCAPE_ROOM_CONFIG.saveVersion;

  it("版本号完全一致时返回 true", () => {
    expect(validateSaveVersion(currentVersion, currentVersion)).toBe(true);
  });

  it("存档版本低于当前版本时返回 false", () => {
    expect(validateSaveVersion(currentVersion - 1, currentVersion)).toBe(false);
  });

  it("存档版本高于当前版本时返回 false", () => {
    expect(validateSaveVersion(currentVersion + 1, currentVersion)).toBe(false);
  });

  it("版本号为 0 与正常版本不匹配返回 false", () => {
    expect(validateSaveVersion(0, currentVersion)).toBe(false);
  });

  it("两个不同的大版本号不匹配", () => {
    expect(validateSaveVersion(1, 2)).toBe(false);
    expect(validateSaveVersion(2, 1)).toBe(false);
  });

  it("loadSaveData 行为模拟：版本不匹配应返回 false", () => {
    const wrongVersionSave = {
      version: currentVersion + 999,
      inventory: ["screwdriver"],
      flags: {},
    };
    expect(wrongVersionSave.version === currentVersion).toBe(false);
  });

  it("loadSaveData 行为模拟：版本匹配应返回 true", () => {
    const correctVersionSave = {
      version: currentVersion,
      inventory: ["screwdriver"],
      flags: {},
    };
    expect(correctVersionSave.version === currentVersion).toBe(true);
  });
});
