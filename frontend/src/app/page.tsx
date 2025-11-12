"use client";
import { useState, useEffect } from "react";
import { getUser } from "./utils/auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) window.location.href = "/login";
    else setUser(u);
  }, []);

  if (!user) return null;

  return (
    <div className="p-8">
      <h1 className="font-bold text-4xl">Phoenix Dashboard</h1>
      <p className="text-gray-600 mb-4">Welcome, {user.name}</p>
    </div>
  );
}
