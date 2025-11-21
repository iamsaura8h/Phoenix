// File: src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 px-4">
      <div className="max-w-2xl text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          CryptoTrack
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Backtest your{" "}
          <span className="text-primary">crypto trading strategies</span> in
          plain English.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Describe your strategy, pick an asset, and let CryptoTrack simulate
          performance so you can focus on making better trading decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Get Started with Google
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground">
            No passwords. Secure Google sign-in only.
          </span>
        </div>
      </div>

      <footer className="mt-10 text-[11px] text-muted-foreground">
        Built for backtesting. Not financial advice.
      </footer>
    </main>
  );
}
