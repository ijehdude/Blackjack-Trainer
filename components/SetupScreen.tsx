"use client";

import { useState } from "react";
import { GameSettings } from "@/lib/types";

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
}

const DECK_OPTIONS = [1, 2, 4, 6, 8];
const STACK_OPTIONS = [500, 1000, 2500, 5000];

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [numDecks, setNumDecks] = useState(6);
  const [startingStack, setStartingStack] = useState(1000);
  const [customStack, setCustomStack] = useState("1000");
  const [lateSurrender, setLateSurrender] = useState(true);
  const [doubleAfterSplit, setDoubleAfterSplit] = useState(true);

  const effectiveStack = STACK_OPTIONS.includes(startingStack)
    ? startingStack
    : parseInt(customStack, 10) || 1000;

  function handleStart() {
    onStart({
      numDecks,
      startingStack: effectiveStack,
      lateSurrender,
      doubleAfterSplit,
    });
  }

  return (
    <div className="min-h-screen bg-[#0f1f3d] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-5xl">🃏</div>
          <h1 className="text-3xl font-bold tracking-widest text-[#c9a84c] uppercase">
            Blackjack
          </h1>
          <p className="text-gray-400 tracking-widest text-xs uppercase">
            Strategy Trainer
          </p>
        </div>

        {/* Number of Decks */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest">
            Number of Decks
          </label>
          <div className="flex gap-2">
            {DECK_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setNumDecks(d)}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                  numDecks === d
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#1a3260] text-gray-300 hover:bg-[#1e3a72]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Starting Stack */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 uppercase tracking-widest">
            Starting Stack
          </label>
          <div className="flex gap-2 mb-2">
            {STACK_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStartingStack(s);
                  setCustomStack(String(s));
                }}
                className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${
                  startingStack === s
                    ? "bg-[#c9a84c] text-black"
                    : "bg-[#1a3260] text-gray-300 hover:bg-[#1e3a72]"
                }`}
              >
                ${s >= 1000 ? `${s / 1000}K` : s}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={customStack}
            onChange={(e) => {
              setCustomStack(e.target.value);
              setStartingStack(parseInt(e.target.value, 10) || 0);
            }}
            className="w-full bg-[#1a3260] text-white border border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c]"
            placeholder="Custom amount"
            min={100}
          />
        </div>

        {/* Rules Toggles */}
        <div className="space-y-2">
          <Toggle
            label="Late Surrender Allowed"
            value={lateSurrender}
            onChange={setLateSurrender}
          />
          <Toggle
            label="Double After Split (DAS)"
            value={doubleAfterSplit}
            onChange={setDoubleAfterSplit}
          />
        </div>

        {/* Game Rules Info */}
        <div className="bg-[#1a3260] rounded-lg p-3 space-y-1 text-xs text-gray-400">
          <div>Blackjack pays 3:2</div>
          <div>Dealer stands on soft 17</div>
          <div>Insurance pays 2:1</div>
        </div>

        {/* Deal Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-[#c9a84c] hover:bg-[#e0c06a] text-black font-bold text-lg tracking-widest uppercase rounded-xl transition-all active:scale-95"
        >
          Deal Me In
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between bg-[#1a3260] rounded-lg px-4 py-3 cursor-pointer"
      onClick={() => onChange(!value)}
    >
      <span className="text-sm text-gray-200 uppercase tracking-wider">{label}</span>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          value ? "bg-[#c9a84c]" : "bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </div>
  );
}
