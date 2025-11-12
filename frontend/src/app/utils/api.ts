export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getAllUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    return { count: 0, users: [] };
  }
}
