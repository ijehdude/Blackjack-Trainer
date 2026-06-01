"use client";

import { useState } from "react";
import { GameSettings } from "@/lib/types";

interface SetupScreenProps {
  onStart: (settings: GameSettings) => void;
}

const DECK_OPTIONS = [1, 2, 4, 6, 8];
const STACK_OPTIONS = [500, 1000, 2500, 5000];

const GUIDE = [
  {
    action: "Hit",
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.07)",
    border: "rgba(34,211,238,0.2)",
    desc: "Draw another card to improve your total.",
    example: "You: 12  vs  Dealer: 7  →  Hit",
    tip: "If your total is below 17 and the dealer shows a strong card (7–Ace), keep hitting.",
  },
  {
    action: "Stand",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.07)",
    border: "rgba(74,222,128,0.2)",
    desc: "Keep your hand and let the dealer play.",
    example: "You: 16  vs  Dealer: 6  →  Stand",
    tip: "When the dealer shows 2–6, they're likely to bust. Stand even on a weak total like 12–16.",
  },
  {
    action: "Double",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.07)",
    border: "rgba(192,132,252,0.2)",
    desc: "Double your bet and receive exactly one more card.",
    example: "You: 11  vs  Dealer: 6  →  Double",
    tip: "Always double on 11. Double on 10 unless the dealer shows 10 or Ace.",
  },
  {
    action: "Split",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.2)",
    desc: "Split a pair into two separate hands, each with its own bet.",
    example: "You: A–A  or  8–8  →  Always Split",
    tip: "Always split Aces and 8s. Never split 10s, 5s, or 4s.",
  },
  {
    action: "Surrender",
    color: "#f87171",
    bg: "rgba(248,113,113,0.07)",
    border: "rgba(248,113,113,0.2)",
    desc: "Fold and recover half your bet when your chances are very low.",
    example: "You: 16  vs  Dealer: A  →  Surrender",
    tip: "Surrender 16 vs 9, 10, or Ace. Surrender 15 vs 10.",
  },
];

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [numDecks, setNumDecks] = useState(6);
  const [startingStack, setStartingStack] = useState(1000);
  const [customStack, setCustomStack] = useState("1000");
  const [lateSurrender, setLateSurrender] = useState(true);
  const [doubleAfterSplit, setDoubleAfterSplit] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [activeGuide, setActiveGuide] = useState<number | null>(null);

  const effectiveStack = STACK_OPTIONS.includes(startingStack)
    ? startingStack
    : parseInt(customStack, 10) || 1000;

  function handleStart() {
    onStart({ numDecks, startingStack: effectiveStack, lateSurrender, doubleAfterSplit });
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
          <Toggle label="Late Surrender Allowed" value={lateSurrender} onChange={setLateSurrender} />
          <Toggle label="Double After Split (DAS)" value={doubleAfterSplit} onChange={setDoubleAfterSplit} />
        </div>

        {/* Quick Strategy Guide */}
        <div>
          <button
            onClick={() => { setShowGuide((v) => !v); setActiveGuide(null); }}
            className="w-full flex items-center justify-between bg-[#1a3260] hover:bg-[#1e3a72] rounded-lg px-4 py-3 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📖</span>
              <span className="text-sm text-gray-200 font-medium">Quick Strategy Guide</span>
            </div>
            <span className="text-gray-400 text-xs">{showGuide ? "▲ Hide" : "▼ Show"}</span>
          </button>

          {showGuide && (
            <div className="mt-2 space-y-2">
              {GUIDE.map((item, i) => (
                <div
                  key={item.action}
                  className="rounded-lg overflow-hidden cursor-pointer transition-all"
                  style={{ border: `1px solid ${item.border}`, background: item.bg }}
                  onClick={() => setActiveGuide(activeGuide === i ? null : i)}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="text-xs font-bold uppercase tracking-widest w-16"
                        style={{ color: item.color }}
                      >
                        {item.action}
                      </span>
                      <span className="text-xs text-gray-300">{item.desc}</span>
                    </div>
                    <span className="text-gray-500 text-xs ml-2 flex-shrink-0">
                      {activeGuide === i ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {activeGuide === i && (
                    <div
                      className="px-3 pb-3 space-y-2 border-t"
                      style={{ borderColor: item.border }}
                    >
                      <div
                        className="mt-2 rounded px-3 py-2 text-xs font-mono tracking-wide"
                        style={{ background: "rgba(0,0,0,0.25)", color: item.color }}
                      >
                        {item.example}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{item.tip}</p>
                    </div>
                  )}
                </div>
              ))}

              <p className="text-[10px] text-gray-500 text-center pt-1">
                Tap any action to see an example. The trainer will correct you in real time.
              </p>
            </div>
          )}
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
      <div className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-[#c9a84c]" : "bg-gray-600"}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </div>
  );
}
