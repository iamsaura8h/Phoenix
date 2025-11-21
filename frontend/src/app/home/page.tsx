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
  const [asset, setAsset] = useState("BTC");
  const [strategy, setStrategy] = useState("");
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

  // TODO: Replace with real backend call once your FastAPI endpoint is ready
  const runBacktest = async (assetSymbol: string, strat: string) => {
    setLoading(true);
    try {
      console.log("Running backtest for:", { assetSymbol, strat });
      // Example (when backend is ready):
      // await runBacktestApi({ asset: assetSymbol, strategy: strat });

      await new Promise((resolve) => setTimeout(resolve, 1000)); // mock delay
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
          loading={loading}
          onRunBacktest={runBacktest}
        />
        <ResultsPanel resultsVisible={resultsVisible} strategy={strategy} />
      </div>
    </div>
  );
}
