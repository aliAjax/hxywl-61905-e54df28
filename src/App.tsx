import { useState, useCallback } from "react";
import "./styles.css";
import { usePuzzleEngine, ESCAPE_ROOM_CONFIG } from "./puzzle-engine";
import type { GameConfig } from "./puzzle-engine/types";
import { DebugPanel } from "./DebugPanel";

import { useMessageToast } from "./hooks/useMessageToast";
import { useGameStats } from "./hooks/useGameStats";
import { useInventory } from "./hooks/useInventory";
import { usePuzzleLock } from "./hooks/usePuzzleLock";
import { useClueAndHints } from "./hooks/useClueAndHints";
import { useRoomBoard } from "./hooks/useRoomBoard";
import { useSaveSlots } from "./hooks/useSaveSlots";

import { MessageToast } from "./components/MessageToast";
import { StartScreen } from "./components/StartScreen";
import { VictoryScreen } from "./components/VictoryScreen";
import { GameStatsHeader } from "./components/GameStatsHeader";
import { RoomBoard } from "./components/RoomBoard";
import { InventoryPanel } from "./components/InventoryPanel";
import { ClueModal } from "./components/ClueModal";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { PuzzleLockModal } from "./components/PuzzleLockModal";
import { HintPanel } from "./components/HintPanel";
import { ClueBookPanel } from "./components/ClueBookPanel";
import { RoomProgressModal } from "./components/RoomProgressModal";
import { SaveSlotsPanel } from "./components/SaveSlotsPanel";

const CONFIG: GameConfig = ESCAPE_ROOM_CONFIG;

function App() {
  const engine = usePuzzleEngine(CONFIG);
  const [gameStarted, setGameStarted] = useState(false);

  const toast = useMessageToast();

  const gameStats = useGameStats({
    engine,
    config: CONFIG,
    gameStarted,
  });

  const inventory = useInventory({
    engine,
    config: CONFIG,
    showMsg: toast.showMsg,
    triggerCollectAnimation: toast.triggerCollectAnimation,
  });

  const clueAndHints = useClueAndHints({
    engine,
    config: CONFIG,
    showMsg: toast.showMsg,
  });

  const puzzleLock = usePuzzleLock({
    engine,
    config: CONFIG,
    showMsg: toast.showMsg,
    applyEffects: toast.applyEffects,
    openClueModal: clueAndHints.openClueModal,
    closeClueModal: clueAndHints.closeClueModal,
  });

  const roomBoard = useRoomBoard({
    engine,
    config: CONFIG,
    hasPoweredFlashlight: gameStats.hasPoweredFlashlight,
    applyEffects: toast.applyEffects,
    showMsg: toast.showMsg,
    openLock: puzzleLock.openLock,
    openClueModal: clueAndHints.openClueModal,
  });

  const onResetAllState = useCallback(() => {
    engine.reset();
    puzzleLock.resetLocks();
    inventory.resetCombine();
    inventory.resetDetailItem();
    clueAndHints.resetClues();
    clueAndHints.resetHints();
    clueAndHints.resetClueBook();
    clueAndHints.resetRoomProgress();
  }, [
    engine,
    puzzleLock,
    inventory,
    clueAndHints,
  ]);

  const onStartGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  const onExitToMenu = useCallback(() => {
    setGameStarted(false);
  }, []);

  const saveSlots = useSaveSlots({
    engine,
    config: CONFIG,
    showMsg: toast.showMsg,
    onResetAllState,
    onStartGame,
    onExitToMenu,
    resetLocks: puzzleLock.resetLocks,
    resetCombine: inventory.resetCombine,
    resetClues: clueAndHints.resetClues,
    resetHints: clueAndHints.resetHints,
    resetItems: inventory.resetDetailItem,
    resetRoomProgress: clueAndHints.resetRoomProgress,
  });

  if (!gameStarted) {
    return (
      <StartScreen
        config={CONFIG}
        slotMetas={saveSlots.getAllSlotMetas()}
        formatElapsed={gameStats.formatElapsedForSlot}
        formatSaveTime={gameStats.formatSaveTime}
        onContinue={saveSlots.handleContinue}
        onNewGame={saveSlots.handleNewGame}
        onDeleteSlot={saveSlots.clearSlot}
        onShowMessage={toast.showMsg}
      />
    );
  }

  if (engine.escaped) {
    return (
      <VictoryScreen
        config={CONFIG}
        ending={gameStats.getVictoryEnding()}
        evaluation={gameStats.evaluation}
        displayTime={gameStats.displayVictoryTime}
        noteCount={gameStats.noteCount}
        combineCount={engine.combineCount}
        hiddenClueCount={gameStats.hiddenClueCount}
        totalHintCount={gameStats.totalHintCount}
        completedSideQuestCount={gameStats.completedSideQuestCount}
        totalSideQuestCount={gameStats.totalSideQuestCount}
        allSideQuestProgress={gameStats.allSideQuestProgress}
        engineHintUsage={engine.hintUsage}
        currentSlot={saveSlots.currentSlot}
        onNewGame={saveSlots.handleNewGame}
        onExitToMenu={onExitToMenu}
      />
    );
  }

  return (
    <main className="game-shell">
      <GameStatsHeader
        elapsedTimeStr={gameStats.formatTime(gameStats.elapsedTime)}
        foundClueCount={clueAndHints.foundClueCount}
        totalClueCount={clueAndHints.totalClueCount}
        inventorySize={engine.inventory.length}
        combineCount={engine.combineCount}
        hiddenClueCount={gameStats.hiddenClueCount}
        completedSideQuestCount={gameStats.completedSideQuestCount}
        totalSideQuestCount={gameStats.totalSideQuestCount}
        totalHintCount={gameStats.totalHintCount}
        onOpenClueBook={clueAndHints.openClueBook}
        onOpenHintPanel={clueAndHints.openHintPanel}
        configTitle={CONFIG.title}
        configSubtitle={
          "书房→暗门→储物间→最终大门 | 两个房间共享物品栏和进度"
        }
      />
      <section className="playground escape">
        <RoomBoard
          config={CONFIG}
          currentRoom={roomBoard.currentRoom}
          CELLS={roomBoard.CELLS}
          engine={engine}
          getCellStatus={roomBoard.getCellStatus}
          getEnrichedCellContent={roomBoard.getEnrichedCellContent}
          handleCellClick={roomBoard.handleCellClick}
          getRoomProgress={clueAndHints.getRoomProgress}
          handleSwitchRoom={roomBoard.handleSwitchRoom}
          secretDoorOpened={roomBoard.secretDoorOpened}
          secretDoorReasons={roomBoard.secretDoorReasons || []}
          openRoomProgress={clueAndHints.openRoomProgress}
        />
        <InventoryPanel
          engine={engine}
          config={CONFIG}
          filterTab={inventory.filterTab}
          setFilterTab={inventory.setFilterTab}
          combineMode={inventory.combineMode}
          selectedForCombine={inventory.selectedForCombine}
          canCombine={inventory.canCombine}
          combinableItemIds={inventory.combinableItemIds}
          combineCandidateIds={inventory.combineCandidateIds}
          filteredInventory={inventory.filteredInventory}
          justCollected={toast.justCollected}
          toggleCombineSelect={inventory.toggleCombineSelect}
          handleCombine={inventory.handleCombine}
          toggleCombineMode={inventory.toggleCombineMode}
          handleItemClick={inventory.handleItemClick}
          fragmentCount={gameStats.fragmentCount}
          noteCount={gameStats.noteCount}
          toolCount={gameStats.toolCount}
          hasAssembledKey={gameStats.hasAssembledKey}
          hasCompleteKey={gameStats.hasCompleteKey}
          secretDoorOpened={roomBoard.secretDoorOpened}
          canUseKeyOnDoor={puzzleLock.canUseKeyOnDoor}
          keyUseReason={puzzleLock.keyUseReason}
          keySidebarLabel={puzzleLock.keySidebarLabel}
          handleUseKeyOnDoor={puzzleLock.handleUseKeyOnDoor}
          onQuickSave={saveSlots.handleQuickSave}
          onOpenSavePanel={() => saveSlots.setSaveSlotPanelOpen(true)}
          onRestart={saveSlots.handleRestart}
          onExitToMenu={onExitToMenu}
        />
      </section>

      <MessageToast message={toast.message} />

      <ItemDetailModal
        config={CONFIG}
        detailItem={inventory.detailItem}
        flashlightActive={engine.flashlightActive}
        hasKeyCore={engine.hasItem("key_core")}
        onClose={inventory.closeDetailItem}
        onToggleFlashlight={inventory.handleFlashlightToggleFromModal}
      />

      <ClueModal
        config={CONFIG}
        engine={engine}
        clueModalCellId={clueAndHints.clueModalCellId}
        clueModalCell={clueAndHints.clueModalCell}
        getEnrichedCellContent={roomBoard.getEnrichedCellContent}
        hasPoweredFlashlight={gameStats.hasPoweredFlashlight}
        curtainChecked={roomBoard.curtainChecked}
        onClose={clueAndHints.closeClueModal}
        onViewItemDetail={inventory.setDetailItemId}
        onOpenDrawerLock={() => puzzleLock.openLockFromClueModal("drawer")}
        onOpenFilingCabinetLock={() => puzzleLock.openLockFromClueModal("filing_cabinet")}
      />

      <PuzzleLockModal
        config={CONFIG}
        engine={engine}
        lockTargetId={puzzleLock.lockTargetId}
        lockDigits={puzzleLock.lockDigits}
        lockError={puzzleLock.lockError}
        currentLock={puzzleLock.currentLock}
        allLocks={puzzleLock.allLocks}
        doorUIInfo={puzzleLock.doorUIInfo}
        keyButtonText={puzzleLock.keyButtonText}
        canUseKeyOnDoor={puzzleLock.canUseKeyOnDoor}
        onClose={puzzleLock.closeLock}
        onDigit={puzzleLock.handleLockDigit}
        onDelete={puzzleLock.handleLockDelete}
        onSubmit={puzzleLock.handleLockSubmit}
        onUseKeyOnDoor={puzzleLock.handleUseKeyOnDoorFromLock}
        onSwitchHiddenLock={puzzleLock.handleSwitchHiddenLock}
      />

      <HintPanel
        config={CONFIG}
        engine={engine}
        hintPanelOpen={clueAndHints.hintPanelOpen}
        hintDetailId={clueAndHints.hintDetailId}
        hintMode={clueAndHints.hintMode}
        selectedHintPuzzle={clueAndHints.selectedHintPuzzle}
        availablePuzzles={clueAndHints.availablePuzzles}
        recommendedPuzzles={clueAndHints.recommendedPuzzles}
        totalHintCount={gameStats.totalHintCount}
        onClose={clueAndHints.closeHintPanel}
        onCloseDetail={clueAndHints.closeHintDetail}
        onBrowseMode={clueAndHints.setHintBrowseMode}
        onRecommendMode={clueAndHints.setHintRecommendMode}
        onOpenDetail={clueAndHints.openHintDetail}
        onRevealHint={clueAndHints.handleRevealHint}
        onJumpToCell={clueAndHints.handleJumpToCell}
        getUrgencyLabel={clueAndHints.getUrgencyLabel}
        getUrgencyColor={clueAndHints.getUrgencyColor}
      />

      <ClueBookPanel
        config={CONFIG}
        clueBookOpen={clueAndHints.clueBookOpen}
        clueBookDetailItemId={clueAndHints.clueBookDetailItemId}
        totalClueCount={clueAndHints.totalClueCount}
        foundClueCount={clueAndHints.foundClueCount}
        isClueRevealed={clueAndHints.isClueRevealed}
        onClose={clueAndHints.closeClueBook}
        onCloseDetail={clueAndHints.closeClueBookItem}
        onOpenItemDetail={clueAndHints.openClueBookItem}
      />

      <RoomProgressModal
        config={CONFIG}
        engine={engine}
        roomProgressModalRoomId={clueAndHints.roomProgressModalRoomId}
        getRoomProgress={clueAndHints.getRoomProgress}
        onClose={clueAndHints.closeRoomProgress}
        onJumpToCell={roomBoard.jumpToCell}
      />

      <SaveSlotsPanel
        saveSlotPanelOpen={saveSlots.saveSlotPanelOpen}
        slotMetas={saveSlots.getAllSlotMetas()}
        currentSlot={saveSlots.currentSlot}
        formatElapsed={gameStats.formatElapsedForSlot}
        formatSaveTime={gameStats.formatSaveTime}
        onClose={() => saveSlots.setSaveSlotPanelOpen(false)}
        onSave={saveSlots.saveGameToSlot}
        onLoad={saveSlots.handleLoadSlotInGame}
        onDelete={saveSlots.clearSlot}
        onShowMessage={toast.showMsg}
        setCurrentSlot={saveSlots.setCurrentSlot}
      />

      <section className="result-panel">
        <h2>探索进度</h2>
        <p>{gameStats.progressText}</p>
        {engine.lastHint && (
          <div className="last-hint">
            <span className="last-hint-label">💡 最近提示</span>
            <span className="last-hint-text">{engine.lastHint}</span>
          </div>
        )}
      </section>

      {import.meta.env.DEV && (
        <DebugPanel
          engine={engine}
          config={CONFIG}
          onResetUI={() => {
            puzzleLock.resetLocks();
            inventory.resetCombine();
            inventory.resetDetailItem();
            clueAndHints.resetClues();
            clueAndHints.resetHints();
            clueAndHints.resetClueBook();
            clueAndHints.resetRoomProgress();
          }}
        />
      )}
    </main>
  );
}

export default App;
