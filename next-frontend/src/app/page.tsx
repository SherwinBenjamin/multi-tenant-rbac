"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex items-center min-h-screen p-6 bg-[#121212] text-[#E0E0E0] ">
      <Card className="max-w-md mx-auto bg-[#1E1E1E] text-[#E0E0E0] px-12 py-8">
        <CardHeader>
          <CardTitle className="mx-auto text-xl text-[#E0E0E0]">
            Multi Tenant RBAC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-2">
            <Link href="/auth/login">
              <Button
                variant="default"
                className="bg-[#303030] text-[#E0E0E0] hover:bg-[#424242]"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="outline"
                className="border border-[#E0E0E0] text-[#424242] hover:bg-[#424242]"
              >
                Register
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
