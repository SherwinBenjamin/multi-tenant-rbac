"use client";

import { ReactNode, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {jwtDecode} from "jwt-decode";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

type DecodedJWT = {
  sub: string;  // user ID
  aud: string;  // tenant ID
  role: string;
  exp: number;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    const token = getCookie("ACCESS_TOKEN");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedJWT>(token);
        setRole(decoded.role);
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 border-r">
        <ScrollArea className="h-full p-4">
          <nav className="space-y-2">
            <Link href="/auth/dashboard" className="block">
              Dashboard Home
            </Link>

            {/* Only show "Manage Users" if admin or superadmin */}
            {(role === "admin" || role === "superadmin") && (
              <Link href="/auth/dashboard/users" className="block">
                Manage Users
              </Link>
            )}

            {/* Only show "Tenants" if superadmin */}
            {role === "superadmin" && (
              <Link href="/auth/dashboard/tenants" className="block">
                Tenants
              </Link>
            )}

            <Link href="/auth/dashboard/profile" className="block">
              My Profile
            </Link>
          </nav>
        </ScrollArea>
      </aside>
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  );
}
