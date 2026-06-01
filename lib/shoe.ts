import { Card, Rank, Suit } from "./types";

const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS: Suit[] = ["♠","♥","♦","♣"];

export function buildShoe(numDecks: number): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ rank, suit });
      }
    }
  }
  return shuffle(cards);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function hiLoCount(rank: Rank): number {
  const val = cardValue(rank);
  if (val >= 10) return -1;
  if (val <= 6) return 1;
  return 0;
}

export function handValue(cards: Card[]): { value: number; soft: boolean } {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.faceDown) continue;
    if (card.rank === "A") {
      aces++;
      total += 11;
    } else {
      total += cardValue(card.rank);
    }
  }

  let soft = aces > 0;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
    if (aces === 0) soft = false;
  }

  return { value: total, soft };
}

export function trueCount(rc: number, shoe: Card[]): number {
  const decksRemaining = shoe.length / 52;
  if (decksRemaining < 0.5) return rc;
  return rc / decksRemaining;
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const ranks = cards.map((c) => c.rank);
  return (
    (ranks[0] === "A" && ["10","J","Q","K"].includes(ranks[1])) ||
    (ranks[1] === "A" && ["10","J","Q","K"].includes(ranks[0]))
  );
}
