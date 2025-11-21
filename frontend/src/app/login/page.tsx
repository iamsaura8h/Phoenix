// File: src/app/login/page.tsx
"use client";

import GoogleLoginButton from "../components/GoogleLoginButton";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 bg-card border-border space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to CryptoTrack</h1>
          <p className="text-sm text-muted-foreground">
            Log in with your Google account to start backtesting your strategies.
          </p>
        </div>

        <div className="pt-2">
          <GoogleLoginButton redirectPath="/home" />
        </div>

        <p className="text-[11px] text-center text-muted-foreground pt-2">
          By continuing, you agree that this app is for educational and research
          purposes only.
        </p>
      </Card>
    </main>
  );
}
