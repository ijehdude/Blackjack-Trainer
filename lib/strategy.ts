import { Card, PlayerAction } from "./types";
import { handValue, cardValue } from "./shoe";

function dealerIdx(rank: string): number {
  if (rank === "A") return 9;
  const v = ["J","Q","K"].includes(rank) ? 10 : parseInt(rank, 10);
  if (v >= 10) return 8;
  return v - 2;
}

const HARD: PlayerAction[][] = [
  Array(10).fill("hit"),
  Array(10).fill("hit"),
  Array(10).fill("hit"),
  Array(10).fill("hit"),
  ["hit","double","double","double","double","hit","hit","hit","hit","hit"],
  ["double","double","double","double","double","double","double","double","hit","hit"],
  ["double","double","double","double","double","double","double","double","double","hit"],
  ["hit","hit","stand","stand","stand","hit","hit","hit","hit","hit"],
  ["stand","stand","stand","stand","stand","hit","hit","hit","hit","hit"],
  ["stand","stand","stand","stand","stand","hit","hit","hit","hit","hit"],
  ["stand","stand","stand","stand","stand","hit","hit","hit","surrender","surrender"],
  ["stand","stand","stand","stand","stand","hit","hit","surrender","surrender","surrender"],
  Array(10).fill("stand"),
  Array(10).fill("stand"),
  Array(10).fill("stand"),
  Array(10).fill("stand"),
  Array(10).fill("stand"),
];

const SOFT: PlayerAction[][] = [
  ["hit","hit","hit","double","double","hit","hit","hit","hit","hit"],
  ["hit","hit","hit","double","double","hit","hit","hit","hit","hit"],
  ["hit","hit","double","double","double","hit","hit","hit","hit","hit"],
  ["hit","hit","double","double","double","hit","hit","hit","hit","hit"],
  ["hit","double","double","double","double","hit","hit","hit","hit","hit"],
  ["double","double","double","double","double","stand","stand","hit","hit","hit"],
  Array(10).fill("stand"),
  Array(10).fill("stand"),
];

const PAIRS: PlayerAction[][] = [
  ["split","split","split","split","split","split","hit","hit","hit","hit"],
  ["split","split","split","split","split","split","hit","hit","hit","hit"],
  ["hit","hit","hit","split","split","hit","hit","hit","hit","hit"],
  ["double","double","double","double","double","double","double","double","hit","hit"],
  ["split","split","split","split","split","hit","hit","hit","hit","hit"],
  ["split","split","split","split","split","split","hit","hit","hit","hit"],
  ["split","split","split","split","split","split","split","split","split","surrender"],
  ["split","split","split","split","split","stand","split","split","stand","stand"],
  Array(10).fill("stand"),
  Array(10).fill("split"),
];

export function getCorrectAction(
  playerCards: Card[],
  dealerUpcard: Card,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean
): PlayerAction {
  const di = dealerIdx(dealerUpcard.rank);
  const { value, soft } = handValue(playerCards);

  if (canSplit && playerCards.length === 2) {
    const v1 = cardValue(playerCards[0].rank);
    const v2 = cardValue(playerCards[1].rank);
    const r1 = playerCards[0].rank;
    const r2 = playerCards[1].rank;
    const isPair = v1 === v2 || (v1 >= 10 && v2 >= 10);
    if (isPair) {
      let pairIdx: number;
      if (r1 === "A" || r2 === "A") pairIdx = 9;
      else if (v1 >= 10) pairIdx = 8;
      else pairIdx = v1 - 2;
      const rec = PAIRS[pairIdx]?.[di] ?? "stand";
      if (rec === "split" && canSplit) return "split";
      if (rec === "surrender" && canSurrender) return "surrender";
      if (rec !== "split") {
        if (rec === "double" && !canDouble) return "hit";
        return rec;
      }
    }
  }

  if (soft && value >= 13 && value <= 20) {
    const idx = value - 13;
    let rec = SOFT[idx]?.[di] ?? "stand";
    if (rec === "double" && !canDouble) rec = "hit";
    if (rec === "surrender" && !canSurrender) rec = "hit";
    return rec;
  }

  const clampedVal = Math.max(5, Math.min(value, 21));
  const hardIdx = clampedVal - 5;
  let rec = HARD[hardIdx]?.[di] ?? "stand";
  if (rec === "double" && !canDouble) rec = "hit";
  if (rec === "surrender" && !canSurrender) rec = "hit";
  return rec;
}

export function getActionExplanation(
  playerCards: Card[],
  dealerUpcard: Card,
  correctAction: PlayerAction,
  playerAction: PlayerAction
): string {
  const { value, soft } = handValue(playerCards);
  const dealerVal = cardValue(dealerUpcard.rank);
  const dealerStr = dealerUpcard.rank === "A" ? "Ace" : `${dealerVal}`;
  const isWeak = dealerVal >= 2 && dealerVal <= 6;
  const isMed = dealerVal >= 7 && dealerVal <= 9;
  const isStrong = dealerVal >= 10;

  const correct = correctAction === playerAction;

  // Pairs
  if (playerCards.length === 2) {
    const v1 = cardValue(playerCards[0].rank);
    const v2 = cardValue(playerCards[1].rank);
    if (v1 === v2 || (v1 >= 10 && v2 >= 10)) {
      const r = playerCards[0].rank;
      if (r === "A") return correct
        ? "Always split Aces — each Ace gives you a strong starting hand."
        : "Always split Aces. Each becomes a new hand starting with 11.";
      if (v1 === 8) return correct
        ? "Always split 8s — 16 is the worst hand in blackjack."
        : "Always split 8s. Hard 16 loses more often than two separate 8s.";
      if (v1 === 5) return correct
        ? "Never split 5s — treat them as hard 10 and double instead."
        : "Never split 5s. Hard 10 is powerful; two 5s are not.";
      if (v1 === 10) return correct
        ? "Never split 10s — 20 is already a winning hand."
        : "Never split 10s. You're sitting on 20 — don't break it up.";
    }
  }

  // Surrender
  if (correctAction === "surrender") return correct
    ? `Surrendering hard ${value} vs dealer ${dealerStr} saves half your bet — you'd lose this more than half the time.`
    : `Should surrender hard ${value} vs dealer ${dealerStr}. You lose this hand over 50% of the time, so giving up half is the better play.`;

  // Soft hands
  if (soft && value <= 20) {
    if (correctAction === "double") return correct
      ? `Soft ${value} vs dealer ${dealerStr}: Double to squeeze extra value — dealer is weak and you can't bust.`
      : `Double soft ${value} vs dealer ${dealerStr}. The dealer is likely to bust, and you can't go bust on one card.`;
    if (correctAction === "stand") return correct
      ? `Soft 18 vs dealer ${dealerStr}: Standing is correct — hitting risks turning a good hand into a worse one.`
      : `Stand on soft 18 vs dealer ${dealerStr}. Hitting risks making it worse; 18 already beats many dealer outcomes.`;
    return correct
      ? `Soft ${value} vs dealer ${dealerStr}: Hit to improve — you can't bust and need a stronger total.`
      : `Hit soft ${value} vs dealer ${dealerStr}. You can't bust, and ${value} isn't strong enough to stand on here.`;
  }

  // Hard hands
  if (correctAction === "double") return correct
    ? `Hard ${value} vs dealer ${dealerStr}: Double down — high chance of landing a strong total against a weak dealer.`
    : `Double hard ${value} vs dealer ${dealerStr}. You're likely to make 18-21, and the dealer is vulnerable.`;

  if (correctAction === "stand") {
    if (value >= 17) return correct
      ? `Hard ${value}: Always stand — the risk of busting outweighs any gain from hitting.`
      : `Stand on hard ${value}. Any card above 4 busts you — it's not worth the risk.`;
    if (isWeak) return correct
      ? `Hard ${value} vs dealer ${dealerStr}: Stand and let the dealer bust — they show a weak card (${dealerStr}).`
      : `Stand on hard ${value} vs dealer ${dealerStr}. Dealer is weak; let them draw into a bust instead of risking your hand.`;
    return correct
      ? `Hard ${value} vs dealer ${dealerStr}: Standing is correct here.`
      : `Stand on hard ${value} vs dealer ${dealerStr} — the math favors protecting your hand.`;
  }

  if (correctAction === "hit") {
    if (value <= 11) return correct
      ? `Hard ${value}: Always hit — you can't bust and need a higher total.`
      : `Hit hard ${value}. You cannot bust with one card; always take another.`;
    if (isStrong || isMed) return correct
      ? `Hard ${value} vs dealer ${dealerStr}: Hit — dealer is too strong to risk standing here.`
      : `Hit hard ${value} vs dealer ${dealerStr}. Dealer has a strong upcard; standing on ${value} isn't enough.`;
    return correct
      ? `Hard ${value} vs dealer ${dealerStr}: Hit is correct here.`
      : `Hit hard ${value} vs dealer ${dealerStr}. Your total isn't strong enough to stand against this upcard.`;
  }

  return correct
    ? "Good play — that's exactly right."
    : `The correct play is to ${correctAction}.`;
}

export function kellyBet(stack: number, tc: number, minBet: number): number {
  const edge = (tc - 1) * 0.005;
  if (edge <= 0) return minBet;
  const fraction = edge / 2;
  const rawBet = stack * fraction;
  const units = Math.min(8, Math.max(1, Math.round(rawBet / minBet)));
  return units * minBet;
}

export const DEALER_NAMES = [
  "Marcus","Diana","Chen","Sofia","Andre","Priya","Luca","Zara",
  "Omar","Elena","Kai","Nadia","Remi","Yuki","Darius","Isla",
];

export function randomDealerName(): string {
  return DEALER_NAMES[Math.floor(Math.random() * DEALER_NAMES.length)];
}
