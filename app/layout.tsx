import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

// Jost is the closest freely available match to Tw Cen MT
const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blackjack Strategy Trainer",
  description: "Master basic strategy, card counting, and bet sizing",
};

// viewport-fit=cover lets us read iOS safe-area insets so content isn't
// hidden behind the address bar, toolbar, or home indicator.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jost.variable}>
      <body>{children}</body>
    </html>
  );
}
