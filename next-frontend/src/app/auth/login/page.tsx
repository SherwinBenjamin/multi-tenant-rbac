"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

     
      document.cookie = `ACCESS_TOKEN=${data.accessToken}; Path=/; SameSite=Lax;`;
      document.cookie = `REFRESH_TOKEN=${data.refreshToken}; Path=/; SameSite=Lax;`;

      
      router.push("/auth/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials.");
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-[#121212] text-[#E0E0E0]">
      <Card className="max-w-md mx-auto bg-[#1E1E1E] text-[#E0E0E0] px-12 py-8">
        <CardHeader className="border-b my-5 border-[#424242] p-4 text-center">
          <CardTitle className="mx-auto text-xl text-[#E0E0E0]">LOGIN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#424242]"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#424242]"
          />
          <Button
            onClick={handleLogin}
            variant="default"
            className="w-full bg-[#303030] text-[#E0E0E0] hover:bg-blue-500"
          >
            Login
          </Button>
          <p className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
