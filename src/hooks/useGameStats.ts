import { useState, useCallback, useEffect, useMemo } from "react";
import type { PuzzleEngine, GameConfig, SaveSlotMeta } from "../puzzle-engine/types";

export type EvalGrade = "S" | "A" | "B" | "C" | "D";

export interface EscapeEvaluation {
  grade: EvalGrade;
  score: number;
  title: string;
  comment: string;
  breakdown: {
    time: { score: number; max: number; label: string };
    hints: { score: number; max: number; label: string };
    hiddenClues: { score: number; max: number; label: string };
    trueEnding: { score: number; max: number; label: string };
    combines: { score: number; max: number; label: string };
    sideQuests: { score: number; max: number; label: string };
  };
}

const HIDDEN_CLUE_IDS = [
  "note_hidden_curtain",
  "note_hidden_painting",
  "note_hidden_lamp",
  "note_hidden_shelf",
  "note_hidden_workbench",
];

function computeEscapeEvaluation(params: {
  elapsedMs: number;
  hintCount: number;
  hiddenClueCount: number;
  totalHiddenClues: number;
  isTrueEnding: boolean;
  combineCount: number;
  sideQuestBonus: number;
  totalSideQuests: number;
}): EscapeEvaluation {
  const { elapsedMs, hintCount, hiddenClueCount, totalHiddenClues, isTrueEnding, combineCount, sideQuestBonus, totalSideQuests } = params;
  const minutes = elapsedMs / 60000;

  let timeScore = 4;
  if (minutes < 5) timeScore = 25;
  else if (minutes < 10) timeScore = 20;
  else if (minutes < 15) timeScore = 16;
  else if (minutes < 20) timeScore = 12;
  else if (minutes < 30) timeScore = 8;

  let hintScore = 0;
  if (hintCount === 0) hintScore = 25;
  else if (hintCount <= 3) hintScore = 18;
  else if (hintCount <= 6) hintScore = 10;
  else if (hintCount <= 9) hintScore = 5;

  let hiddenScore = Math.round((hiddenClueCount / totalHiddenClues) * 25);

  const trueEndingScore = isTrueEnding ? 15 : 0;

  let combineScore = 0;
  if (combineCount >= 3) combineScore = 10;
  else if (combineCount === 2) combineScore = 7;
  else if (combineCount === 1) combineScore = 4;

  const sideQuestMaxScore = totalSideQuests > 0 ? totalSideQuests * 10 : 10;

  const total = Math.min(
    100,
    timeScore + hintScore + hiddenScore + trueEndingScore + combineScore + sideQuestBonus
  );

  let grade: EvalGrade = "D";
  let title = "顽强逃脱者";
  let comment = "密室给了你不少考验，但你从未放弃。每一次失败都是通往成功的基石。";
  if (total >= 90) {
    grade = "S";
    title = "大师级逃脱者";
    comment = "完美的逃脱！你以超凡的洞察力和效率揭开了密室的所有秘密，堪称逃脱大师！";
  } else if (total >= 75) {
    grade = "A";
    title = "专家级逃脱者";
    comment = "出色的表现！你展现了优秀的解谜能力，距离完美只差一步之遥。";
  } else if (total >= 55) {
    grade = "B";
    title = "熟练级逃脱者";
    comment = "不错的逃脱！你稳步解开了谜题，仍有一些隐藏的秘密等待你来发掘。";
  } else if (total >= 35) {
    grade = "C";
    title = "新手级逃脱者";
    comment = "成功逃脱！虽然遇到了一些困难，但你最终找到了出路。下次可以试试不用提示？";
  }

  return {
    grade,
    score: total,
    title,
    comment,
    breakdown: {
      time: { score: timeScore, max: 25, label: "通关速度" },
      hints: { score: hintScore, max: 25, label: "提示控制" },
      hiddenClues: { score: hiddenScore, max: 25, label: "隐藏探索" },
      trueEnding: { score: trueEndingScore, max: 15, label: "真结局" },
      combines: { score: combineScore, max: 10, label: "道具组合" },
      sideQuests: { score: sideQuestBonus, max: sideQuestMaxScore, label: "支线解谜" },
    },
  };
}

export interface UseGameStatsProps {
  engine: PuzzleEngine;
  config: GameConfig;
  gameStarted: boolean;
}

export function useGameStats({ engine, config, gameStarted }: UseGameStatsProps) {
  const [currentTime, setCurrentTime] = useState<number>(0);

  const gameStartTime = engine.gameStartTime;

  useEffect(() => {
    if (!gameStarted || engine.escaped || gameStartTime === 0) return;
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, engine.escaped, gameStartTime]);

  useEffect(() => {
    if (engine.escaped && engine.finalElapsedTime === 0 && gameStartTime > 0) {
      const elapsed = (currentTime > 0 ? currentTime : Date.now()) - gameStartTime;
      if (elapsed > 0) {
        engine.setFinalElapsedTime(elapsed);
      }
    }
  }, [engine, engine.escaped, engine.finalElapsedTime, gameStartTime, currentTime]);

  const formatTime = useCallback((ms: number): string => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const formatElapsedForSlot = useCallback((ms: number): string => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const formatSaveTime = useCallback((ts: number): string => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }, []);

  const elapsedTime = currentTime > 0 && gameStartTime > 0 ? currentTime - gameStartTime : 0;

  const itemCount = useCallback(
    (cat: "key_fragment" | "note" | "tool") =>
      engine.inventory.filter((id) => config.items[id]?.category === cat).length,
    [engine.inventory, config.items]
  );

  const fragmentCount = useMemo(
    () =>
      engine.inventory.filter(
        (id) =>
          config.items[id]?.category === "key_fragment" &&
          id !== "complete_key" &&
          id !== "assembled_key"
      ).length,
    [engine.inventory, config.items]
  );
  const noteCount = itemCount("note");
  const toolCount = itemCount("tool");
  const hasCompleteKey = engine.hasItem("complete_key");
  const hasPoweredFlashlight = engine.hasItem("powered_flashlight");
  const hasFlashlight = engine.hasItem("flashlight");
  const hasAssembledKey = engine.hasItem("assembled_key");

  const hiddenClueCount = useMemo(
    () => HIDDEN_CLUE_IDS.filter((id) => engine.hasItem(id)).length,
    [engine]
  );
  const hasAllHiddenClues = hiddenClueCount === 5;

  const totalSideQuestCount = config.sideQuests?.length ?? 0;
  const completedSideQuestCount = engine.getCompletedSideQuestCount();
  const sideQuestRatingBonus = engine.getSideQuestRatingBonus();
  const allSideQuestProgress = engine.getAllSideQuestProgress();

  const totalHintCount = useMemo(
    () => Object.values(engine.hintUsage).reduce((sum, n) => sum + n, 0),
    [engine.hintUsage]
  );
  const puzzlesHintedCount = Object.keys(engine.hintUsage).length;

  const evaluation = useMemo(() => {
    if (!engine.escaped) return null;
    const ending = engine.endingId ? config.endings[engine.endingId] : null;
    const isTrueEnding = ending?.isTrueEnding ?? false;
    const effectiveElapsed = engine.finalElapsedTime > 0 ? engine.finalElapsedTime : elapsedTime;

    return computeEscapeEvaluation({
      elapsedMs: effectiveElapsed,
      hintCount: totalHintCount,
      hiddenClueCount,
      totalHiddenClues: 5,
      isTrueEnding,
      combineCount: engine.combineCount,
      sideQuestBonus: sideQuestRatingBonus,
      totalSideQuests: totalSideQuestCount,
    });
  }, [
    engine.escaped,
    engine.endingId,
    engine.finalElapsedTime,
    engine.combineCount,
    config.endings,
    elapsedTime,
    totalHintCount,
    hiddenClueCount,
    sideQuestRatingBonus,
    totalSideQuestCount,
  ]);

  const displayVictoryTime = useMemo(() => {
    if (!engine.escaped) return "00:00";
    const effectiveElapsed = engine.finalElapsedTime > 0 ? engine.finalElapsedTime : elapsedTime;
    return formatTime(effectiveElapsed);
  }, [engine.escaped, engine.finalElapsedTime, elapsedTime, formatTime]);

  const getVictoryEnding = useCallback(() => {
    return engine.endingId ? config.endings[engine.endingId] : null;
  }, [engine.endingId, config.endings]);

  const progressText = engine.getProgressText();

  return {
    formatTime,
    formatElapsedForSlot,
    formatSaveTime,
    elapsedTime,
    itemCount,
    fragmentCount,
    noteCount,
    toolCount,
    hasCompleteKey,
    hasPoweredFlashlight,
    hasFlashlight,
    hasAssembledKey,
    hiddenClueCount,
    hasAllHiddenClues,
    totalSideQuestCount,
    completedSideQuestCount,
    sideQuestRatingBonus,
    allSideQuestProgress,
    totalHintCount,
    puzzlesHintedCount,
    evaluation,
    displayVictoryTime,
    getVictoryEnding,
    progressText,
  };
}
