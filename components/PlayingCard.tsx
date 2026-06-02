"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/lib/types";

interface PlayingCardProps {
  card: Card;
  small?: boolean;
  dealIndex?: number;
}

const RED_SUITS = ["♥", "♦"];

export default function PlayingCard({ card, small, dealIndex = 0 }: PlayingCardProps) {
  const isRed = RED_SUITS.includes(card.suit);
  const color = isRed ? "#dc2626" : "#111827";
  const w = small ? "w-14 h-20" : "w-16 h-24";

  const [isFlipping, setIsFlipping] = useState(false);
  const prevFaceDown = useRef(card.faceDown);

  useEffect(() => {
    if (prevFaceDown.current === true && card.faceDown === false) {
      setIsFlipping(true);
      const t = setTimeout(() => setIsFlipping(false), 400);
      prevFaceDown.current = false;
      return () => clearTimeout(t);
    }
    prevFaceDown.current = card.faceDown;
  }, [card.faceDown]);

  const animClass = isFlipping ? "card-flip" : "card-deal";
  const delayStyle = isFlipping ? {} : { animationDelay: `${dealIndex * 150}ms` };

  // Single outer div — never unmounts when faceDown changes, preventing the
  // spurious card-deal re-trigger that caused the hole card to flash on reveal.
  return (
    <div
      className={`${w} rounded-xl flex-shrink-0 relative select-none ${animClass}`}
      style={{
        ...delayStyle,
        ...(card.faceDown
          ? {
              background: "linear-gradient(145deg, #1e40af, #1e3a8a 50%, #172669)",
              border: "1.5px solid rgba(96,165,250,0.2)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
              overflow: "hidden",
            }
          : {
              background: "linear-gradient(160deg, #ffffff 0%, #f5f5f5 100%)",
              border: "1.5px solid rgba(0,0,0,0.1)",
              boxShadow: "0 5px 15px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.2)",
            }),
      }}
    >
      {card.faceDown ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)",
          }}
        />
      ) : (
        <>
          <div className="absolute top-1 left-1.5 leading-none" style={{ color }}>
            <div className="font-bold text-sm leading-none">{card.rank}</div>
            <div className="text-xs leading-none">{card.suit}</div>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center text-2xl"
            style={{ color }}
          >
            {card.suit}
          </div>
          <div className="absolute bottom-1 right-1.5 leading-none rotate-180" style={{ color }}>
            <div className="font-bold text-sm leading-none">{card.rank}</div>
            <div className="text-xs leading-none">{card.suit}</div>
          </div>
        </>
      )}
    </div>
  );
}
