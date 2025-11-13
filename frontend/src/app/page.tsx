"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [view, setView] = useState<"input" | "results">("input");
  const [asset, setAsset] = useState("BTC");
  const [strategy, setStrategy] = useState("");

  const exampleStrategies = [
    "Buy when price crosses above 20-day moving average, sell when it crosses below.",
    "RSI oversold (< 30) entry, exit at RSI > 70 with 2% stop loss.",
    "Golden cross strategy with volume confirmation and 1.5% take profit.",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <nav className="w-full border-b border-border py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">CryptoTrack</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Saurabh Kumar</span>
          <Button variant="outline" className="text-sm px-3 py-1 h-8">
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {view === "input" ? (
          <>
            {/* HERO SECTION */}
            <div className="text-center mb-16 space-y-6">
              <Badge
                variant="outline"
                className="border-primary/30 text-primary px-4 py-1 text-sm"
              >
                🤖 AI-Powered Crypto Backtesting
              </Badge>

              <h1 className="text-5xl font-bold">
                Turn Ideas Into{" "}
                <span className="text-primary">Strategies</span>
              </h1>

              <p className="text-muted-foreground max-w-xl mx-auto">
                Describe your trading strategy in plain English. CryptoTrack
                converts it into a structured logic and backtests it using
                historical crypto data.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <Feature text="Natural Language Processing" />
                <Feature text="Historical Analysis" />
                <Feature text="Clean Metrics" />
              </div>
            </div>

            {/* STRATEGY INPUT BOX */}
            <Card className="p-8 space-y-8 bg-card border-border">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Strategy Input</h2>
              </div>

              {/* ASSET SELECT */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Asset</label>
                <Select value={asset} onValueChange={setAsset}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="SOL">Solana (SOL)</SelectItem>
                    <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TEXTAREA */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trading Strategy</label>
                <Textarea
                  placeholder="Describe your trading strategy..."
                  className="min-h-[150px] bg-secondary border-border text-foreground"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                />
              </div>

              {/* BUTTON */}
              <Button
                disabled={!strategy.trim()}
                onClick={() => setView("results")}
                className="w-full h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Zap className="w-5 h-5 mr-2" />
                Run Backtest
              </Button>

              {/* EXAMPLE STRATEGIES */}
              <div className="pt-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Example Strategies
                </p>

                <div className="space-y-2">
                  {exampleStrategies.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setStrategy(example)}
                      className="w-full p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-left text-muted-foreground hover:text-foreground text-sm"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Results view={view} asset={asset} strategy={strategy} setView={setView} />
        )}
      </div>
    </div>
  );
}

/* --- COMPONENTS --- */

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="w-2 h-2 rounded-full bg-primary" />
      {text}
    </div>
  );
}

function Results({ asset, strategy, setView }: any) {
  return (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold">Backtest Results</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered backtesting analysis for {asset}
          </p>
        </div>

        <Button variant="outline" onClick={() => setView("input")}>
          New Strategy
        </Button>
      </div>

      {/* RESULT SUMMARY */}
      <Card className="p-8 space-y-6 bg-card border-border">
        <h2 className="text-2xl font-bold">Backtest Complete</h2>
        <p className="text-muted-foreground">
          Your strategy has been processed successfully.
        </p>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <Metric label="Initial Value" value="$10,000" positive />
          <Metric label="Final Value" value="$14,570" positive />
        </div>

        <div className="pt-4">
          <p className="text-sm font-medium text-muted-foreground">
            Strategy Description
          </p>
          <p className="text-foreground">{strategy}</p>
        </div>
      </Card>

      {/* CHART BOX */}
      <Card className="p-8 mt-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Chart Visualization</h3>
        </div>

        <div className="h-64 flex justify-center items-center bg-secondary rounded-lg">
          <BarChart3 className="w-10 h-10 opacity-30" />
        </div>
      </Card>
    </>
  );
}

function Metric({ label, value }: any) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold text-success">{value}</p>
    </div>
  );
}
