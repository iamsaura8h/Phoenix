// File: src/app/components/dashboard/EquityChart.tsx
"use client";

import React from "react";

type EquityChartProps = {
  equityCurve: number[] | undefined | null;
};

/**
 * Lightweight sparkline-like chart using inline SVG.
 * Keeps things simple for MVP and avoids extra deps.
 */
export default function EquityChart({ equityCurve }: EquityChartProps) {
  if (!equityCurve || equityCurve.length === 0) {
    return (
      <div className="h-56 bg-secondary rounded flex items-center justify-center text-muted-foreground">
        No equity data
      </div>
    );
  }

  // downsample to avoid too many points (keep last 200 points)
  const maxPoints = 200;
  const data =
    equityCurve.length > maxPoints
      ? equityCurve.slice(equityCurve.length - maxPoints)
      : equityCurve;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const width = 800;
  const height = 180;
  const pad = 10;

  const normalize = (v: number) =>
    height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);

  const step = (width - pad * 2) / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => `${pad + i * step},${normalize(v)}`)
    .join(" ");

  return (
    <div className="h-56 bg-secondary rounded p-3">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* filled area */}
        <polyline
          points={`${pad},${height - pad} ${points} ${width - pad},${height - pad}`}
          fill="url(#g1)"
          stroke="none"
        />

        {/* line */}
        <polyline
          points={points}
          fill="none"
          stroke="#06b6d4"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
