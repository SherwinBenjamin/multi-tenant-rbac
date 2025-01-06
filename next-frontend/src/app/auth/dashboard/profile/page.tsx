"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`);
      setProfile(data);
      setEmail(data.email);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }

  async function updateProfile() {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
        method: "PUT",
        body: JSON.stringify({ email, password }),
      });
      setPassword("");
      // refresh UI
      loadProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={updateProfile}>Save</Button>
        <p className="text-sm text-gray-500 mt-4">Current role: {profile.role}</p>
      </CardContent>
    </Card>
  );
}
