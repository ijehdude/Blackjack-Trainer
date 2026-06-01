"use client";

import { useState } from "react";
import { GameState } from "@/lib/types";
import { trueCount } from "@/lib/shoe";
import { kellyBet } from "@/lib/strategy";

const CHIP_VALUES = [1, 5, 25, 50, 100, 500, 1000];
const CHIP_STYLES: Record<number, string> = {
  1:    "bg-gray-300 text-gray-800 border-gray-400",
  5:    "bg-red-600 text-white border-red-400",
  25:   "bg-green-600 text-white border-green-400",
  50:   "bg-blue-600 text-white border-blue-400",
  100:  "bg-gray-500 text-white border-gray-400",
  500:  "bg-purple-600 text-white border-purple-400",
  1000: "bg-orange-500 text-white border-orange-400",
};

interface BettingScreenProps {
  state: GameState;
  dealerName: string;
  onDeal: () => void;
  onBetChange: (bet: number) => void;
  lastBet: number;
}

export default function BettingScreen({ state, dealerName, onDeal, onBetChange, lastBet }: BettingScreenProps) {
  const [repeatLast, setRepeatLast] = useState(false);
  const tc = trueCount(state.runningCount, state.shoe);
  const suggested = kellyBet(state.stack, tc, 25);

  function addChip(val: number) {
    const newBet = Math.min(state.stack, state.currentBet + val);
    onBetChange(newBet);
  }

  function handleRepeatToggle() {
    const next = !repeatLast;
    setRepeatLast(next);
    if (next && lastBet > 0) {
      onBetChange(Math.min(state.stack, lastBet));
    } else {
      onBetChange(0);
    }
  }

  const betReady = state.currentBet > 0 && state.currentBet <= state.stack;

  return (
    <div className="flex flex-col flex-1">
      {/* Dealer area with rules */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-4">
        <p className="text-gray-400 text-xs uppercase tracking-widest">
          Dealer — <span className="text-white">{dealerName}</span>
        </p>
        <div className="space-y-2 w-full max-w-xs">
          {[
            { icon: "🃏", text: "Blackjack pays 3:2" },
            { icon: "🏛️", text: "Dealer stands on soft 17" },
            { icon: "🛡️", text: "Insurance pays 2:1" },
          ].map((rule) => (
            <div
              key={rule.text}
              className="flex items-center gap-3 bg-[#0d2e1c]/60 rounded-xl px-4 py-3 text-sm text-gray-200"
            >
              <span className="text-lg">{rule.icon}</span>
              {rule.text}
            </div>
          ))}
        </div>
      </div>

      {/* Seat + chips */}
      <div className="px-4">
        <div className="border border-[#1a5c38] rounded-xl p-4 bg-[#1a5c38]/20">
          <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-3">Seat 1</p>

          {/* Chip row */}
          <div className="flex items-center gap-1.5 justify-center flex-wrap">
            {CHIP_VALUES.map((val) => (
              <button
                key={val}
                onClick={() => addChip(val)}
                disabled={val > state.stack}
                className={`chip w-12 h-12 rounded-full font-bold text-[11px] border-2 shadow-lg transition-all active:scale-95 disabled:opacity-30 ${CHIP_STYLES[val]}`}
              >
                {val >= 1000 ? `${val / 1000}K` : val}
              </button>
            ))}
          </div>

          {/* Repeat last bet toggle */}
          <div
            className="flex items-center justify-between mt-4 cursor-pointer"
            onClick={handleRepeatToggle}
          >
            <span className="text-xs text-gray-300 uppercase tracking-widest">Repeat Last Bet</span>
            <div className={`relative w-10 h-5 rounded-full transition-colors ${repeatLast ? "bg-[#c9a84c]" : "bg-gray-600"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${repeatLast ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>

          {/* Bet amount display */}
          <div className="mt-3 bg-[#0d2e1c]/60 rounded-lg px-4 py-2 text-center">
            <span className="text-[#c9a84c] text-lg font-bold">
              {state.currentBet > 0 ? `$${state.currentBet.toLocaleString()}` : "—"}
            </span>
          </div>

          {/* Clear + Kelly row */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onBetChange(0)}
              className="flex-1 text-xs py-1.5 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => onBetChange(Math.min(state.stack, suggested))}
              className="flex-1 text-xs py-1.5 rounded-lg border border-green-700 text-green-400 hover:bg-green-900/30 transition-colors"
            >
              Kelly ${suggested}
            </button>
          </div>
        </div>
      </div>

      {/* Deal button */}
      <div className="px-4 py-4">
        <button
          onClick={onDeal}
          disabled={!betReady}
          className="w-full py-4 bg-[#c9a84c] hover:bg-[#e0c06a] disabled:opacity-40 text-black font-bold text-lg tracking-widest uppercase rounded-xl transition-all active:scale-95"
        >
          Deal
        </button>
      </div>
    </div>
  );
}
