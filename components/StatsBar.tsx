"use client";

import { GameState } from "@/lib/types";
import { trueCount } from "@/lib/shoe";

interface StatsBarProps {
  state: GameState;
  onHome: () => void;
  showCount: boolean;
  onToggleCount: () => void;
}

export default function StatsBar({ state, onHome, showCount, onToggleCount }: StatsBarProps) {
  const { stats, runningCount, shoe, settings } = state;
  const tc = trueCount(runningCount, shoe);
  const totalCards = settings.numDecks * 52;
  const shoeRemaining = (shoe.length / totalCards) * 100;
  const pct = stats.handsPlayed > 0
    ? Math.round((stats.handsCorrect / stats.handsPlayed) * 100)
    : 0;

  const pnlPositive = stats.pnl >= 0;
  const tcDisplay = tc >= 0 ? `+${tc.toFixed(1)}` : tc.toFixed(1);
  const rcDisplay = runningCount >= 0 ? `+${runningCount}` : `${runningCount}`;

  return (
    <div className="bg-[#0d2e1c] border-b border-[#1a5c38]">
      {/* Row 1: HOME | STACK | P&L | CORRECT | SHOE */}
      <div className="flex items-stretch text-xs border-b border-[#1a5c38]/50">
        <button
          onClick={onHome}
          className="flex items-center gap-1 px-3 py-2 bg-[#1a5c38] text-white font-bold text-[11px] uppercase tracking-wider hover:bg-[#1e6b42] transition-colors"
        >
          <span>←</span> HOME
        </button>

        <StatCell label="STACK" value={`$${state.stack.toLocaleString()}`} />

        <StatCell
          label="P&L"
          value={`${pnlPositive ? "+" : ""}$${Math.abs(stats.pnl).toLocaleString()}`}
          valueClass={pnlPositive ? (stats.pnl === 0 ? "text-white" : "text-green-400") : "text-red-400"}
        />

        <StatCell
          label="CORRECT"
          value={`${pct}%`}
          sub={`${stats.handsCorrect}/${stats.handsPlayed}`}
          valueClass="text-[#c9a84c]"
        />

        {/* Shoe bar */}
        <div className="flex flex-col items-center justify-center px-2 py-1 ml-auto border-l border-[#1a5c38]/50">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">SHOE</span>
          <div className="w-16 h-2 bg-[#1a5c38]/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c9a84c] rounded-full transition-all duration-300"
              style={{ width: `${shoeRemaining}%` }}
            />
          </div>
          <span className="text-[9px] text-gray-400 mt-0.5">{shoe.length} left</span>
        </div>
      </div>

      {/* Row 2: COUNT | RC? | ✓ | TC | 💡 | +$ | ↺ */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          onClick={onToggleCount}
          className="flex items-center gap-1 bg-[#1a5c38] text-white text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wide"
        >
          COUNT <span className="text-[10px]">▼</span>
        </button>

        <div className="flex items-center gap-1 bg-[#1a5c38]/60 rounded px-2 py-1">
          <span className="text-[10px] text-gray-400">RC?</span>
          {showCount && (
            <span className={`text-[11px] font-bold ${runningCount > 0 ? "text-green-400" : runningCount < 0 ? "text-red-400" : "text-white"}`}>
              {rcDisplay}
            </span>
          )}
        </div>

        <div className="w-5 h-5 bg-[#c9a84c] rounded flex items-center justify-center">
          <span className="text-black text-[10px] font-bold">✓</span>
        </div>

        <div className="flex items-center gap-1 bg-[#1a5c38]/60 rounded px-2 py-1">
          <span className="text-[10px] text-gray-400">TC</span>
          <span className={`text-[11px] font-bold ${tc > 1 ? "text-green-400" : tc < -1 ? "text-red-400" : "text-white"}`}>
            {tcDisplay}
          </span>
        </div>

        <button className="flex items-center gap-1 bg-[#1a5c38] rounded px-2 py-1">
          <span className="text-[10px]">💡</span>
          <span className="text-[10px] font-bold text-white">ON</span>
        </button>

        <button className="w-7 h-7 bg-[#1a5c38] rounded flex items-center justify-center text-[#c9a84c] font-bold text-xs">
          +$
        </button>

        <button className="w-7 h-7 bg-[#c84c4c] rounded flex items-center justify-center text-white text-xs">
          ↺
        </button>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-1 border-l border-[#1a5c38]/50">
      <span className="text-[9px] text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold leading-tight ${valueClass}`}>{value}</span>
      {sub && <span className="text-[9px] text-gray-500">{sub}</span>}
    </div>
  );
}
