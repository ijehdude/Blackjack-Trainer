"use client";

import { GameState } from "@/lib/types";
import { trueCount } from "@/lib/shoe";

interface StatsBarProps {
  state: GameState;
  onHome: () => void;
}

export default function StatsBar({ state, onHome }: StatsBarProps) {
  const { stats, runningCount, shoe, settings } = state;
  const tc = trueCount(runningCount, shoe);
  const totalCards = settings.numDecks * 52;
  const penetration = ((totalCards - shoe.length) / totalCards) * 100;
  const pct =
    stats.handsPlayed > 0
      ? Math.round((stats.handsCorrect / stats.handsPlayed) * 100)
      : 0;

  const pnlColor =
    stats.pnl > 0 ? "text-green-400" : stats.pnl < 0 ? "text-red-400" : "text-gray-300";

  return (
    <div className="bg-[#0d2e1c] border-b border-green-900/50 px-3 py-2">
      <div className="flex items-center gap-2 text-xs">
        {/* Home */}
        <button
          onClick={onHome}
          className="bg-[#1a5c38] text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#1e6b42] transition-all"
        >
          ← Home
        </button>

        {/* Stack */}
        <div className="flex flex-col items-center">
          <span className="text-gray-500 uppercase text-[10px] leading-none">Stack</span>
          <span className="font-bold text-white">${state.stack.toLocaleString()}</span>
        </div>

        {/* P&L */}
        <div className="flex flex-col items-center">
          <span className="text-gray-500 uppercase text-[10px] leading-none">P&L</span>
          <span className={`font-bold ${pnlColor}`}>
            {stats.pnl >= 0 ? "+" : ""}${stats.pnl.toLocaleString()}
          </span>
        </div>

        {/* Correct % */}
        <div className="flex flex-col items-center">
          <span className="text-gray-500 uppercase text-[10px] leading-none">Correct</span>
          <span className="font-bold text-[#c9a84c]">
            {pct}%{" "}
            <span className="text-gray-500 font-normal">
              {stats.handsCorrect}/{stats.handsPlayed}
            </span>
          </span>
        </div>

        {/* Shoe */}
        <div className="flex flex-col items-center ml-auto">
          <span className="text-gray-500 uppercase text-[10px] leading-none">Shoe</span>
          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c9a84c] rounded-full transition-all"
              style={{ width: `${100 - penetration}%` }}
            />
          </div>
          <span className="text-gray-400 text-[9px]">{shoe.length} left</span>
        </div>
      </div>

      {/* Count row */}
      <div className="flex items-center gap-3 mt-1 text-xs">
        <div className="bg-[#1a5c38] rounded px-2 py-0.5 flex gap-1 items-center">
          <span className="text-gray-400">RC:</span>
          <span className={`font-bold ${runningCount > 0 ? "text-green-400" : runningCount < 0 ? "text-red-400" : "text-white"}`}>
            {runningCount > 0 ? "+" : ""}{runningCount}
          </span>
        </div>
        <div className="bg-[#1a5c38] rounded px-2 py-0.5 flex gap-1 items-center">
          <span className="text-gray-400">TC:</span>
          <span className={`font-bold ${tc > 1 ? "text-green-400" : tc < -1 ? "text-red-400" : "text-white"}`}>
            {tc > 0 ? "+" : ""}{tc.toFixed(1)}
          </span>
        </div>
        {tc >= 2 && (
          <div className="text-green-400 text-[10px] animate-pulse">
            🔥 Player advantage
          </div>
        )}
        {tc <= -2 && (
          <div className="text-red-400 text-[10px]">
            ❄️ House advantage
          </div>
        )}
      </div>
    </div>
  );
}
