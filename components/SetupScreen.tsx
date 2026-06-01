"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const effectiveStack = STACK_OPTIONS.includes(startingStack)
    ? startingStack
    : parseInt(customStack, 10) || 1000;

  function handleStart() {
    onStart({ numDecks, startingStack: effectiveStack, lateSurrender, doubleAfterSplit });
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0f1f3d] flex flex-col px-5 pt-5 pb-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-3xl mb-0.5">🃏</div>
        <h1 className="text-2xl font-black tracking-widest text-[#c9a84c] uppercase leading-none">
          Blackjack
        </h1>
        <p className="text-gray-400 tracking-widest text-[10px] uppercase mt-0.5">
          Strategy Trainer
        </p>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Number of Decks */}
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1.5">
              Number of Decks
            </label>
            <div className="flex gap-2">
              {DECK_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setNumDecks(d)}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
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
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1.5">
              Starting Stack
            </label>
            <div className="flex gap-2 mb-2">
              {STACK_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStartingStack(s); setCustomStack(String(s)); }}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${
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
              className="w-full bg-[#1a3260] text-white border border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c]"
              placeholder="Custom amount"
              min={100}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-1.5">
            <Toggle label="Late Surrender Allowed" value={lateSurrender} onChange={setLateSurrender} />
            <Toggle label="Double After Split (DAS)" value={doubleAfterSplit} onChange={setDoubleAfterSplit} />
          </div>
        </div>

        {/* Bottom group */}
        <div className="space-y-2.5">
          {/* Strategy Guide button */}
          <button
            onClick={() => router.push("/guide")}
            className="w-full flex items-center justify-between bg-[#1a3260] hover:bg-[#1e3a72] rounded-lg px-4 py-2.5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span>📖</span>
              <span className="text-sm text-gray-200 font-medium">Quick Strategy Guide</span>
            </div>
            <span className="text-gray-400 text-sm">→</span>
          </button>

          {/* Compact rules */}
          <p className="text-center text-[10px] text-gray-500 tracking-wide">
            BJ 3:2 &nbsp;•&nbsp; Dealer Soft 17 &nbsp;•&nbsp; Insurance 2:1
          </p>

          {/* Deal button */}
          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-[#c9a84c] hover:bg-[#e0c06a] text-black font-bold text-base tracking-widest uppercase rounded-xl transition-all active:scale-95"
          >
            Deal Me In
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex items-center justify-between bg-[#1a3260] rounded-lg px-3 py-2.5 cursor-pointer"
      onClick={() => onChange(!value)}
    >
      <span className="text-xs text-gray-200 uppercase tracking-wider">{label}</span>
      <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#c9a84c]" : "bg-gray-600"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </div>
  );
}
