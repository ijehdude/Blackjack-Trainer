"use client";

import { GameState, PlayerAction, Hand } from "@/lib/types";
import { handValue } from "@/lib/shoe";
import { getCorrectAction } from "@/lib/strategy";
import PlayingCard from "./PlayingCard";

interface GameTableProps {
  state: GameState;
  onAction: (action: PlayerAction) => void;
  onNextHand: () => void;
}

export default function GameTable({ state, onAction, onNextHand }: GameTableProps) {
  const isResult = state.phase === "result";
  const activeHand = state.playerHands[state.activeHandIndex];
  const dealerValue = handValue(state.dealerHand.filter((c) => !c.faceDown));
  const dealerBust = !isResult ? false : handValue(state.dealerHand).value > 21;

  // Determine available actions
  const canAct = state.phase === "playerTurn" && activeHand && !activeHand.stood && !activeHand.result;
  const canDouble = canAct && activeHand.cards.length === 2 && state.stack >= activeHand.bet;
  const canSplit =
    canAct &&
    activeHand.cards.length === 2 &&
    activeHand.cards[0].rank === activeHand.cards[1].rank &&
    state.playerHands.length < 4 &&
    state.stack >= activeHand.bet;
  const canSurrender =
    canAct &&
    state.settings.lateSurrender &&
    activeHand.cards.length === 2 &&
    state.playerHands.length === 1;

  return (
    <div className="flex flex-col h-full">
      {/* Dealer area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-2">
        <p className="text-gray-400 text-xs uppercase tracking-widest">Dealer</p>
        <div className="flex gap-2 items-end">
          {state.dealerHand.map((card, i) => (
            <PlayingCard key={i} card={card} />
          ))}
        </div>
        {state.dealerHand.length > 0 && (
          <div className={`text-sm font-bold ${dealerBust ? "text-red-400" : "text-white"}`}>
            {dealerBust
              ? `Bust (${handValue(state.dealerHand).value})`
              : dealerValue.value > 0
              ? dealerValue.value
              : ""}
          </div>
        )}
      </div>

      {/* Player hands */}
      <div className="px-4 space-y-3">
        {state.playerHands.map((hand, hi) => (
          <PlayerHandDisplay
            key={hi}
            hand={hand}
            isActive={hi === state.activeHandIndex && state.phase === "playerTurn"}
            isResult={isResult}
            label={state.playerHands.length > 1 ? `Hand ${hi + 1}` : "Seat 1"}
          />
        ))}
      </div>

      {/* Action buttons or result */}
      <div className="px-4 pb-4 mt-3 space-y-2">
        {isResult ? (
          <>
            {/* Strategy feedback */}
            {state.wasCorrect !== undefined && (
              <div
                className={`text-center py-2 rounded-lg text-sm font-bold ${
                  state.wasCorrect
                    ? "text-green-400 bg-green-900/30"
                    : "text-red-400 bg-red-900/30"
                }`}
              >
                {state.wasCorrect ? (
                  "✓ Correct"
                ) : (
                  <span>
                    ✗ Should have{" "}
                    <span className="uppercase">{state.correctAction}</span>
                  </span>
                )}
              </div>
            )}
            {state.message && (
              <div className="text-center text-[#c9a84c] text-sm font-bold">
                {state.message}
              </div>
            )}
            <button
              onClick={onNextHand}
              className="w-full py-4 bg-[#c9a84c] hover:bg-[#e0c06a] text-black font-bold text-lg tracking-widest uppercase rounded-xl transition-all active:scale-95"
            >
              Next Hand
            </button>
          </>
        ) : canAct ? (
          <>
            <div className="flex gap-2">
              <ActionBtn label="Hit" color="blue" onClick={() => onAction("hit")} />
              <ActionBtn label="Stand" color="green" onClick={() => onAction("stand")} />
              {canDouble && (
                <ActionBtn label="Double" color="purple" onClick={() => onAction("double")} />
              )}
              {canSplit && (
                <ActionBtn label="Split" color="yellow" onClick={() => onAction("split")} />
              )}
            </div>
            {canSurrender && (
              <button
                onClick={() => onAction("surrender")}
                className="w-full py-3 border border-red-700 text-red-400 font-bold tracking-widest uppercase rounded-xl hover:bg-red-900/30 transition-all active:scale-95 text-sm"
              >
                Surrender
              </button>
            )}
            <p className="text-center text-gray-500 text-xs uppercase tracking-widest">
              Make your move
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PlayerHandDisplay({
  hand,
  isActive,
  isResult,
  label,
}: {
  hand: Hand;
  isActive: boolean;
  isResult: boolean;
  label: string;
}) {
  const { value, soft } = handValue(hand.cards);
  const bust = value > 21;
  const result = hand.result;

  const resultColor = {
    win: "text-green-400",
    blackjack: "text-yellow-400",
    push: "text-gray-400",
    lose: "text-red-400",
    bust: "text-red-400",
  }[result ?? ""] ?? "";

  const resultLabel = {
    win: `Win +$${hand.bet}`,
    blackjack: `Blackjack! +$${Math.floor(hand.bet * 1.5)}`,
    push: "Push",
    lose: `Lose -$${hand.bet}`,
    bust: `Bust`,
  }[result ?? ""] ?? "";

  return (
    <div
      className={`rounded-xl p-3 border transition-all ${
        isActive
          ? "border-[#c9a84c] bg-[#1a5c38]/40"
          : "border-green-900/40 bg-[#1a5c38]/20"
      }`}
    >
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">{label}</p>
      <div className="flex gap-2 items-end">
        {hand.cards.map((card, i) => (
          <PlayingCard key={i} card={card} small />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className={`text-sm font-bold ${bust ? "text-red-400" : "text-white"}`}>
          {bust ? `Bust (${value})` : `${soft && value < 21 ? "Soft " : ""}${value}`}
        </span>
        {hand.doubled && (
          <span className="text-xs text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded">
            2x
          </span>
        )}
        {hand.surrendered && (
          <span className="text-xs text-orange-400 bg-orange-900/30 px-1.5 py-0.5 rounded">
            Surrendered
          </span>
        )}
        {isResult && result && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              result === "win" || result === "blackjack"
                ? "bg-green-900/50 text-green-400"
                : result === "push"
                ? "bg-gray-800 text-gray-400"
                : "bg-red-900/50 text-red-400"
            }`}
          >
            {resultLabel}
          </span>
        )}
      </div>
      <div className="text-[#c9a84c] text-sm font-bold mt-1">${hand.bet.toLocaleString()}</div>
    </div>
  );
}

function ActionBtn({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "blue" | "green" | "purple" | "yellow";
  onClick: () => void;
}) {
  const colors = {
    blue: "text-cyan-400 border-cyan-700 hover:bg-cyan-900/30",
    green: "text-green-400 border-green-700 hover:bg-green-900/30",
    purple: "text-purple-400 border-purple-700 hover:bg-purple-900/30",
    yellow: "text-yellow-400 border-yellow-700 hover:bg-yellow-900/30",
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 border font-bold tracking-widest uppercase rounded-xl transition-all active:scale-95 text-sm ${colors[color]}`}
    >
      {label}
    </button>
  );
}
