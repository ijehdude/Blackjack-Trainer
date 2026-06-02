import { GameState, GameSettings, Card, PlayerAction, Hand } from "./types";
import { buildShoe, handValue, hiLoCount, isBlackjack } from "./shoe";
import { getCorrectAction } from "./strategy";

const RESHUFFLE_PENETRATION = 0.75; // reshuffle when 75% through shoe

export function createInitialState(settings: GameSettings): GameState {
  return {
    settings,
    phase: "betting",
    shoe: buildShoe(settings.numDecks),
    dealerHand: [],
    playerHands: [],
    activeHandIndex: 0,
    stack: settings.startingStack,
    currentBet: 25,
    runningCount: 0,
    stats: { handsPlayed: 0, handsCorrect: 0, pnl: 0 },
  };
}

function dealCard(state: GameState, faceDown = false): [GameState, Card] {
  const shoe = [...state.shoe];
  if (shoe.length === 0) {
    // Reshuffle
    const newShoe = buildShoe(state.settings.numDecks);
    return [{ ...state, shoe: newShoe, runningCount: 0 }, { ...newShoe[0], faceDown }];
  }
  const card = { ...shoe[0], faceDown };
  const rc = faceDown ? state.runningCount : state.runningCount + hiLoCount(card.rank);
  return [{ ...state, shoe: shoe.slice(1), runningCount: rc }, card];
}

export function startDeal(state: GameState): GameState {
  // Check reshuffle threshold
  let s = state;
  const totalCards = state.settings.numDecks * 52;
  if (state.shoe.length < totalCards * (1 - RESHUFFLE_PENETRATION)) {
    s = { ...s, shoe: buildShoe(state.settings.numDecks), runningCount: 0 };
  }

  const bet = state.currentBet;
  let card1: Card, card2: Card, d1: Card, d2: Card;

  [s, card1] = dealCard(s);
  [s, d1] = dealCard(s);
  [s, card2] = dealCard(s);
  [s, d2] = dealCard(s, true); // dealer hole card

  const playerHand: Hand = { cards: [card1, card2], bet };
  const dealerHand = [d1, d2];

  s = {
    ...s,
    phase: "playerTurn",
    dealerHand,
    playerHands: [playerHand],
    activeHandIndex: 0,
    stack: s.stack - bet,
    wasCorrect: undefined,
    correctAction: undefined,
    lastAction: undefined,
    message: undefined,
  };

  // Check player blackjack
  if (isBlackjack(playerHand.cards)) {
    return resolveBlackjack(s);
  }

  return s;
}

function resolveBlackjack(state: GameState): GameState {
  // Reveal dealer hole card
  const dealerCards = state.dealerHand.map((c) => ({ ...c, faceDown: false }));
  const dealerBJ = isBlackjack(dealerCards);

  if (dealerBJ) {
    // Push
    const hand = { ...state.playerHands[0], result: "push" as const, payout: state.playerHands[0].bet };
    return {
      ...state,
      dealerHand: dealerCards,
      playerHands: [hand],
      phase: "result",
      stack: state.stack + hand.bet,
      stats: {
        ...state.stats,
        handsPlayed: state.stats.handsPlayed + 1,
        pnl: state.stats.pnl,
      },
      message: "Push — both blackjack",
    };
  }

  // Player blackjack pays 3:2
  const payout = Math.floor(state.playerHands[0].bet * 2.5);
  const hand = { ...state.playerHands[0], result: "blackjack" as const, payout };
  return {
    ...state,
    dealerHand: dealerCards,
    playerHands: [hand],
    phase: "result",
    stack: state.stack + payout,
    stats: {
      ...state.stats,
      handsPlayed: state.stats.handsPlayed + 1,
      pnl: state.stats.pnl + hand.bet * 1.5,
    },
    message: "Blackjack! 🃏",
  };
}

export function playerAction(state: GameState, action: PlayerAction): GameState {
  let s = { ...state };
  const handIdx = s.activeHandIndex;
  const hand = { ...s.playerHands[handIdx] };
  const dealerUp = s.dealerHand[0];

  // Determine correct action for strategy feedback
  const canDouble = hand.cards.length === 2 && s.stack >= hand.bet;
  const canSplit =
    hand.cards.length === 2 &&
    hand.cards[0].rank === hand.cards[1].rank &&
    s.playerHands.length < 4 &&
    s.stack >= hand.bet;
  const canSurrender =
    s.settings.lateSurrender &&
    hand.cards.length === 2 &&
    s.playerHands.length === 1;

  const correct = getCorrectAction(hand.cards, dealerUp, canDouble, canSplit, canSurrender);
  const wasCorrect = action === correct;

  s = {
    ...s,
    lastAction: action,
    correctAction: correct,
    wasCorrect,
    stats: {
      ...s.stats,
      handsPlayed: s.stats.handsPlayed + 1,
      handsCorrect: s.stats.handsCorrect + (wasCorrect ? 1 : 0),
    },
  };

  if (action === "surrender") {
    const payout = Math.floor(hand.bet / 2);
    const updated = { ...hand, surrendered: true, result: "lose" as const, payout: -payout };
    s = {
      ...s,
      playerHands: s.playerHands.map((h, i) => (i === handIdx ? updated : h)),
      stack: s.stack + payout,
      stats: { ...s.stats, pnl: s.stats.pnl - payout },
    };
    return advanceOrResolve(s);
  }

  if (action === "stand") {
    const updated = { ...hand, stood: true };
    s = { ...s, playerHands: s.playerHands.map((h, i) => (i === handIdx ? updated : h)) };
    return advanceOrResolve(s);
  }

  if (action === "double") {
    let card: Card;
    [s, card] = dealCard(s);
    const newCards = [...hand.cards, card];
    const { value } = handValue(newCards);
    const result = value > 21 ? "bust" : undefined;
    const updated: Hand = {
      ...hand,
      cards: newCards,
      bet: hand.bet * 2,
      doubled: true,
      stood: true,
      result,
    };
    s = {
      ...s,
      stack: s.stack - hand.bet,
      playerHands: s.playerHands.map((h, i) => (i === handIdx ? updated : h)),
    };
    return advanceOrResolve(s);
  }

  if (action === "split") {
    const [c1, c2] = hand.cards;
    let newC1: Card, newC2: Card;
    [s, newC1] = dealCard(s);
    [s, newC2] = dealCard(s);
    const hand1: Hand = { cards: [c1, newC1], bet: hand.bet };
    const hand2: Hand = { cards: [c2, newC2], bet: hand.bet };
    s = {
      ...s,
      stack: s.stack - hand.bet,
      playerHands: [
        ...s.playerHands.slice(0, handIdx),
        hand1,
        hand2,
        ...s.playerHands.slice(handIdx + 1),
      ],
    };
    // Check for aces split — stand immediately
    if (c1.rank === "A" && !s.settings.doubleAfterSplit) {
      return advanceOrResolve(s);
    }
    return s;
  }

  // Hit
  let card: Card;
  [s, card] = dealCard(s);
  const newCards = [...hand.cards, card];
  const { value } = handValue(newCards);
  if (value > 21) {
    const updated: Hand = { ...hand, cards: newCards, result: "bust" };
    s = { ...s, playerHands: s.playerHands.map((h, i) => (i === handIdx ? updated : h)) };
    return advanceOrResolve(s);
  }
  if (value === 21) {
    const updated: Hand = { ...hand, cards: newCards, stood: true };
    s = { ...s, playerHands: s.playerHands.map((h, i) => (i === handIdx ? updated : h)) };
    return advanceOrResolve(s);
  }

  return { ...s, playerHands: s.playerHands.map((h, i) => (i === handIdx ? { ...hand, cards: newCards } : h)) };
}

function advanceOrResolve(state: GameState): GameState {
  // Find any unfinished hand — order-independent so player can act on hands freely
  const next = state.playerHands.findIndex((h) => !h.stood && !h.result);
  if (next !== -1) {
    return { ...state, activeHandIndex: next };
  }
  return startDealerTurn(state);
}

// Reveal the dealer's hole card and enter the animated dealerTurn phase
export function startDealerTurn(state: GameState): GameState {
  let s = { ...state };
  const dealerCards = s.dealerHand.map((c) => {
    if (c.faceDown) {
      const rc = s.runningCount + hiLoCount(c.rank);
      s = { ...s, runningCount: rc };
      return { ...c, faceDown: false };
    }
    return c;
  });
  s = { ...s, dealerHand: dealerCards };

  // If every player hand already busted/surrendered, skip dealer draw entirely
  const allBust = s.playerHands.every((h) => h.result === "bust" || h.surrendered);
  if (allBust) return settleHands(s);

  return { ...s, phase: "dealerTurn" };
}

// Draw exactly one more dealer card, or settle if dealer is done — called repeatedly from the UI
export function dealerStep(state: GameState): GameState {
  const { value, soft } = handValue(state.dealerHand);
  if (value < 17 || (value === 17 && soft)) {
    let s = { ...state };
    let card: Card;
    [s, card] = dealCard(s);
    return { ...s, dealerHand: [...s.dealerHand, card] };
  }
  return settleHands(state);
}

function settleHands(state: GameState): GameState {
  const { value: dealerVal } = handValue(state.dealerHand);
  const dealerBust = dealerVal > 21;

  let stackDelta = 0;
  const settled = state.playerHands.map((hand) => {
    if (hand.surrendered) return hand; // already settled
    if (hand.result === "bust") {
      stackDelta -= hand.bet;
      return { ...hand, payout: -hand.bet };
    }
    const { value: pv } = handValue(hand.cards);
    let result: Hand["result"];
    let payout: number;

    if (dealerBust || pv > dealerVal) {
      result = "win";
      payout = hand.bet;
      stackDelta += hand.bet * 2;
    } else if (pv === dealerVal) {
      result = "push";
      payout = 0;
      stackDelta += hand.bet;
    } else {
      result = "lose";
      payout = -hand.bet;
    }
    return { ...hand, result, payout };
  });

  // Calculate net PnL for this round
  const baseBets = settled.reduce((sum, h) => sum + (h.surrendered ? 0 : h.bet), 0);
  const winnings = stackDelta - baseBets; // net profit/loss (excl. returned bets)
  // Actually simpler: stack gained = stackDelta, we already subtracted bets at deal time
  // Just return the winnings from stackDelta

  return {
    ...state,
    playerHands: settled,
    phase: "result",
    stack: state.stack + stackDelta,
    stats: {
      ...state.stats,
      pnl: state.stats.pnl + (stackDelta - baseBets),
    },
  };
}

export function nextHand(state: GameState): GameState {
  return {
    ...state,
    phase: "betting",
    dealerHand: [],
    playerHands: [],
    activeHandIndex: 0,
    wasCorrect: undefined,
    correctAction: undefined,
    lastAction: undefined,
    message: undefined,
  };
}
