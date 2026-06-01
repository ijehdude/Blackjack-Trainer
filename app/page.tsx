"use client";

import { useState } from "react";
import { GameState, GameSettings, PlayerAction } from "@/lib/types";
import { createInitialState, startDeal, playerAction, nextHand } from "@/lib/gameEngine";
import { randomDealerName } from "@/lib/strategy";
import SetupScreen from "@/components/SetupScreen";
import BettingScreen from "@/components/BettingScreen";
import GameTable from "@/components/GameTable";
import StatsBar from "@/components/StatsBar";

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [dealerName, setDealerName] = useState("");
  const [showCount, setShowCount] = useState(false);
  const [lastBet, setLastBet] = useState(0);

  function handleStart(settings: GameSettings) {
    setGameState(createInitialState(settings));
    setDealerName(randomDealerName());
  }

  function handleHome() {
    setGameState(null);
  }

  function handleDeal() {
    if (!gameState) return;
    setLastBet(gameState.currentBet);
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
    // New dealer name each hand
    setDealerName(randomDealerName());
    setGameState(nextHand(gameState));
  }

  if (!gameState) {
    return <SetupScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-[#1a5c38] flex flex-col max-w-md mx-auto">
      <StatsBar
        state={gameState}
        onHome={handleHome}
        showCount={showCount}
        onToggleCount={() => setShowCount((v) => !v)}
      />

      <div className="flex-1 flex flex-col">
        {gameState.phase === "betting" ? (
          <BettingScreen
            state={gameState}
            dealerName={dealerName}
            onDeal={handleDeal}
            onBetChange={handleBetChange}
            lastBet={lastBet}
          />
        ) : (
          <GameTable
            state={gameState}
            dealerName={dealerName}
            onAction={handleAction}
            onNextHand={handleNextHand}
          />
        )}
      </div>
    </div>
  );
}
