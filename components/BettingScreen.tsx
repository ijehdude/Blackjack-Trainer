"use client";

import { useState } from "react";
import { GameState } from "@/lib/types";

const CHIP_VALUES = [1, 5, 25, 50, 100, 500, 1000];

const CHIP_COLOR: Record<number, { bg: string; edge: string; text: string }> = {
  1:    { bg: "#c8c8c8", edge: "#a0a0a0", text: "#1f2937" },
  5:    { bg: "#dc2626", edge: "#991b1b", text: "#ffffff" },
  25:   { bg: "#16a34a", edge: "#14532d", text: "#ffffff" },
  50:   { bg: "#2563eb", edge: "#1e3a8a", text: "#ffffff" },
  100:  { bg: "#52525b", edge: "#27272a", text: "#ffffff" },
  500:  { bg: "#7c3aed", edge: "#4c1d95", text: "#ffffff" },
  1000: { bg: "#ea580c", edge: "#9a3412", text: "#ffffff" },
};

function PokerChipSvg({ value, size = 48 }: { value: number; size?: number }) {
  const { bg, edge, text } = CHIP_COLOR[value];
  const c = size / 2;
  const outerR = size * 0.455;
  const innerR = size * 0.295;
  const notchCenterR = size * 0.375;
  const notchW = size * 0.115;
  const notchH = size * 0.13;
  const fontSize = size * 0.195;
  const label = value >= 1000 ? `${value / 1000}K` : String(value);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <ellipse cx={c + size * 0.04} cy={c + size * 0.1} rx={outerR * 0.82} ry={outerR * 0.16} fill="rgba(0,0,0,0.5)" />
      <circle cx={c} cy={c} r={outerR} fill={bg} />
      <circle cx={c} cy={c} r={outerR} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect key={angle} x={c - notchW / 2} y={c - notchCenterR - notchH / 2} width={notchW} height={notchH} rx={notchW / 2} fill="white" fillOpacity={0.55} transform={`rotate(${angle} ${c} ${c})`} />
      ))}
      <circle cx={c} cy={c} r={innerR} fill={edge} />
      <circle cx={c} cy={c} r={innerR} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <text x={c} y={c + fontSize * 0.38} textAnchor="middle" fill={text} fontSize={fontSize} fontWeight="bold" fontFamily="Tw Cen MT, system-ui, sans-serif" letterSpacing="-0.5">{label}</text>
      <ellipse cx={c - size * 0.04} cy={c - outerR * 0.38} rx={outerR * 0.58} ry={outerR * 0.2} fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

function breakdownToDenominations(amount: number): number[] {
  const denoms = [1000, 500, 100, 50, 25, 5, 1];
  const chips: number[] = [];
  let remaining = amount;
  for (const d of denoms) {
    const count = Math.floor(remaining / d);
    for (let i = 0; i < count; i++) chips.push(d);
    remaining -= count * d;
  }
  return chips;
}

function ChipStack({ amount }: { amount: number }) {
  const allChips = breakdownToDenominations(amount);
  const visibleChips = allChips.slice(0, 6);
  const chipSize = 40;
  const stackStep = 6;
  // Always reserve the max stack height (6 chips) so adding chips grows the
  // stack upward into fixed space instead of pushing the layout below it down.
  const containerH = chipSize + 5 * stackStep;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-end justify-center" style={{ height: containerH, width: chipSize }}>
        {amount <= 0 ? (
          <div className="text-gray-500 text-xs tracking-widest uppercase whitespace-nowrap">No bet</div>
        ) : (
          visibleChips.map((chip, i) => (
            <div key={i} className="absolute left-0" style={{ bottom: i * stackStep }}>
              <PokerChipSvg value={chip} size={chipSize} />
            </div>
          ))
        )}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5 h-3.5">
        {allChips.length > 6 ? `+${allChips.length - 6} more` : ""}
      </div>
      <div className="text-[#c9a84c] text-lg font-bold mt-1.5 h-7">
        {amount > 0 ? `$${amount.toLocaleString()}` : ""}
      </div>
    </div>
  );
}

interface BettingScreenProps {
  state: GameState;
  dealerName: string;
  onDeal: () => void;
  onBetChange: (bet: number) => void;
  lastBet: number;
}

export default function BettingScreen({ state, dealerName, onDeal, onBetChange, lastBet }: BettingScreenProps) {
  const [repeatLast, setRepeatLast] = useState(false);

  function addChip(val: number) {
    onBetChange(Math.min(state.stack, state.currentBet + val));
  }

  function handleRepeatToggle() {
    const next = !repeatLast;
    setRepeatLast(next);
    onBetChange(next && lastBet > 0 ? Math.min(state.stack, lastBet) : 0);
  }

  const betReady = state.currentBet > 0 && state.currentBet <= state.stack;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Compact dealer header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-2 border-b border-[#1a5c38]/30">
        <p className="text-[11px] text-gray-400 uppercase tracking-widest">
          Dealer — <span className="text-white font-semibold">{dealerName}</span>
        </p>
        <p className="text-[9px] text-gray-600 tracking-wide">BJ 3:2 • S17 • Ins 2:1</p>
      </div>

      {/* Main betting area */}
      <div className="flex-1 flex flex-col justify-between px-4 pt-3 pb-4 overflow-hidden">
        <div>
          <p className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest mb-2">Seat 1</p>

          {/* Chip stack */}
          <div className="flex justify-center mb-3">
            <ChipStack amount={state.currentBet} />
          </div>

          {/* Chip buttons — single row */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {CHIP_VALUES.map((val) => (
              <button
                key={val}
                onClick={() => addChip(val)}
                disabled={val > state.stack}
                className="chip transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
              >
                <PokerChipSvg value={val} size={46} />
              </button>
            ))}
          </div>

          {/* Repeat + Clear row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleRepeatToggle}>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Repeat Last</span>
              <div className={`relative w-9 h-4.5 rounded-full transition-colors flex-shrink-0 ${repeatLast ? "bg-[#c9a84c]" : "bg-gray-600"}`} style={{ height: 18, width: 36 }}>
                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${repeatLast ? "translate-x-4" : "translate-x-0.5"}`} style={{ width: 14, height: 14 }} />
              </div>
            </div>
            <button
              onClick={() => onBetChange(0)}
              className="text-xs px-4 py-1.5 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Deal button */}
        <button
          onClick={onDeal}
          disabled={!betReady}
          className="w-full py-3.5 bg-[#c9a84c] hover:bg-[#e0c06a] disabled:opacity-40 text-black font-bold text-base tracking-widest uppercase rounded-xl transition-all active:scale-95 mt-3"
        >
          Deal
        </button>
      </div>
    </div>
  );
}
