"use client";

import { Card } from "@/lib/types";

interface PlayingCardProps {
  card: Card;
  small?: boolean;
}

const RED_SUITS = ["♥", "♦"];

export default function PlayingCard({ card, small }: PlayingCardProps) {
  const isRed = RED_SUITS.includes(card.suit);
  const size = small ? "w-12 h-16 text-sm" : "w-16 h-24 text-base";

  if (card.faceDown) {
    return (
      <div
        className={`${size} rounded-lg border border-gray-600 bg-[#1e3a8a] flex items-center justify-center card-deal shadow-md`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #1e3a8a, #1e3a8a 5px, #1a3272 5px, #1a3272 10px)",
        }}
      />
    );
  }

  return (
    <div
      className={`${size} rounded-lg border border-gray-300 bg-white flex flex-col items-start justify-between p-1 card-deal shadow-md select-none`}
    >
      <div className={`font-bold leading-none ${isRed ? "text-red-600" : "text-gray-900"}`}>
        <div className="text-xs leading-none">{card.rank}</div>
        <div className="text-xs leading-none">{card.suit}</div>
      </div>
      <div
        className={`text-xl font-bold self-center ${isRed ? "text-red-600" : "text-gray-900"}`}
      >
        {card.suit}
      </div>
      <div
        className={`font-bold leading-none self-end rotate-180 ${
          isRed ? "text-red-600" : "text-gray-900"
        }`}
      >
        <div className="text-xs leading-none">{card.rank}</div>
        <div className="text-xs leading-none">{card.suit}</div>
      </div>
    </div>
  );
}
