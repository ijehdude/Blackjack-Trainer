"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function MiniCard({ rank, suit }: { rank: string; suit: string }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div
      className="w-8 h-10 rounded-md bg-white flex flex-col items-center justify-center flex-shrink-0"
      style={{ border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 2px 5px rgba(0,0,0,0.35)", color: red ? "#dc2626" : "#111" }}
    >
      <span className="text-[11px] font-bold leading-none">{rank}</span>
      <span className="text-[11px] leading-none mt-0.5">{suit}</span>
    </div>
  );
}

function HandExample({ playerCards, dealerCard, action, note, color }: {
  playerCards: { rank: string; suit: string }[];
  dealerCard: { rank: string; suit: string };
  action: string;
  note: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      <div className="flex gap-1">
        {playerCards.map((c, i) => <MiniCard key={i} rank={c.rank} suit={c.suit} />)}
      </div>
      <span className="text-gray-600 text-xs">vs</span>
      <MiniCard rank={dealerCard.rank} suit={dealerCard.suit} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold" style={{ color }}>→ {action}</span>
        {note && <span className="text-[10px] text-gray-500 ml-1.5">{note}</span>}
      </div>
    </div>
  );
}

const COUNT_TAB = {
  label: "Count",
  color: "#a78bfa",
  border: "rgba(167,139,250,0.3)",
  bg: "rgba(167,139,250,0.07)",
  tagline: "Track card values to gain an edge over the house",
  rules: [
    "Cards 2–6 dealt → RC +1 each (low cards help the dealer)",
    "Cards 7–9 → RC unchanged (neutral)",
    "Cards 10, J, Q, K, Ace → RC −1 each (high cards help you)",
    "True Count (TC) = Running Count ÷ Decks remaining in shoe",
  ],
  cardGroups: [
    { cards: "2  3  4  5  6", value: "+1", label: "Low", color: "#f87171" },
    { cards: "7  8  9",       value: " 0", label: "Neutral", color: "#9ca3af" },
    { cards: "10  J  Q  K  A", value: "−1", label: "High", color: "#4ade80" },
  ],
  betting: [
    { tc: "≤ 0",    action: "Minimum bet", color: "#f87171" },
    { tc: "+1",     action: "Minimum bet", color: "#fbbf24" },
    { tc: "+2",     action: "Raise bet 2×", color: "#86efac" },
    { tc: "+3",     action: "Raise bet 3–4×", color: "#4ade80" },
    { tc: "+4 or more", action: "Max bet", color: "#22d3ee" },
  ],
  warning: "Your RC and TC appear in the top bar during play. Practice keeping count and adjusting bets accordingly.",
};

const TABS = [
  {
    label: "Hit",
    color: "#22d3ee",
    border: "rgba(34,211,238,0.3)",
    bg: "rgba(34,211,238,0.07)",
    tagline: "Draw another card to improve your total",
    rules: [
      "Always hit on 8 or less",
      "Hit 12–16 when dealer shows 7, 8, 9, 10, or Ace",
      "Hit soft 17 or lower (e.g. Ace + 6)",
    ],
    examples: [
      { playerCards: [{ rank: "8", suit: "♣" }, { rank: "4", suit: "♦" }], dealerCard: { rank: "7", suit: "♠" }, action: "Hit", note: "12 vs strong dealer" },
      { playerCards: [{ rank: "9", suit: "♠" }, { rank: "6", suit: "♣" }], dealerCard: { rank: "K", suit: "♥" }, action: "Hit", note: "15 vs 10" },
    ],
    warning: "Never hit hard 17 or higher.",
  },
  {
    label: "Stand",
    color: "#4ade80",
    border: "rgba(74,222,128,0.3)",
    bg: "rgba(74,222,128,0.07)",
    tagline: "Keep your hand and let the dealer play",
    rules: [
      "Always stand on hard 17 or higher",
      "Stand on 12–16 when dealer shows 2 through 6 — they often bust",
      "Stand on soft 19 or 20 (Ace + 8 or 9)",
    ],
    examples: [
      { playerCards: [{ rank: "9", suit: "♠" }, { rank: "8", suit: "♦" }], dealerCard: { rank: "K", suit: "♣" }, action: "Stand", note: "hard 17" },
      { playerCards: [{ rank: "T", suit: "♥" }, { rank: "6", suit: "♣" }], dealerCard: { rank: "6", suit: "♦" }, action: "Stand", note: "16 vs bust zone" },
    ],
    warning: "16 vs 7+ feels scary — but standing is often better than busting.",
  },
  {
    label: "Dbl",
    color: "#c084fc",
    border: "rgba(192,132,252,0.3)",
    bg: "rgba(192,132,252,0.07)",
    tagline: "Double your bet and take exactly one more card",
    rules: [
      "Always double on 11 (except vs dealer Ace)",
      "Double on 10 unless dealer shows 10 or Ace",
      "Double on 9 vs dealer 3–6",
      "Double soft 16–18 vs dealer's weak cards",
    ],
    examples: [
      { playerCards: [{ rank: "6", suit: "♣" }, { rank: "5", suit: "♦" }], dealerCard: { rank: "6", suit: "♠" }, action: "Double", note: "11 vs weak dealer" },
      { playerCards: [{ rank: "A", suit: "♠" }, { rank: "6", suit: "♥" }], dealerCard: { rank: "5", suit: "♣" }, action: "Double", note: "soft 17 vs 5" },
    ],
    warning: "One bad card costs you 2× — only double when you have the edge.",
  },
  {
    label: "Split",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
    bg: "rgba(251,191,36,0.07)",
    tagline: "Split a pair into two hands with equal bets",
    rules: [
      "Always split Aces and 8s",
      "Never split 10s — you already have 20",
      "Never split 5s — treat as 10 and double or hit",
      "Split 2s, 3s, 7s vs dealer 2–7",
    ],
    examples: [
      { playerCards: [{ rank: "A", suit: "♠" }, { rank: "A", suit: "♥" }], dealerCard: { rank: "8", suit: "♣" }, action: "Always Split", note: "" },
      { playerCards: [{ rank: "8", suit: "♦" }, { rank: "8", suit: "♣" }], dealerCard: { rank: "9", suit: "♠" }, action: "Always Split", note: "16 is the worst hand" },
    ],
    warning: "Never split 10s — 20 is almost unbeatable.",
  },
  {
    label: "Surr.",
    color: "#f87171",
    border: "rgba(248,113,113,0.3)",
    bg: "rgba(248,113,113,0.07)",
    tagline: "Fold early and recover half your bet",
    rules: [
      "Surrender hard 16 vs dealer 9, 10, or Ace",
      "Surrender hard 15 vs dealer 10",
      "Only on your first two cards (late surrender)",
    ],
    examples: [
      { playerCards: [{ rank: "T", suit: "♣" }, { rank: "6", suit: "♠" }], dealerCard: { rank: "A", suit: "♦" }, action: "Surrender", note: "16 vs Ace" },
      { playerCards: [{ rank: "9", suit: "♦" }, { rank: "6", suit: "♣" }], dealerCard: { rank: "T", suit: "♠" }, action: "Surrender", note: "15 vs 10" },
    ],
    warning: "If surrender isn't available, hit 16 vs 9–Ace instead of standing.",
  },
];

const ALL_TABS = [...TABS.map(t => ({ label: t.label, color: t.color })), { label: COUNT_TAB.label, color: COUNT_TAB.color }];

export default function GuidePage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const isCount = active === TABS.length;
  const tab = isCount ? null : TABS[active];

  return (
    <div
      className="h-screen overflow-hidden flex flex-col max-w-md mx-auto"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #1e6640 0%, #155c35 35%, #0d3520 70%, #081f14 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center px-4 pt-3 pb-2 border-b border-white/10">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
          <span className="text-base">←</span>
          <span className="text-xs uppercase tracking-widest">Back</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#c9a84c]">Strategy Guide</h1>
        </div>
        <div className="w-14" />
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/10">
        {ALL_TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
            style={{
              color: active === i ? t.color : "#6b7280",
              borderBottom: active === i ? `2px solid ${t.color}` : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 pt-4 pb-4">
        {isCount ? (
          /* ── Running Count tab ── */
          <>
            <div className="mb-3">
              <span className="text-2xl font-black uppercase tracking-widest" style={{ color: COUNT_TAB.color }}>
                Running Count
              </span>
              <p className="text-xs text-gray-400 mt-0.5">{COUNT_TAB.tagline}</p>
            </div>

            {/* Card value chart */}
            <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: COUNT_TAB.bg, border: `1px solid ${COUNT_TAB.border}` }}>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Hi-Lo card values</p>
              <div className="space-y-2">
                {COUNT_TAB.cardGroups.map((g) => (
                  <div key={g.label} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 text-right flex-shrink-0" style={{ color: g.color }}>{g.value}</span>
                    <span className="text-xs font-mono text-gray-200 flex-1">{g.cards}</span>
                    <span className="text-[10px] text-gray-500">{g.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TC Bet sizing */}
            <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${COUNT_TAB.border}` }}>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Bet sizing by True Count (TC)</p>
              <div className="space-y-1.5">
                {COUNT_TAB.betting.map((b) => (
                  <div key={b.tc} className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono w-14 flex-shrink-0" style={{ color: b.color }}>TC {b.tc}</span>
                    <span className="text-xs text-gray-300">{b.action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 px-1">
              <span className="text-sm flex-shrink-0">💡</span>
              <p className="text-[11px] text-gray-400 leading-relaxed">{COUNT_TAB.warning}</p>
            </div>
          </>
        ) : tab ? (
          /* ── Strategy tabs ── */
          <>
            <div className="mb-3">
              <span className="text-2xl font-black uppercase tracking-widest" style={{ color: tab.color }}>
                {tab.label === "Surr." ? "Surrender" : tab.label === "Dbl" ? "Double" : tab.label}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">{tab.tagline}</p>
            </div>

            <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: tab.bg, border: `1px solid ${tab.border}` }}>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">
                When to {tab.label === "Surr." ? "surrender" : tab.label === "Dbl" ? "double" : tab.label.toLowerCase()}
              </p>
              <div className="space-y-1.5">
                {tab.rules.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[9px] mt-0.5 flex-shrink-0" style={{ color: tab.color }}>●</span>
                    <span className="text-xs text-gray-200 leading-snug">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${tab.border}` }}>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Examples</p>
              {tab.examples.map((ex, i) => (
                <HandExample key={i} {...ex} color={tab.color} />
              ))}
            </div>

            <div className="flex items-start gap-2 px-1">
              <span className="text-sm flex-shrink-0">💡</span>
              <p className="text-[11px] text-gray-400 leading-relaxed">{tab.warning}</p>
            </div>
          </>
        ) : null}

        <div className="mt-auto pt-3">
          <p className="text-[9px] text-gray-600 text-center">
            Based on basic strategy for 6-deck, dealer stands soft 17
          </p>
        </div>
      </div>
    </div>
  );
}
