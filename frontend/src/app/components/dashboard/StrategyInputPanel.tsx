// File: src/app/components/dashboard/StrategyInputPanel.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Loader2, TrendingUp } from "lucide-react";
import { validateStrategy } from "@/app/utils/api";

type StrategyInputPanelProps = {
  asset: string;
  setAsset: (value: string) => void;

  strategy: string;
  setStrategy: (value: string) => void;

  timeframe: string;
  setTimeframe: (value: string) => void;

  dataRange: string;
  setDataRange: (value: string) => void;

  loading: boolean;
  onRunBacktest: () => void;
};

export default function StrategyInputPanel({
  asset,
  setAsset,
  strategy,
  setStrategy,
  timeframe,
  setTimeframe,
  dataRange,
  setDataRange,
  loading,
  onRunBacktest,
}: StrategyInputPanelProps) {
  const [validation, setValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  // -------------------------------
  // VALIDATION HANDLER (debounced)
  // -------------------------------
  useEffect(() => {
    if (!strategy.trim()) {
      setValidation(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsValidating(true);
      const result = await validateStrategy(strategy);
      setValidation(result);
      setIsValidating(false);
    }, 450); // debounce

    return () => clearTimeout(timeout);
  }, [strategy]);

const exampleStrategies = [
  "Buy when RSI falls below 30 and sell when RSI rises above 70.",
  "Buy when price crosses above the 20 EMA and sell when price crosses below the 20 EMA.",
  "Buy when price crosses above the 20 SMA and sell when price crosses below the 20 SMA.",
  "Buy when the 20 EMA crosses above the 50 EMA and sell when the 20 EMA crosses below the 50 EMA.",
  "Buy when MACD is above the signal line and sell when MACD is below the signal line."
];


  return (
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

        {/* Timeframe */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Timeframe</label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="1m">1 minute</SelectItem>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="4h">4 hours</SelectItem>
              <SelectItem value="1d">1 day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Data Range
          </label>
          <Select value={dataRange} onValueChange={setDataRange}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last 1 year</SelectItem>
              <SelectItem value="2y">Last 2 years</SelectItem>
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

        {/* VALIDATION MESSAGES */}
        {isValidating && (
          <div className="text-xs text-blue-400">Validating strategy…</div>
        )}

        {validation && !validation.valid && (
          <div className="bg-yellow-500/10 p-3 rounded text-xs text-yellow-400 space-y-1">
            <p className="font-semibold">⚠ Strategy Issue:</p>
            <p>{validation.error}</p>

            {validation.suggestions?.length > 0 && (
              <div className="pt-2">
                <p className="font-semibold">Suggestions:</p>
                {validation.suggestions.map((s: string, i: number) => (
                  <p key={i}>• {s}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {validation && validation.valid && (
          <div className="bg-green-500/10 p-3 rounded text-xs text-green-400 space-y-1">
            <p className="font-semibold">Strategy looks good ✓</p>
          </div>
        )}

        {/* Run Backtest */}
        <Button
          onClick={onRunBacktest}
          disabled={
            !strategy.trim() ||
            loading ||
            isValidating ||
            (validation && !validation.valid)
          }
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
  );
}
