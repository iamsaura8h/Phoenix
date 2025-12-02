// File: src/app/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import StrategyInputPanel from "../components/dashboard/StrategyInputPanel";
import ResultsPanel from "../components/dashboard/ResultsPanel";
import { getUser, logoutLocal } from "../utils/auth";
import { runBacktestApi } from "../utils/api";

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

  // Timeframe + Data Range
  const [timeframe, setTimeframe] = useState("1h");
  const [dataRange, setDataRange] = useState("30d");

  // UI State
  const [loading, setLoading] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);

  // Backend result & rules
  const [rules, setRules] = useState<any>(null);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  // Auth Guard
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

  // ---- REAL Backtest API Call (FIXED) ----
  const runBacktest = async () => {
    if (!strategy.trim()) return;

    setLoading(true);
    setResultsVisible(false);

    // 🔥 CRITICAL FIX: Clear old results immediately
    setBacktestResult(null);
    setRules(null);

    try {
      console.log("🔄 Calling backend backtest API...");

      const response = await runBacktestApi({
        asset,
        strategy,
        timeframe,
        range: dataRange,
      });

      console.log("✅ Backend response:", response);

      // Set new results
      setRules(response.rules);
      setBacktestResult(response.result);
      setResultsVisible(true);
    } catch (error: any) {
      console.error("❌ Backtest failed:", error);
      alert(error.message || "Backtest failed");

      // 🔥 Also clear on error
      setBacktestResult(null);
      setRules(null);
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
          onRunBacktest={runBacktest}
        />

        <ResultsPanel
          resultsVisible={resultsVisible}
          strategy={strategy}
          result={backtestResult}
          rules={rules}
          loading={loading} // 🔥 NEW: Pass loading state
        />
      </div>
    </div>
  );
}
