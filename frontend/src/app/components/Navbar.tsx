// File: src/app/components/Navbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type NavbarProps = {
  userName?: string;
  onLogout: () => void;
};

export default function Navbar({ userName, onLogout }: NavbarProps) {
  return (
    <header className="w-full border-b border-border py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-primary">CryptoTrack</h1>
      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-xs text-muted-foreground max-w-[140px] truncate">
            {userName}
          </span>
        )}
        <Button
          variant="outline"
          className="h-8 text-sm px-3 flex items-center gap-1"
          onClick={onLogout}
        >
          <LogOut size={14} />
          Logout
        </Button>
      </div>
    </header>
  );
}
