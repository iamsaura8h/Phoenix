// File: src/app/components/dashboard/ResultsPanel.tsx
"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, LineChart } from "lucide-react";
import Metric from "./Metric";

type ResultsPanelProps = {
  resultsVisible: boolean;
  strategy: string;
};

export default function ResultsPanel({
  resultsVisible,
  strategy,
}: ResultsPanelProps) {
  if (!resultsVisible) {
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
          {strategy || "Your strategy description will appear here."}
        </div>
      </Card>
    </div>
  );
}
