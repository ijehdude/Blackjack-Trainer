"use client";

import { useState, useEffect } from "react";
import { GameState, GameSettings, PlayerAction } from "@/lib/types";
import { createInitialState, startDeal, playerAction, nextHand, dealerStep } from "@/lib/gameEngine";
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

  // Animate dealer's turn — draw one card every 650 ms until done
  useEffect(() => {
    if (gameState?.phase !== "dealerTurn") return;
    const t = setTimeout(
      () => setGameState((prev) => (prev?.phase === "dealerTurn" ? dealerStep(prev) : prev)),
      650
    );
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.phase, gameState?.dealerHand.length]);

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
    <div className="h-screen overflow-hidden flex flex-col max-w-md mx-auto" style={{ background: "radial-gradient(ellipse at 50% 40%, #1e6640 0%, #155c35 35%, #0d3520 70%, #081f14 100%)" }}>
      <StatsBar
        state={gameState}
        onHome={handleHome}
        showCount={showCount}
        onToggleCount={() => setShowCount((v) => !v)}
      />

      <div className="flex-1 flex flex-col min-h-0">
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
            onSelectHand={(index) =>
              setGameState({ ...gameState, activeHandIndex: index })
            }
          />
        )}
      </div>
    </div>
  );
}
