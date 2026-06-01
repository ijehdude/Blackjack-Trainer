"use client";

import { useState } from "react";
import { GameState } from "@/lib/types";
import { trueCount } from "@/lib/shoe";
import { kellyBet } from "@/lib/strategy";

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

function PokerChipSvg({ value, size = 52 }: { value: number; size?: number }) {
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
      {/* Drop shadow */}
      <ellipse
        cx={c}
        cy={c + size * 0.07}
        rx={outerR * 0.88}
        ry={outerR * 0.2}
        fill="rgba(0,0,0,0.35)"
      />
      {/* Chip body */}
      <circle cx={c} cy={c} r={outerR} fill={bg} />
      {/* Highlight rim */}
      <circle cx={c} cy={c} r={outerR} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {/* 8 edge notches */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect
          key={angle}
          x={c - notchW / 2}
          y={c - notchCenterR - notchH / 2}
          width={notchW}
          height={notchH}
          rx={notchW / 2}
          fill="white"
          fillOpacity={0.55}
          transform={`rotate(${angle} ${c} ${c})`}
        />
      ))}
      {/* Inner circle */}
      <circle cx={c} cy={c} r={innerR} fill={edge} />
      <circle cx={c} cy={c} r={innerR} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Denomination */}
      <text
        x={c}
        y={c + fontSize * 0.38}
        textAnchor="middle"
        fill={text}
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        letterSpacing="-0.5"
      >
        {label}
      </text>
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

const MAX_STACK = 8;

function ChipStack({ amount }: { amount: number }) {
  if (amount <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-20">
        <div className="text-gray-500 text-sm tracking-widest uppercase text-xs">No bet</div>
      </div>
    );
  }

  const allChips = breakdownToDenominations(amount);
  const visibleChips = allChips.slice(0, MAX_STACK);
  const chipSize = 44;
  const stackStep = 7;
  const containerH = chipSize + (visibleChips.length - 1) * stackStep;

  return (
    <div className="flex flex-col items-center">
      {/* Stack */}
      <div className="relative" style={{ height: containerH, width: chipSize }}>
        {visibleChips.map((chip, i) => (
          <div
            key={i}
            className="absolute left-0"
            style={{ bottom: i * stackStep }}
          >
            <PokerChipSvg value={chip} size={chipSize} />
          </div>
        ))}
      </div>
      {allChips.length > MAX_STACK && (
        <div className="text-[10px] text-gray-500 mt-0.5">+{allChips.length - MAX_STACK} more</div>
      )}
      <div className="text-[#c9a84c] text-xl font-bold mt-2">
        ${amount.toLocaleString()}
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

      {/* Seat + betting controls */}
      <div className="px-4">
        <div className="border border-[#1a5c38] rounded-xl p-4 bg-[#1a5c38]/20">
          <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-widest mb-3">Seat 1</p>

          {/* Chip stack display */}
          <div className="flex justify-center mb-4">
            <ChipStack amount={state.currentBet} />
          </div>

          {/* Chip buttons */}
          <div className="flex items-center gap-1.5 justify-center flex-wrap mb-3">
            {CHIP_VALUES.map((val) => (
              <button
                key={val}
                onClick={() => addChip(val)}
                disabled={val > state.stack}
                className="chip transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
              >
                <PokerChipSvg value={val} size={52} />
              </button>
            ))}
          </div>

          {/* Repeat last bet toggle */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={handleRepeatToggle}
          >
            <span className="text-xs text-gray-300 uppercase tracking-widest">Repeat Last Bet</span>
            <div className={`relative w-10 h-5 rounded-full transition-colors ${repeatLast ? "bg-[#c9a84c]" : "bg-gray-600"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${repeatLast ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>

          {/* Clear + Kelly */}
          <div className="flex gap-2 mt-3">
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
