"use client";
import { useState, useEffect } from "react";
import { getUser } from "./utils/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [userCount, setUserCount] = useState<number>(0); // new
  const router = useRouter();

  useEffect(() => {
    const u = getUser();
    if (!u) router.push("/login");
    else setUser(u);
  }, [router]);

  // ✅ Fetch total users
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/users`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUserCount(data.count);
      } catch (err) {
        console.error("❌ Error fetching user count:", err);
      }
    };
    fetchUserCount();
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    setShowModal(false);
    toast.success("Logged out successfully 👋");

    // clear local data
    localStorage.removeItem("phoenix_user");
    document.cookie = "phoenix_user=; path=/; max-age=0";

    // soft navigation so toast persists
    setTimeout(() => {
      router.push("/login");
    }, 800);
  };

  return (
    <div className="p-8">
      <h1 className="font-bold text-4xl">CryptoTrack Dashboard</h1>
      <p className="text-gray-600 mb-4">Welcome, {user.name}</p>

      {/* ✅ Total Users */}
      <div className="my-4 p-4 border border-amber-200 rounded-lg bg-amber-50 w-fit">
        <p className="text-gray-700 font-medium">
          🔥 Total Registered Users:{" "}
          <span className="font-bold text-amber-700">{userCount}</span>
        </p>
      </div>

      {/* Logout Button */}
      <div className="py-4">
        <button
          className="px-4 py-1 bg-amber-300 border-2 rounded text-black hover:bg-amber-400 transition"
          onClick={() => setShowModal(true)}
        >
          Logout
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred semi-transparent backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal box */}
          <div className="relative bg-gray-50 rounded-lg p-6 w-80 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1 rounded border-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded bg-amber-500 text-black hover:bg-red-500 border-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
