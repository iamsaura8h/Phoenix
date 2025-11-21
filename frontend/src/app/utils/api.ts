// File: src/app/utils/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

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

// Example placeholder for future backtest integration
export async function runBacktestApi(payload: {
  asset: string;
  strategy: string;
}) {
  // TODO: Update endpoint path to match your FastAPI route
  const res = await fetch(`${API_BASE}/api/backtest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to run backtest");
  }

  return res.json();
}
