// File: src/app/components/GoogleLoginButton.tsx
"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type GoogleLoginButtonProps = {
  redirectPath?: string;
};

export default function GoogleLoginButton({
  redirectPath = "/home",
}: GoogleLoginButtonProps) {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`,
        { token }
      );

      const user = res.data.user;
      console.log("✅ Logged in user:", user);

      // Save session data
      if (typeof window !== "undefined") {
        localStorage.setItem("phoenix_user", JSON.stringify(user));
      }
      document.cookie = `phoenix_user=${encodeURIComponent(
        JSON.stringify(user)
      )}; path=/; max-age=86400`;

      toast.success(`Welcome ${user.name}!`, {
        description: "You’ve successfully logged in.",
      });

      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      toast.error("Login failed", { description: "Please try again later." });
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google login failed")}
      />
    </div>
  );
}
