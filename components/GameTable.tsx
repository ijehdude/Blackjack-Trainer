"use client";

import { GameState, PlayerAction, Hand } from "@/lib/types";
import { handValue } from "@/lib/shoe";
import { getActionExplanation } from "@/lib/strategy";
import PlayingCard from "./PlayingCard";

interface GameTableProps {
  state: GameState;
  dealerName: string;
  onAction: (action: PlayerAction) => void;
  onNextHand: () => void;
  onSelectHand: (index: number) => void;
}

// Standard deal order: player[0], dealer[0], player[1], dealer[1] (hole card)
// Hit cards (index >= 2) appear immediately with no delay
function getDealIndex(isDealer: boolean, cardIndex: number): number {
  if (!isDealer && cardIndex === 0) return 0;
  if (isDealer  && cardIndex === 0) return 1;
  if (!isDealer && cardIndex === 1) return 2;
  if (isDealer  && cardIndex === 1) return 3;
  return 0;
}

export default function GameTable({ state, dealerName, onAction, onNextHand, onSelectHand }: GameTableProps) {
  const isResult = state.phase === "result";
  const activeHand = state.playerHands[state.activeHandIndex];
  const dealerFaceCards = state.dealerHand.filter((c) => !c.faceDown);
  const dealerVal = handValue(dealerFaceCards);
  const dealerFinal = handValue(state.dealerHand);
  const dealerBust = isResult && dealerFinal.value > 21;

  const canAct = state.phase === "playerTurn" && activeHand && !activeHand.stood && !activeHand.result;
  const canDouble = canAct && activeHand.cards.length === 2 && state.stack >= activeHand.bet;
  const canSplit =
    canAct &&
    activeHand.cards.length === 2 &&
    activeHand.cards[0].rank === activeHand.cards[1].rank &&
    state.playerHands.length < 4 &&
    state.stack >= activeHand.bet;
  const canSurrender =
    canAct &&
    state.settings.lateSurrender &&
    activeHand.cards.length === 2 &&
    state.playerHands.length === 1;

  const explanation =
    isResult && state.correctAction && state.lastAction && activeHand
      ? getActionExplanation(
          activeHand.cards,
          state.dealerHand[0],
          state.correctAction,
          state.lastAction
        )
      : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Dealer area */}
      <div className="flex flex-col items-center px-4 pt-4 pb-2">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
          Dealer — <span className="text-white">{dealerName}</span>
        </p>
        <div className="flex gap-2 items-end justify-center min-h-[96px]">
          {state.dealerHand.map((card, i) => (
            <PlayingCard key={i} card={card} dealIndex={getDealIndex(true, i)} />
          ))}
        </div>
        {state.dealerHand.length > 0 && (
          <div className={`mt-1 text-sm font-bold ${dealerBust ? "text-red-400" : "text-white"}`}>
            {isResult
              ? dealerBust
                ? `Bust (${dealerFinal.value})`
                : dealerFinal.value
              : dealerVal.value > 0
              ? dealerVal.value
              : ""}
          </div>
        )}
      </div>

      {/* Player hands */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto py-2">
        {state.playerHands.map((hand, hi) => {
          const isActive = hi === state.activeHandIndex && state.phase === "playerTurn";
          const isSelectable =
            !isActive &&
            state.phase === "playerTurn" &&
            !hand.stood &&
            !hand.result;
          return (
            <PlayerHandDisplay
              key={hi}
              hand={hand}
              isActive={isActive}
              isSelectable={isSelectable}
              isResult={isResult}
              label={state.playerHands.length > 1 ? `Hand ${hi + 1}` : "Seat 1"}
              onSelect={isSelectable ? () => onSelectHand(hi) : undefined}
            />
          );
        })}
      </div>

      {/* Bottom action area */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        {isResult ? (
          <>
            {/* Correct / Wrong */}
            {state.wasCorrect !== undefined && (
              <div
                className={`text-center py-2 rounded-xl text-sm font-bold ${
                  state.wasCorrect
                    ? "text-green-400 bg-green-900/30 border border-green-800"
                    : "text-red-400 bg-red-900/30 border border-red-800"
                }`}
              >
                {state.wasCorrect ? (
                  "✓ Correct"
                ) : (
                  <>✗ Should have <span className="uppercase">{state.correctAction}</span></>
                )}
              </div>
            )}

            {/* Explanation */}
            {explanation && (
              <div className="bg-[#0d2e1c] border border-[#1a5c38] rounded-xl px-4 py-3 text-xs text-gray-300 leading-relaxed text-center">
                {explanation}
              </div>
            )}

            {state.message && (
              <div className="text-center text-[#c9a84c] text-sm font-bold">{state.message}</div>
            )}

            <button
              onClick={onNextHand}
              className="w-full py-4 bg-[#c9a84c] hover:bg-[#e0c06a] text-black font-bold text-lg tracking-widest uppercase rounded-xl transition-all active:scale-95"
            >
              Next Hand
            </button>
          </>
        ) : state.phase === "dealerTurn" ? (
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest py-2 animate-pulse">
            Dealer&rsquo;s turn…
          </p>
        ) : canAct ? (
          <>
            {/* Hit / Stand / Double row */}
            <div className="flex gap-2">
              <ActionBtn label="Hit" border="border-cyan-600" text="text-cyan-400" onClick={() => onAction("hit")} />
              <ActionBtn label="Stand" border="border-green-600" text="text-green-400" onClick={() => onAction("stand")} />
              {canDouble && (
                <ActionBtn label="Double" border="border-purple-600" text="text-purple-400" onClick={() => onAction("double")} />
              )}
              {canSplit && (
                <ActionBtn label="Split" border="border-yellow-600" text="text-yellow-400" onClick={() => onAction("split")} />
              )}
            </div>

            {/* Surrender */}
            {canSurrender && (
              <button
                onClick={() => onAction("surrender")}
                className="w-full py-3 bg-[#3a1212] border border-red-800 text-red-400 font-bold tracking-widest uppercase rounded-xl hover:bg-red-900/40 transition-all active:scale-95 text-sm"
              >
                Surrender
              </button>
            )}

            <p className="text-center text-gray-500 text-xs uppercase tracking-widest pt-1">
              Make your move
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PlayerHandDisplay({
  hand,
  isActive,
  isSelectable,
  isResult,
  label,
  onSelect,
}: {
  hand: Hand;
  isActive: boolean;
  isSelectable: boolean;
  isResult: boolean;
  label: string;
  onSelect?: () => void;
}) {
  const { value, soft } = handValue(hand.cards);
  const bust = value > 21;
  const result = hand.result;

  const resultPillStyle: Record<string, string> = {
    win:       "bg-green-700/80 text-green-200",
    blackjack: "bg-yellow-700/80 text-yellow-200",
    push:      "bg-gray-700 text-gray-300",
    lose:      "bg-red-900/80 text-red-300",
    bust:      "bg-red-900/80 text-red-300",
  };

  const resultLabel: Record<string, string> = {
    win:       `Win +$${hand.bet}`,
    blackjack: `Blackjack! +$${Math.floor(hand.bet * 1.5)}`,
    push:      "Push",
    lose:      `Lose -$${hand.bet}`,
    bust:      `Bust`,
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl px-4 py-3 border transition-all ${
        isActive
          ? "border-[#c9a84c] bg-[#1a5c38]/30"
          : isSelectable
          ? "border-white/25 bg-[#1a5c38]/15 cursor-pointer active:scale-[0.98]"
          : "border-[#1a5c38]/60 bg-[#1a5c38]/10"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`text-xs font-bold uppercase tracking-widest ${
          isActive ? "text-[#c9a84c]" : isSelectable ? "text-white/70" : "text-gray-400"
        }`}>
          {label}
        </p>
        {isSelectable && (
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Tap to play ▶</span>
        )}
      </div>

      {/* Cards */}
      <div className="flex gap-2 items-end justify-center">
        {hand.cards.map((card, i) => (
          <PlayingCard key={i} card={card} small dealIndex={getDealIndex(false, i)} />
        ))}
      </div>

      {/* Value + result pill + bet */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className={`text-sm font-bold ${bust ? "text-red-400" : "text-white"}`}>
          {bust
            ? `Bust (${value})`
            : `${soft && value < 21 ? "Soft " : ""}${value}`}
        </span>

        {hand.doubled && (
          <span className="text-[10px] text-purple-400 bg-purple-900/40 px-1.5 py-0.5 rounded">2×</span>
        )}
        {hand.surrendered && (
          <span className="text-[10px] text-orange-400 bg-orange-900/40 px-1.5 py-0.5 rounded">Surrendered</span>
        )}

        {isResult && result && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${resultPillStyle[result] ?? ""}`}>
            {resultLabel[result] ?? ""}
          </span>
        )}
      </div>

      <div className="text-[#c9a84c] text-sm font-bold mt-1">${hand.bet.toLocaleString()}</div>
    </div>
  );
}

function ActionBtn({
  label, border, text, onClick,
}: {
  label: string; border: string; text: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3.5 border-2 ${border} ${text} font-bold tracking-widest uppercase rounded-xl transition-all active:scale-95 text-sm hover:bg-white/5`}
    >
      {label}
    </button>
  );
}
