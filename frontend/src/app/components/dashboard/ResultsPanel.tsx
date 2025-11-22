// File: src/app/components/dashboard/ResultsPanel.tsx
"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, LineChart } from "lucide-react";
import Metric from "./Metric";

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

      {/* METRICS SUMMARY */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold mb-4">Backtest Summary</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

          <Metric
            label="Win Ratio"
            value={`${(result.win_ratio * 100).toFixed(1)}%`}
          />

          <Metric
            label="Loss Ratio"
            value={`${(result.loss_ratio * 100).toFixed(1)}%`}
          />

          <Metric
            label="Total Trades"
            value={result.total_trades}
          />

          <Metric
            label="Profit Factor"
            value={result.profit_factor.toFixed(2)}
          />

          <Metric
            label="Final Equity"
            value={`$${result.final_equity.toFixed(2)}`}
          />

          <Metric
            label="Avg Win %"
            value={
              result.trades.length
                ? (
                    (result.trades.filter((t: number) => t > 0).reduce((a: number, b: number) => a + b, 0) /
                      result.trades.filter((t: number) => t > 0).length) *
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
                        .filter((t: number) => t <= 0)
                        .reduce((a: number, b: number) => a + b, 0)
                    ) /
                      result.trades.filter((t: number) => t <= 0).length) *
                    100
                  ).toFixed(2) + "%"
                : "0%"
            }
          />
        </div>
      </Card>

      {/* EQUITY CURVE (Simplified Placeholder) */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <LineChart className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Equity Curve</h3>
        </div>

        <div className="h-56 bg-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
          Equity Points: {result.equity_curve.length}
          <br />
          (Integrate full chart later)
        </div>
      </Card>

      {/* RULES + STRATEGY */}
      <Card className="p-6 bg-card border-border space-y-3">
        <h3 className="font-semibold">Strategy Interpretation</h3>

        {/* RULES */}
        {rules ? (
          <pre className="text-xs bg-secondary p-3 rounded">
            {JSON.stringify(rules, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            No rules found.
          </p>
        )}

        {/* RAW STRATEGY */}
        <div className="text-xs p-3 rounded bg-secondary">
          {strategy || "Your strategy will appear here."}
        </div>
      </Card>
    </div>
  );
}
