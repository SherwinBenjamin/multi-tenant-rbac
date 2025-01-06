// lib/api.ts
"use client";

// Utility: Get a cookie by name
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

// Utility: Set a cookie with unified attributes
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/; SameSite=Lax;`;
}

async function refreshTokens() {
  try {
    // Example: calling NestJS at /auth/refresh-token
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Refresh failed");
    }
    const data = await res.json(); // { accessToken, refreshToken }
    setCookie("ACCESS_TOKEN", data.accessToken);
    setCookie("REFRESH_TOKEN", data.refreshToken);
    return true;
  } catch (err) {
    return false;
  }
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  // Build new Headers from whatever might be in options.headers
  const headers = new Headers(options.headers);
  // Ensure we have JSON content-type
  headers.set("Content-Type", "application/json");

  // Attach token if we have one
  const token = getCookie("ACCESS_TOKEN");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // ensure cookies get sent
  });

  // If unauthorized => attempt refresh
  if (response.status === 401) {
    const didRefresh = await refreshTokens();
    if (!didRefresh) {
      throw new Error("Unauthorized, please log in");
    }

    // Try original request again
    const refreshedToken = getCookie("ACCESS_TOKEN");
    const retryHeaders = new Headers(options.headers);
    retryHeaders.set("Content-Type", "application/json");
    if (refreshedToken) {
      retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);
    }

    response = await fetch(url, {
      ...options,
      headers: retryHeaders,
      credentials: "include",
    });
  }

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`API Error: ${errorMsg}`);
  }

  return response.json();
}
