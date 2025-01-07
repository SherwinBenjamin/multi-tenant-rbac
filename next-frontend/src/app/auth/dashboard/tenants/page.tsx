"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function TenantsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tenants,setTenants] = useState<any[]>([]);
  const [tenantName, setTenantName] = useState("");

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    try {
      const data = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/tenants`
      );
      setTenants(data);
    } catch (err) {
      console.error("Failed to load tenants:", err);
    }
  }

  async function createTenant() {
    try {
      await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tenants`, {
        method: "POST",
        body: JSON.stringify({ name: tenantName }),
      });
      setTenantName("");
      loadTenants();
    } catch (err) {
      console.error("Failed to create tenant:", err);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Tenants (Superadmin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Tenant Name"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          />
          <Button onClick={createTenant}>Create</Button>
        </div>
        <ul className="mt-4 space-y-1">
          {tenants.map((t) => (
            <li key={t._id} className="border rounded p-2">
              {t.name}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
