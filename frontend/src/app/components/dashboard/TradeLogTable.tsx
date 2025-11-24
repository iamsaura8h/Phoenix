// File: src/app/components/dashboard/TradeLogTable.tsx
"use client";

import React from "react";

type Trade = {
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  pl_pct: number;
  pl_usd: number;
};

type Props = {
  trades?: Trade[] | null;
};

function formatPct(p: number) {
  return `${(p * 100).toFixed(2)}%`;
}

function formatUsd(v: number) {
  return `$${v.toFixed(2)}`;
}

export default function TradeLogTable({ trades }: Props) {
  if (!trades || trades.length === 0) {
    return (
      <div className="p-4 bg-secondary rounded text-sm text-muted-foreground">
        No trades executed for this backtest.
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded bg-card border-border">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground bg-secondary">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Entry Time</th>
            <th className="px-3 py-2 text-right">Entry Price</th>
            <th className="px-3 py-2 text-left">Exit Time</th>
            <th className="px-3 py-2 text-right">Exit Price</th>
            <th className="px-3 py-2 text-right">P/L %</th>
            <th className="px-3 py-2 text-right">P/L $</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, idx) => {
            const isWin = t.pl_pct > 0;
            return (
              <tr key={idx} className="border-t border-border">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{t.entry_time}</td>
                <td className="px-3 py-2 text-right">{t.entry_price.toFixed(2)}</td>
                <td className="px-3 py-2">{t.exit_time}</td>
                <td className="px-3 py-2 text-right">{t.exit_price.toFixed(2)}</td>
                <td className={`px-3 py-2 text-right ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatPct(t.pl_pct)}
                </td>
                <td className={`px-3 py-2 text-right ${isWin ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatUsd(t.pl_usd)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
