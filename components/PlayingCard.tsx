"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

  // "card-deal" on mount, "card-flip" on hole-card reveal, "" after animations finish
  const [animClass, setAnimClass] = useState("card-deal");
  const prevFaceDown = useRef(card.faceDown);

  // useLayoutEffect fires synchronously after DOM mutation and BEFORE the browser
  // paints, so by the time the user sees anything the class is already "card-flip"
  // instead of "card-deal". Using useEffect here would leave one painted frame with
  // the wrong class, causing the visible flash/disappear-reappear the user sees.
  useLayoutEffect(() => {
    if (prevFaceDown.current === true && card.faceDown === false) {
      setAnimClass("card-flip");
      prevFaceDown.current = false;
      const t = setTimeout(() => setAnimClass(""), 400);
      return () => clearTimeout(t);
    }
    prevFaceDown.current = card.faceDown;
  }, [card.faceDown]);

  return (
    <div
      className={`${w} rounded-xl flex-shrink-0 relative select-none ${animClass}`}
      style={{
        // Stagger delay only applies to the initial deal slide-in, not the flip
        animationDelay: animClass === "card-deal" ? `${dealIndex * 150}ms` : "0ms",
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
