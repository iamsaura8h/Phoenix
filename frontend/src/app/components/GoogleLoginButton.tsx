"use client";

import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function GoogleLoginButton() {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`,
        { token }
      );

      const user = res.data.user;
      console.log("✅ Logged in user:", user);

      // Save to localStorage for session
      localStorage.setItem("phoenix_user", JSON.stringify(user));

      alert("✅ Login successful!");
      window.location.href = "/"; // redirect to homepage/dashboard
    } catch (error) {
      console.error(error);
      alert("❌ Login failed");
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => alert("Login failed")}
      />
    </div>
  );
}
