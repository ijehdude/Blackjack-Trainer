"use client";

import { useRouter } from "next/navigation";

function MiniCard({ rank, suit }: { rank: string; suit: string }) {
  const red = suit === "♥" || suit === "♦";
  return (
    <div
      className="w-9 h-11 rounded-lg bg-white flex flex-col items-center justify-center flex-shrink-0"
      style={{
        border: "1.5px solid rgba(0,0,0,0.1)",
        boxShadow: "0 3px 6px rgba(0,0,0,0.35)",
        color: red ? "#dc2626" : "#111",
      }}
    >
      <span className="text-[12px] font-bold leading-none">{rank}</span>
      <span className="text-[11px] leading-none mt-0.5">{suit}</span>
    </div>
  );
}

function HandExample({
  playerCards,
  dealerCard,
  action,
  note,
  color,
}: {
  playerCards: { rank: string; suit: string }[];
  dealerCard: { rank: string; suit: string };
  action: string;
  note: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
      <div className="flex gap-1">
        {playerCards.map((c, i) => (
          <MiniCard key={i} rank={c.rank} suit={c.suit} />
        ))}
      </div>
      <span className="text-gray-500 text-xs">vs</span>
      <MiniCard rank={dealerCard.rank} suit={dealerCard.suit} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold" style={{ color }}>
          → {action}
        </span>
        {note && (
          <span className="text-[10px] text-gray-500 ml-1.5">{note}</span>
        )}
      </div>
    </div>
  );
}

const SECTIONS = [
  {
    action: "Hit",
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
      {
        playerCards: [{ rank: "8", suit: "♣" }, { rank: "4", suit: "♦" }],
        dealerCard: { rank: "7", suit: "♠" },
        action: "Hit",
        note: "12 vs strong dealer",
      },
      {
        playerCards: [{ rank: "9", suit: "♠" }, { rank: "6", suit: "♣" }],
        dealerCard: { rank: "K", suit: "♥" },
        action: "Hit",
        note: "15 vs 10",
      },
    ],
    warning: "Never hit hard 17 or higher.",
  },
  {
    action: "Stand",
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
      {
        playerCards: [{ rank: "9", suit: "♠" }, { rank: "8", suit: "♦" }],
        dealerCard: { rank: "K", suit: "♣" },
        action: "Stand",
        note: "hard 17",
      },
      {
        playerCards: [{ rank: "T", suit: "♥" }, { rank: "6", suit: "♣" }],
        dealerCard: { rank: "6", suit: "♦" },
        action: "Stand",
        note: "16 vs dealer bust zone",
      },
    ],
    warning: "Standing on 16 vs a dealer 7+ feels scary — but it's still better than hitting most of the time.",
  },
  {
    action: "Double",
    color: "#c084fc",
    border: "rgba(192,132,252,0.3)",
    bg: "rgba(192,132,252,0.07)",
    tagline: "Double your bet and take exactly one more card",
    rules: [
      "Always double on 11 (except vs dealer Ace)",
      "Double on 10 unless dealer shows 10 or Ace",
      "Double on 9 when dealer shows 3, 4, 5, or 6",
      "Double soft 16–18 (Ace + 5, 6, or 7) vs dealer's weak cards",
    ],
    examples: [
      {
        playerCards: [{ rank: "6", suit: "♣" }, { rank: "5", suit: "♦" }],
        dealerCard: { rank: "6", suit: "♠" },
        action: "Double",
        note: "11 vs weak dealer",
      },
      {
        playerCards: [{ rank: "A", suit: "♠" }, { rank: "6", suit: "♥" }],
        dealerCard: { rank: "5", suit: "♣" },
        action: "Double",
        note: "soft 17 vs 5",
      },
    ],
    warning: "Only double when you're likely to win — a bad card costs you 2× your bet.",
  },
  {
    action: "Split",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.3)",
    bg: "rgba(251,191,36,0.07)",
    tagline: "Split a pair into two separate hands with equal bets",
    rules: [
      "Always split Aces — each hand starts with 11",
      "Always split 8s — 16 is the worst hand in blackjack",
      "Never split 10s — you already have 20, don't break it",
      "Never split 5s — treat as 10 and double or hit",
      "Split 2s, 3s, 7s against dealer's 2–7",
      "Split 9s against dealer's 2–6 and 8–9",
    ],
    examples: [
      {
        playerCards: [{ rank: "A", suit: "♠" }, { rank: "A", suit: "♥" }],
        dealerCard: { rank: "8", suit: "♣" },
        action: "Always Split",
        note: "",
      },
      {
        playerCards: [{ rank: "8", suit: "♦" }, { rank: "8", suit: "♣" }],
        dealerCard: { rank: "9", suit: "♠" },
        action: "Always Split",
        note: "16 is terrible, two 8s are better",
      },
    ],
    warning: "Never split 10s or face cards — 20 is almost unbeatable.",
  },
  {
    action: "Surrender",
    color: "#f87171",
    border: "rgba(248,113,113,0.3)",
    bg: "rgba(248,113,113,0.07)",
    tagline: "Fold early and recover half your bet",
    rules: [
      "Surrender hard 16 vs dealer's 9, 10, or Ace",
      "Surrender hard 15 vs dealer's 10",
      "Only available on your first two cards (late surrender)",
      "If surrender isn't offered, hit 16 vs 9–Ace instead of standing",
    ],
    examples: [
      {
        playerCards: [{ rank: "T", suit: "♣" }, { rank: "6", suit: "♠" }],
        dealerCard: { rank: "A", suit: "♦" },
        action: "Surrender",
        note: "16 vs Ace",
      },
      {
        playerCards: [{ rank: "9", suit: "♦" }, { rank: "6", suit: "♣" }],
        dealerCard: { rank: "T", suit: "♠" },
        action: "Surrender",
        note: "15 vs 10",
      },
    ],
    warning: "Surrendering feels like giving up, but it saves money in the long run when your odds are very low.",
  },
];

export default function GuidePage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #1e6640 0%, #155c35 35%, #0d3520 70%, #081f14 100%)",
      }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
        >
          <span className="text-lg">←</span>
          <span className="text-sm uppercase tracking-widest">Back</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-sm font-bold uppercase tracking-widest text-[#c9a84c]">
            Strategy Guide
          </h1>
        </div>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          These rules cover basic strategy — the mathematically optimal play for every situation.
          The trainer will tell you when you deviate.
        </p>

        {SECTIONS.map((s) => (
          <div
            key={s.action}
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${s.border}`, background: s.bg }}
          >
            {/* Action header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className="text-xl font-black uppercase tracking-widest"
                  style={{ color: s.color }}
                >
                  {s.action}
                </span>
                <span className="text-xs text-gray-400">{s.tagline}</span>
              </div>
            </div>

            {/* Rules */}
            <div className="px-4 pb-3 space-y-1.5">
              {s.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] mt-0.5 flex-shrink-0" style={{ color: s.color }}>
                    ●
                  </span>
                  <span className="text-xs text-gray-300 leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>

            {/* Examples */}
            <div
              className="px-4 pt-3 pb-3"
              style={{ borderTop: `1px solid ${s.border}`, background: "rgba(0,0,0,0.15)" }}
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Examples</p>
              {s.examples.map((ex, i) => (
                <HandExample key={i} {...ex} color={s.color} />
              ))}
            </div>

            {/* Warning / tip */}
            <div
              className="px-4 py-2.5"
              style={{ borderTop: `1px solid ${s.border}` }}
            >
              <p className="text-[11px] text-gray-400 italic leading-relaxed">{s.warning}</p>
            </div>
          </div>
        ))}

        <p className="text-[10px] text-gray-600 text-center pb-4">
          Basic strategy assumes a standard 6-deck game with dealer standing on soft 17.
        </p>
      </div>
    </div>
  );
}
