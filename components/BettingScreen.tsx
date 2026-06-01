"use client";

import { GameState } from "@/lib/types";
import { trueCount, handValue } from "@/lib/shoe";
import { kellyBet } from "@/lib/strategy";

const CHIP_VALUES = [1, 5, 25, 50, 100, 500, 1000];
const CHIP_COLORS: Record<number, string> = {
  1: "bg-gray-300 text-gray-800",
  5: "bg-red-600",
  25: "bg-green-600",
  50: "bg-blue-600",
  100: "bg-gray-500",
  500: "bg-purple-600",
  1000: "bg-orange-500",
};

interface BettingScreenProps {
  state: GameState;
  onDeal: () => void;
  onBetChange: (bet: number) => void;
}

export default function BettingScreen({ state, onDeal, onBetChange }: BettingScreenProps) {
  const tc = trueCount(state.runningCount, state.shoe);
  const suggested = kellyBet(state.stack, tc, 25);

  function addChip(val: number) {
    onBetChange(Math.min(state.stack, state.currentBet + val));
  }

  function clearBet() {
    onBetChange(0);
  }

  const betReady = state.currentBet > 0 && state.currentBet <= state.stack;

  return (
    <div className="flex flex-col h-full">
      {/* Dealer area placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-6">
        <p className="text-gray-400 text-xs uppercase tracking-widest">Place Your Bet</p>

        {/* Bet display */}
        <div className="bg-[#123d26] rounded-xl px-8 py-4 mt-2 text-center">
          <div className="text-3xl font-bold text-[#c9a84c]">
            ${state.currentBet.toLocaleString()}
          </div>
          {tc >= 2 && (
            <div className="text-xs text-green-400 mt-1">
              💡 Suggested: ${suggested.toLocaleString()} (TC {tc.toFixed(1)})
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {CHIP_VALUES.filter((v) => v <= state.stack || v <= 1000).map((val) => (
            <button
              key={val}
              onClick={() => addChip(val)}
              disabled={val > state.stack}
              className={`chip w-14 h-14 rounded-full font-bold text-xs text-white shadow-lg border-2 border-white/20 transition-all active:scale-95 disabled:opacity-30 ${
                CHIP_COLORS[val] ?? "bg-gray-500"
              }`}
            >
              {val >= 1000 ? `${val / 1000}K` : val}
            </button>
          ))}
        </div>

        {/* Quick bet buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onBetChange(suggested)}
            className="text-xs px-3 py-1.5 bg-green-700/60 hover:bg-green-600/60 text-green-300 rounded-lg border border-green-700 transition-all"
          >
            Kelly: ${suggested}
          </button>
          <button
            onClick={clearBet}
            className="text-xs px-3 py-1.5 bg-red-900/40 hover:bg-red-800/40 text-red-300 rounded-lg border border-red-800 transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Deal button */}
      <div className="px-4 pb-4">
        <button
          onClick={onDeal}
          disabled={!betReady}
          className="w-full py-4 bg-[#c9a84c] hover:bg-[#e0c06a] disabled:opacity-40 text-black font-bold text-lg tracking-widest uppercase rounded-xl transition-all active:scale-95"
        >
          Deal
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">
          Stack: ${state.stack.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
