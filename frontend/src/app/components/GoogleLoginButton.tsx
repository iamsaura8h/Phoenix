"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function GoogleLoginButton() {
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
      localStorage.setItem("phoenix_user", JSON.stringify(user));
      document.cookie = `phoenix_user=${encodeURIComponent(
        JSON.stringify(user)
      )}; path=/; max-age=86400`;

      // Show toast (persists through navigation)
      toast.success(`Welcome ${user.name}!`, {
        description: "You’ve successfully logged in.",
      });

      // Soft redirect (client-side)
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Login failed", { description: "Please try again later." });
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google login failed")}
      />
    </div>
  );
}
