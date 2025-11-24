// File: src/app/components/dashboard/ResultsPanel.tsx
"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3, LineChart } from "lucide-react";
import Metric from "./Metric";
import EquityChart from "./EquityChart";
import TradeLogTable from "./TradeLogTable";

type ResultsPanelProps = {
  resultsVisible: boolean;
  strategy: string;
  result?: any;
  rules?: any;
};

export default function ResultsPanel({
  resultsVisible,
  strategy,
  result,
  rules,
}: ResultsPanelProps) {
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!resultsVisible || !result) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Run a backtest to see results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto space-y-6">
      {/* Sticky nav */}
      <div className="sticky top-4 z-20">
        <div className="flex gap-2 items-center p-2 bg-background/60 rounded">
          <button
            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-sm"
            onClick={() => scrollTo(summaryRef)}
          >
            Summary
          </button>
          <button
            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-sm"
            onClick={() => scrollTo(chartRef)}
          >
            Chart
          </button>
          <button
            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-sm"
            onClick={() => scrollTo(logRef)}
          >
            Trade Log
          </button>
          <div className="ml-auto text-xs text-muted-foreground">Trades: {result.total_trades}</div>
        </div>
      </div>

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
                result.trades.length
                  ? (
                      (result.trades.filter((t: any) => t.pl_pct > 0).reduce((a: number, b: any) => a + b.pl_pct, 0) /
                        result.trades.filter((t: any) => t.pl_pct > 0).length) *
                      100
                    ).toFixed(2) + "%"
                  : "0%"
              }
            />
            <Metric
              label="Avg Loss %"
              value={
                result.trades.length
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
            <Metric
              label="Sample Points"
              value={result.equity_curve ? result.equity_curve.length : 0}
            />
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

      {/* Strategy Interpretation */}
      <Card className="p-6 bg-card border-border space-y-3">
        <h3 className="font-semibold">Strategy Interpretation</h3>
        {rules ? (
          <pre className="text-xs bg-secondary p-3 rounded overflow-auto">{JSON.stringify(rules, null, 2)}</pre>
        ) : (
          <p className="text-sm text-muted-foreground">No rules found.</p>
        )}
        <div className="text-xs p-3 rounded bg-secondary">{strategy || "Your strategy will appear here."}</div>
      </Card>
    </div>
  );
}
