# Blackjack Strategy Trainer

A mobile-first blackjack strategy trainer built with Next.js 14, TypeScript, and Tailwind CSS. Practice basic strategy and learn Hi-Lo card counting — all in a polished casino-green UI.

---

## Features

- **Basic Strategy Checker** — After every hand, the trainer tells you whether your move was correct and what the optimal play was. Strategy covers hard totals, soft totals, pairs, and late surrender for 6-deck S17 DAS.
- **Hi-Lo Card Counting** — Running count (RC) and True Count (TC) are displayed live. Cards are tracked accurately through the shoe.
- **Kelly Criterion Bet Sizing** — Based on the current true count, the trainer suggests a Kelly-adjusted bet size. Appears at the betting screen and in the stats bar when TC ≥ 2.
- **Stats Dashboard** — Tracks P&L, correct move percentage, and shoe penetration across your session.
- **Configurable Rules** — Choose 1/2/4/6/8 decks, custom starting stack, late surrender, and double after split (DAS).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (zero-config)

---

## Project Structure

```
blackjack-trainer/
├── app/
│   ├── globals.css       # Base styles + animations
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main game controller (state lives here)
├── components/
│   ├── SetupScreen.tsx   # Game config screen
│   ├── BettingScreen.tsx # Chip selection + deal
│   ├── StatsBar.tsx      # Top bar: stack, P&L, RC/TC, shoe
│   ├── GameTable.tsx     # Dealer/player hands + action buttons
│   └── PlayingCard.tsx   # Individual card component
├── lib/
│   ├── types.ts          # All TypeScript types
│   ├── shoe.ts           # Deck building, hand value, Hi-Lo counting
│   ├── strategy.ts       # Basic strategy chart + Kelly formula
│   └── gameEngine.ts     # Full game state machine
└── README.md
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

---

## Deploy to Vercel via GitHub

### Step 1 — Create a GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Name it `blackjack-trainer`, keep it public or private
3. Click **Create repository**

### Step 2 — Push the code

```bash
cd blackjack-trainer

# Initialize git
git init
git add .
git commit -m "Initial commit: blackjack strategy trainer"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/blackjack-trainer.git
git branch -M main
git push -u origin main
```

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `blackjack-trainer` repo
4. Leave all settings as defaults (Vercel auto-detects Next.js)
5. Click **Deploy**

That's it. Vercel will give you a URL like `blackjack-trainer.vercel.app`. Every `git push` to `main` triggers a new deployment automatically.

---

## Strategy Reference (6-deck, S17, DAS, Late Surrender)

| Hand | vs 2 | vs 3 | vs 4 | vs 5 | vs 6 | vs 7 | vs 8 | vs 9 | vs T | vs A |
|------|------|------|------|------|------|------|------|------|------|------|
| Hard 9 | H | D | D | D | D | H | H | H | H | H |
| Hard 10 | D | D | D | D | D | D | D | D | H | H |
| Hard 11 | D | D | D | D | D | D | D | D | D | H |
| Hard 12 | H | H | S | S | S | H | H | H | H | H |
| Hard 13-16 | S | S | S | S | S | H | H | H | H | H |
| Hard 15 | S | S | S | S | S | H | H | H | Sur | Sur |
| Hard 16 | S | S | S | S | S | H | H | Sur | Sur | Sur |
| Soft 17 (A,6) | H | D | D | D | D | H | H | H | H | H |
| Soft 18 (A,7) | D | D | D | D | D | S | S | H | H | H |
| A,A | Sp | Sp | Sp | Sp | Sp | Sp | Sp | Sp | Sp | Sp |
| 8,8 | Sp | Sp | Sp | Sp | Sp | Sp | Sp | Sp | Sp | Sur |

H=Hit, S=Stand, D=Double, Sp=Split, Sur=Surrender

---

## Card Counting (Hi-Lo)

| Cards | Count |
|-------|-------|
| 2–6 | +1 |
| 7–9 | 0 |
| 10–A | −1 |

**True Count** = Running Count ÷ Decks Remaining

**Kelly Bet** = (TC − 1) × 0.5% edge × stack × 0.5 (half-Kelly), rounded to nearest $25, capped at 8× min bet.

---

## Roadmap (future enhancements)

- Strategy deviation hints (Illustrious 18)
- Insurance suggestion at TC ≥ 3
- Session history chart
- Sound effects
- Split hand strategy tracking
- Leaderboard via Vercel KV
