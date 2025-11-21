// File: src/app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import StrategyInputPanel from "../components/dashboard/StrategyInputPanel";
import ResultsPanel from "../components/dashboard/ResultsPanel";
import { getUser, logoutLocal } from "../utils/auth";

type PhoenixUser = {
  name?: string;
  email?: string;
  [key: string]: any;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<PhoenixUser | null>(null);

  // Strategy Inputs
  const [asset, setAsset] = useState("BTC");
  const [strategy, setStrategy] = useState("");

  // NEW: Timeframe + Data Range
  const [timeframe, setTimeframe] = useState("1h");      // default 1 hour candles
  const [dataRange, setDataRange] = useState("30d");     // default 30 days

  // UI State
  const [loading, setLoading] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  // Client-side auth guard
  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
  }, [router]);

  const handleLogout = () => {
    logoutLocal();
    router.replace("/login");
  };

  // Updated runBacktest: now includes timeframe + dataRange
  const runBacktest = async (
    assetSymbol: string,
    strat: string,
    selectedTimeframe: string,
    selectedRange: string
  ) => {
    setLoading(true);
    try {
      console.log("Running backtest for:", {
        assetSymbol,
        strat,
        selectedTimeframe,
        selectedRange,
      });

      // In future:
      /*
      await runBacktestApi({
        asset: assetSymbol,
        strategy: strat,
        timeframe: selectedTimeframe,
        range: selectedRange
      });
      */

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResultsVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userName={user?.name} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <StrategyInputPanel
          asset={asset}
          setAsset={setAsset}
          strategy={strategy}
          setStrategy={setStrategy}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          dataRange={dataRange}
          setDataRange={setDataRange}
          loading={loading}
          onRunBacktest={() =>
            runBacktest(asset, strategy, timeframe, dataRange)
          }
        />

        <ResultsPanel resultsVisible={resultsVisible} strategy={strategy} />
      </div>
    </div>
  );
}
