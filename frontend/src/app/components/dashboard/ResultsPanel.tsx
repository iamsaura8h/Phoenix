// File: src/app/components/dashboard/ResultsPanel.tsx
"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, LineChart, Loader2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import Metric from "./Metric";
import EquityChart from "./EquityChart";
import TradeLogTable from "./TradeLogTable";

type ResultsPanelProps = {
  resultsVisible: boolean;
  strategy: string;
  result?: any;
  rules?: any;
  loading?: boolean;
};

export default function ResultsPanel({
  resultsVisible,
  strategy,
  result,
  rules,
  loading = false,
}: ResultsPanelProps) {
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const [activeTab, setActiveTab] = useState<"summary" | "chart" | "log">("summary");

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, tab: "summary" | "chart" | "log") => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 🔥 Loading or empty state
  if (!resultsVisible || !result) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="w-12 h-12 mb-3 animate-spin text-primary" />
              <p className="text-sm font-medium">Running backtest...</p>
              <p className="text-xs mt-2 opacity-60">This may take a few seconds</p>
            </>
          ) : (
            <>
              <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Run a backtest to see results.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // 🔥 Parse buy/sell rules for user-friendly display
  const buyRule = rules?.buy || {};
  const sellRule = rules?.sell || {};

  const formatRule = (rule: any, type: "buy" | "sell") => {
    if (!rule || Object.keys(rule).length === 0) {
      return `No ${type} rule detected`;
    }

    const indicator = rule.indicator || "Unknown";
    const condition = rule.condition || rule.operator || "?";
    const value = rule.value;
    const compareTo = rule.compare_to;
    const movingAverage = rule.moving_average;

    // Price crosses SMA
    if (indicator === "Price" && movingAverage) {
      const period = movingAverage.period;
      if (condition === "crosses_above") {
        return `${type === "buy" ? "Enter" : "Exit"} when price crosses above ${period}-period SMA`;
      }
      if (condition === "crosses_below") {
        return `${type === "buy" ? "Enter" : "Exit"} when price crosses below ${period}-period SMA`;
      }
    }

    // EMA crosses EMA
    if (compareTo) {
      if (condition === "crosses_above") {
        return `${type === "buy" ? "Enter" : "Exit"} when ${indicator} crosses above ${compareTo}`;
      }
      if (condition === "crosses_below") {
        return `${type === "buy" ? "Enter" : "Exit"} when ${indicator} crosses below ${compareTo}`;
      }
    }

    // RSI or simple comparisons
    if (value !== null && value !== undefined) {
      const comparisonText = condition === "<" ? "falls below" : condition === ">" ? "rises above" : condition;
      return `${type === "buy" ? "Enter" : "Exit"} when ${indicator} ${comparisonText} ${value}`;
    }

    // Price crosses EMA (without compare_to)
    if (condition === "crosses_above") {
      return `${type === "buy" ? "Enter" : "Exit"} when price crosses above ${indicator}`;
    }
    if (condition === "crosses_below") {
      return `${type === "buy" ? "Enter" : "Exit"} when price crosses below ${indicator}`;
    }

    return `${type}: ${indicator} ${condition} ${value || compareTo || ""}`;
  };

  const buyDescription = formatRule(buyRule, "buy");
  const sellDescription = formatRule(sellRule, "sell");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 🔥 FIXED: Sticky Navigation with consistent styling */}
      <div className="sticky top-0 z-30 bg-background border-b border-border px-6 py-3">
        <div className="flex gap-3 items-center">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "summary"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => scrollTo(summaryRef, "summary")}
          >
            Summary
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "chart"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => scrollTo(chartRef, "chart")}
          >
            Chart
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "log"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => scrollTo(logRef, "log")}
          >
            Trade Log
          </button>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Total Trades:</span>
            <span className="font-bold text-foreground">{result.total_trades}</span>
          </div>
        </div>
      </div>

      {/* 🔥 Scrollable Content */}
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Summary */}
        <div ref={summaryRef}>
          <Card className="p-6 bg-card border-border">
            <h2 className="text-lg font-semibold mb-4">Backtest Summary</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <Metric label="Win Ratio" value={`${(result.win_ratio * 100).toFixed(1)}%`} />
              <Metric label="Loss Ratio" value={`${(result.loss_ratio * 100).toFixed(1)}%`} />
              <Metric label="Total Trades" value={result.total_trades} />
              <Metric label="Profit Factor" value={result.profit_factor.toFixed(2)} />
              <Metric label="Final Equity" value={`$${result.final_equity.toFixed(2)}`} />
              <Metric
                label="Avg Win %"
                value={
                  result.trades.filter((t: any) => t.pl_pct > 0).length > 0
                    ? (
                        (result.trades
                          .filter((t: any) => t.pl_pct > 0)
                          .reduce((a: number, b: any) => a + b.pl_pct, 0) /
                          result.trades.filter((t: any) => t.pl_pct > 0).length) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"
                }
              />
              <Metric
                label="Avg Loss %"
                value={
                  result.trades.filter((t: any) => t.pl_pct <= 0).length > 0
                    ? (
                        (Math.abs(
                          result.trades
                            .filter((t: any) => t.pl_pct <= 0)
                            .reduce((a: number, b: any) => a + b.pl_pct, 0)
                        ) /
                          result.trades.filter((t: any) => t.pl_pct <= 0).length) *
                        100
                      ).toFixed(2) + "%"
                    : "0%"
                }
              />
              <Metric label="Sample Points" value={result.equity_curve ? result.equity_curve.length : 0} />
            </div>
          </Card>
        </div>

        {/* Chart */}
        <div ref={chartRef}>
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-3">
              <LineChart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Equity Curve</h3>
            </div>

            <EquityChart equityCurve={result.equity_curve} />
          </Card>
        </div>

        {/* Trade Log */}
        <div ref={logRef}>
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold mb-3">Trade Log</h3>
            <TradeLogTable trades={result.trades} />
          </Card>
        </div>

        {/* 🔥 USER-FRIENDLY Strategy Interpretation */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Strategy Rules</h3>
          </div>

          <div className="space-y-4">
            {/* Buy Rule */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-400 mb-1">Entry Condition</p>
                <p className="text-sm text-foreground">{buyDescription}</p>
              </div>
            </div>

            {/* Sell Rule */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <TrendingDown className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400 mb-1">Exit Condition</p>
                <p className="text-sm text-foreground">{sellDescription}</p>
              </div>
            </div>

            {/* Original Strategy Text */}
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Your Strategy</p>
              <p className="text-sm text-foreground italic">&ldquo;{strategy}&rdquo;</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}