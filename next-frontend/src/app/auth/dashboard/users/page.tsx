"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function UsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // useEffect(() => {
  //   loadUsers();
  // }, []);

  // async function loadUsers() {
  //   try {
  //     const data = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`);
  //     setUsers(data);
  //   } catch (err) {
  //     console.error("Failed to load users:", err);
  //   }
  // }

  async function createUser() {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setEmail("");
      setPassword("");
      // loadUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="User email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={createUser}>Create</Button>
        </div>
        <ul className="mt-4 space-y-1">
          {users.map((u) => (
            <li key={u._id} className="border rounded p-2">
              {u.email} - {u.role}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
