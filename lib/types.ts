export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  rank: Rank;
  suit: Suit;
  faceDown?: boolean;
}

export type GamePhase =
  | "setup"
  | "betting"
  | "dealing"
  | "playerTurn"
  | "dealerTurn"
  | "result";

export type PlayerAction = "hit" | "stand" | "double" | "split" | "surrender";

export interface Hand {
  cards: Card[];
  bet: number;
  doubled?: boolean;
  surrendered?: boolean;
  stood?: boolean;
  result?: "win" | "lose" | "push" | "blackjack" | "bust";
  payout?: number;
}

export interface GameSettings {
  numDecks: number;
  startingStack: number;
  lateSurrender: boolean;
  doubleAfterSplit: boolean;
}

export interface GameStats {
  handsPlayed: number;
  handsCorrect: number;
  pnl: number;
}

export interface GameState {
  settings: GameSettings;
  phase: GamePhase;
  shoe: Card[];
  dealerHand: Card[];
  playerHands: Hand[];
  activeHandIndex: number;
  stack: number;
  currentBet: number;
  runningCount: number;
  stats: GameStats;
  lastAction?: PlayerAction;
  correctAction?: PlayerAction;
  wasCorrect?: boolean;
  message?: string;
}
