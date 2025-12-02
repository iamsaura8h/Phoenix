// File: src/app/utils/api.ts

export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

// -----------------------------
// GET ALL USERS
// -----------------------------
export async function getAllUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/users`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return { count: 0, users: [] };
  }
}

// -----------------------------
// RUN BACKTEST (REAL BACKEND)
// -----------------------------
export async function runBacktestApi(payload: {
  asset: string;
  strategy: string;
  timeframe: string;
  range: string;
}) {
  const res = await fetch(`${API_BASE}/api/backtest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to run backtest");
  }

  return res.json();
}

// -----------------------------
// STRATEGY VALIDATION
// -----------------------------
export async function validateStrategy(text: string) {
  const res = await fetch(`${API_BASE}/api/strategy/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strategy: text }),
  });

  return res.json();
}
