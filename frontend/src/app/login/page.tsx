"use client";

import GoogleLoginButton from "../components/GoogleLoginButton"

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Phoenix Login</h1>
      <p className="text-gray-500">Sign in to continue</p>
      <GoogleLoginButton />
    </main>
  );
}
