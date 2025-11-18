"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
  LineChart,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const [asset, setAsset] = useState("BTC");
  const [strategy, setStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  const exampleStrategies = [
    "Buy when price crosses above 20-day MA; sell when crosses below.",
    "RSI < 30 entry; exit when RSI > 70.",
    "Golden cross with volume confirmation.",
  ];

  const runBacktest = () => {
    if (!strategy.trim()) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setResultsVisible(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* NAVBAR */}
      <header className="w-full border-b border-border py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">CryptoTrack</h1>
        <Button variant="outline" className="h-8 text-sm px-3 flex items-center gap-1">
          <LogOut size={14} />
          Logout
        </Button>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* --- LEFT PANEL (Input) --- */}
        <div
          className="
            w-full lg:w-[32%]
            border-r border-border 
            p-6 flex flex-col gap-6 
            overflow-auto
          "
        >
          <Card className="p-5 bg-card border-border space-y-6">

            {/* Title */}
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-lg font-bold">Strategy Input</h2>
            </div>

            {/* Select Asset */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Asset</label>
              <Select value={asset} onValueChange={setAsset}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                  <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Strategy Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Trading Strategy
              </label>
              <Textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Describe your strategy..."
                className="min-h-[120px] bg-secondary border-border text-sm"
              />
            </div>

            {/* Run Backtest */}
            <Button
              onClick={runBacktest}
              disabled={!strategy.trim() || loading}
              className="w-full h-11 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Running…
                </>
              ) : (
                "Run Backtest"
              )}
            </Button>

            {/* Example Strategies */}
            <div className="pt-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Example Strategies
              </p>
              {exampleStrategies.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setStrategy(ex)}
                  className="
                    w-full text-left p-3 rounded bg-secondary 
                    hover:bg-secondary/80 text-xs 
                    text-muted-foreground hover:text-foreground
                  "
                >
                  {ex}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* --- RIGHT PANEL (Results) --- */}
        <div className="flex-1 p-6 overflow-auto">

          {/* BEFORE RUN */}
          {!resultsVisible ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Run a backtest to see results.</p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* METRICS GRID */}
              <Card className="p-6 bg-card border-border">
                <h2 className="text-lg font-semibold mb-4">Backtest Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Metric label="Win Ratio" value="63%" />
                  <Metric label="Loss Ratio" value="37%" />
                  <Metric label="Total Trades" value="52" />
                  <Metric label="Avg Win %" value="3.6%" />
                  <Metric label="Avg Loss %" value="-1.7%" />
                  <Metric label="Sharpe Ratio" value="1.18" />
                  <Metric label="Profit Factor" value="1.68" />
                  <Metric label="Max Drawdown" value="13%" />
                </div>
              </Card>

              {/* CHART */}
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-2 mb-3">
                  <LineChart className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Equity Curve</h3>
                </div>
                <div className="h-56 bg-secondary rounded flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 opacity-30" />
                </div>
              </Card>

              {/* Strategy Interpretation */}
              <Card className="p-6 bg-card border-border space-y-2">
                <h3 className="font-semibold">Strategy Interpretation</h3>
                <p className="text-sm text-muted-foreground">
                  (AI will generate insights once backend is connected)
                </p>
                <div className="text-xs p-3 rounded bg-secondary">
                  {strategy}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Metric Component --- */
function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 rounded bg-secondary flex flex-col">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
