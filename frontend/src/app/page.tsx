"use client";

import { useState } from "react";

export default function Home() {
  const [asset, setAsset] = useState("");
  const [strategy, setStrategy] = useState("");

  return (
    <div className="p-8">
      <h1 className="font-bold text-4xl">Phoenix</h1>
      <h2 className="text-sm text-gray-600">Crypto Trading App</h2>

      <h3 className="mt-6 font-semibold italic">
        Trading made simpler.
        <br /> Choose asset → input strategy → submit
        <br /> Get your backtested win/lose ratio.
      </h3>

      {/* ASSET SELECT */}
      <label
        htmlFor="asset"
        className="block mt-6 mb-2 text-sm font-medium text-gray-900"
      >
        Select Asset
      </label>

      <select
        id="asset"
        value={asset}
        onChange={(e) => setAsset(e.target.value)}
        className="border p-2 rounded-lg"
      >
        <option value="">Choose an asset</option>
        <option value="DOGEUSDT">Dogecoin</option>
        <option value="ETHUSDT">Ethereum</option>
        <option value="SOLUSDT">Solana</option>
      </select>

      {/* STRATEGY INPUT */}
      <div className="mt-4">
        <label className="block">Input your strategy</label>
        <input
          type="text"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          className="border p-2 rounded-lg w-full"
        />
      </div>

      <button
        type="button"
        className="mt-4 border-2 bg-amber-300 px-4 py-2 rounded-lg"
      >
        Submit
      </button>

      {/* RESULTS */}
      <div className="py-6">
        <p className="font-semibold">Results:</p>
        <ul className="list-disc ml-6">
          <li>win ratio: 40%</li>
          <li>loss ratio: 60%</li>
          <li>avg win ratio: 30%</li>
        </ul>
      </div>
    </div>
  );
}
