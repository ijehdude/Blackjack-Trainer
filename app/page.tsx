"use client";

import { useState } from "react";
import { GameState, GameSettings, PlayerAction } from "@/lib/types";
import { createInitialState, startDeal, playerAction, nextHand } from "@/lib/gameEngine";
import SetupScreen from "@/components/SetupScreen";
import BettingScreen from "@/components/BettingScreen";
import GameTable from "@/components/GameTable";
import StatsBar from "@/components/StatsBar";

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  function handleStart(settings: GameSettings) {
    setGameState(createInitialState(settings));
  }

  function handleHome() {
    setGameState(null);
  }

  function handleDeal() {
    if (!gameState) return;
    setGameState(startDeal(gameState));
  }

  function handleBetChange(bet: number) {
    if (!gameState) return;
    setGameState({ ...gameState, currentBet: bet });
  }

  function handleAction(action: PlayerAction) {
    if (!gameState) return;
    setGameState(playerAction(gameState, action));
  }

  function handleNextHand() {
    if (!gameState) return;
    setGameState(nextHand(gameState));
  }

  // Setup screen
  if (!gameState) {
    return <SetupScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-[#1a5c38] flex flex-col max-w-md mx-auto">
      {/* Stats bar */}
      <StatsBar state={gameState} onHome={handleHome} />

      {/* Game area */}
      <div className="flex-1 flex flex-col">
        {gameState.phase === "betting" ? (
          <BettingScreen
            state={gameState}
            onDeal={handleDeal}
            onBetChange={handleBetChange}
          />
        ) : (
          <GameTable
            state={gameState}
            onAction={handleAction}
            onNextHand={handleNextHand}
          />
        )}
      </div>
    </div>
  );
}
