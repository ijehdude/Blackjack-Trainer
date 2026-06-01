/**
 * Basic strategy for 6-deck, S17, DAS, late surrender.
 * Returns the optimal action for a given player hand vs dealer upcard.
 */

import { Card, PlayerAction } from "./types";
import { handValue, cardValue } from "./shoe";

// Dealer upcard index: 2→0, 3→1, ..., 9→7, 10/J/Q/K→8, A→9
function dealerIdx(rank: string): number {
  if (rank === "A") return 9;
  const v = ["J","Q","K"].includes(rank) ? 10 : parseInt(rank, 10);
  if (v >= 10) return 8;
  return v - 2;
}

// Hard totals strategy (no pair, no soft)
// Rows: hard 5–21, Cols: dealer 2,3,4,5,6,7,8,9,10,A
const HARD: PlayerAction[][] = [
  // 5  6  7  8
  Array(10).fill("hit"),
  Array(10).fill("hit"),
  Array(10).fill("hit"),
  Array(10).fill("hit"),
  // 9: Double vs 3-6 else Hit
  ["hit","double","double","double","double","hit","hit","hit","hit","hit"],
  // 10: Double vs 2-9 else Hit
  ["double","double","double","double","double","double","double","double","hit","hit"],
  // 11: Double vs 2-10, Hit vs A
  ["double","double","double","double","double","double","double","double","double","hit"],
  // 12: Stand vs 4-6 else Hit
  ["hit","hit","stand","stand","stand","hit","hit","hit","hit","hit"],
  // 13: Stand vs 2-6 else Hit
  ["stand","stand","stand","stand","stand","hit","hit","hit","hit","hit"],
  // 14
  ["stand","stand","stand","stand","stand","hit","hit","hit","hit","hit"],
  // 15: Stand 2-6, Surrender vs 10/A
  ["stand","stand","stand","stand","stand","hit","hit","hit","surrender","surrender"],
  // 16: Stand 2-6, Surrender vs 9/10/A
  ["stand","stand","stand","stand","stand","hit","hit","surrender","surrender","surrender"],
  // 17+: Stand always
  Array(10).fill("stand"),
  Array(10).fill("stand"),
  Array(10).fill("stand"),
  Array(10).fill("stand"),
  Array(10).fill("stand"),
];

// Soft totals (with ace counted as 11)
// Rows: soft 13 (A,2) through soft 21 (A,10=BJ, n/a)
// Index = soft total - 13
const SOFT: PlayerAction[][] = [
  // A,2 (13): Double vs 5-6 else Hit
  ["hit","hit","hit","double","double","hit","hit","hit","hit","hit"],
  // A,3 (14)
  ["hit","hit","hit","double","double","hit","hit","hit","hit","hit"],
  // A,4 (15)
  ["hit","hit","double","double","double","hit","hit","hit","hit","hit"],
  // A,5 (16)
  ["hit","hit","double","double","double","hit","hit","hit","hit","hit"],
  // A,6 (17): Double vs 3-6 else Hit
  ["hit","double","double","double","double","hit","hit","hit","hit","hit"],
  // A,7 (18): Double vs 2-6, Stand vs 7-8, Hit vs 9/10/A
  ["double","double","double","double","double","stand","stand","hit","hit","hit"],
  // A,8 (19): Stand (Double vs 6 optional, skipping for simplicity)
  Array(10).fill("stand"),
  // A,9 (20)
  Array(10).fill("stand"),
];

// Pairs: DAS allowed
// Rows: 2,2 through A,A
// Index = card value - 2 (face/10 = 8, A = 9)
const PAIRS: PlayerAction[][] = [
  // 2,2: Split vs 2-7 else Hit
  ["split","split","split","split","split","split","hit","hit","hit","hit"],
  // 3,3: same
  ["split","split","split","split","split","split","hit","hit","hit","hit"],
  // 4,4: Split vs 5-6 (DAS) else Hit
  ["hit","hit","hit","split","split","hit","hit","hit","hit","hit"],
  // 5,5: Never split (treat as 10)
  ["double","double","double","double","double","double","double","double","hit","hit"],
  // 6,6: Split vs 2-6 else Hit
  ["split","split","split","split","split","hit","hit","hit","hit","hit"],
  // 7,7: Split vs 2-7 else Hit
  ["split","split","split","split","split","split","hit","hit","hit","hit"],
  // 8,8: Always split (surrender vs A if available)
  ["split","split","split","split","split","split","split","split","split","surrender"],
  // 9,9: Split vs 2-9 except 7; Stand vs 7,10,A
  ["split","split","split","split","split","stand","split","split","stand","stand"],
  // 10,10: Never split
  Array(10).fill("stand"),
  // A,A: Always split
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

  // Check for pair
  if (canSplit && playerCards.length === 2) {
    const r1 = playerCards[0].rank;
    const r2 = playerCards[1].rank;
    const v1 = cardValue(r1);
    const v2 = cardValue(r2);
    const bothTens = v1 === 10 && v2 === 10 && v1 === v2;
    const pairVal = (v1 === v2 || (v1 >= 10 && v2 >= 10));
    if (pairVal) {
      let pairIdx: number;
      if (r1 === "A" || r2 === "A") {
        pairIdx = 9;
      } else if (bothTens || (v1 >= 10 && v2 >= 10)) {
        pairIdx = 8;
      } else {
        pairIdx = v1 - 2;
      }
      const rec = PAIRS[pairIdx]?.[di] ?? "stand";
      // If rec is split but can't split, fall through to hard/soft
      if (rec === "split" && canSplit) return "split";
      if (rec === "surrender" && canSurrender) return "surrender";
      // Fall through for non-split recommendations on pairs
      if (rec !== "split") {
        if (rec === "double" && !canDouble) return "hit";
        return rec;
      }
    }
  }

  // Soft hand
  if (soft && value >= 13 && value <= 20) {
    const idx = value - 13;
    let rec = SOFT[idx]?.[di] ?? "stand";
    if (rec === "double" && !canDouble) rec = "hit";
    if (rec === "surrender" && !canSurrender) rec = "hit";
    return rec;
  }

  // Hard hand
  const clampedVal = Math.max(5, Math.min(value, 21));
  const hardIdx = clampedVal - 5;
  let rec = HARD[hardIdx]?.[di] ?? "stand";
  if (rec === "double" && !canDouble) rec = "hit";
  if (rec === "surrender" && !canSurrender) rec = "hit";
  return rec;
}

/**
 * Kelly Criterion bet suggestion based on true count.
 * For Hi-Lo, each +1 TC adds ~0.5% edge.
 * Kelly: f = edge / odds, bet = f * bankroll
 * We cap at 8 units and floor at 1 unit.
 */
export function kellyBet(
  stack: number,
  tc: number,
  minBet: number
): number {
  // Edge per TC above 1 is roughly 0.5%
  const edge = (tc - 1) * 0.005;
  if (edge <= 0) return minBet;
  // Half-Kelly for safety
  const fraction = edge / 2;
  const rawBet = stack * fraction;
  // Round to nearest minBet increment, max 8x min
  const units = Math.min(8, Math.max(1, Math.round(rawBet / minBet)));
  return units * minBet;
}
