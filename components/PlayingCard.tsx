"use client";

import { Card } from "@/lib/types";

interface PlayingCardProps {
  card: Card;
  small?: boolean;
}

const RED_SUITS = ["♥", "♦"];

export default function PlayingCard({ card, small }: PlayingCardProps) {
  const isRed = RED_SUITS.includes(card.suit);
  const w = small ? "w-14 h-20" : "w-16 h-24";

  if (card.faceDown) {
    return (
      <div
        className={`${w} rounded-lg border border-gray-600 shadow-md card-deal flex-shrink-0`}
        style={{
          background: "repeating-linear-gradient(135deg,#1e3a8a 0px,#1e3a8a 6px,#1a3272 6px,#1a3272 12px)",
        }}
      />
    );
  }

  const color = isRed ? "#dc2626" : "#111827";

  return (
    <div
      className={`${w} rounded-lg bg-white shadow-md card-deal flex-shrink-0 relative select-none border border-gray-200`}
    >
      {/* Top-left rank + suit */}
      <div className="absolute top-1 left-1.5 leading-none" style={{ color }}>
        <div className="font-bold text-sm leading-none">{card.rank}</div>
        <div className="text-xs leading-none">{card.suit}</div>
      </div>

      {/* Center suit */}
      <div
        className="absolute inset-0 flex items-center justify-center text-2xl"
        style={{ color }}
      >
        {card.suit}
      </div>

      {/* Bottom-right rank + suit (rotated) */}
      <div
        className="absolute bottom-1 right-1.5 leading-none rotate-180"
        style={{ color }}
      >
        <div className="font-bold text-sm leading-none">{card.rank}</div>
        <div className="text-xs leading-none">{card.suit}</div>
      </div>
    </div>
  );
}
