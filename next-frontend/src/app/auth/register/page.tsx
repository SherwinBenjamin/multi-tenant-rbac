"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tenantId, setTenantId] = useState("")
  const [role, setRole] = useState("user")

  async function handleRegister() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tenantId, role }),
      })
      if (!res.ok) throw new Error("Registration failed")
      // upon success, go to login
      router.push("/auth/login")
    } catch {
      alert("Registration failed.")
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-[#121212] text-[#E0E0E0]">
      <Card className="max-w-md mx-auto bg-[#1E1E1E] text-[#E0E0E0] px-12 py-8">
        <CardHeader>
          <CardTitle className="mx-auto text-xl text-[#E0E0E0]">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#424242]"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#424242]"
          />
          <Input
            placeholder="Tenant ID"
            value={tenantId}
            onChange={e => setTenantId(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#424242]"
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#424242] rounded text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-[#424242]"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
          <Button
            onClick={handleRegister}
            variant="default"
            className="w-full bg-[#303030] text-[#E0E0E0] hover:bg-blue-500"
          >
            Register
          </Button>
          <p className="text-center">
            Already have an account?{" "}
            <a href="/auth/login" className= "text-blue-500 hover:underline">
              Login
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
