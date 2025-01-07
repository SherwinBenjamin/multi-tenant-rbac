"use client";

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Path=/; SameSite=Lax;`;
}

async function refreshTokens() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    if (!res.ok) {
      throw new Error("Refresh failed");
    }
    const data = await res.json();
    setCookie("ACCESS_TOKEN", data.accessToken);
    setCookie("REFRESH_TOKEN", data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  const token = getCookie("ACCESS_TOKEN");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    const didRefresh = await refreshTokens();
    if (!didRefresh) {
      throw new Error("Unauthorized, please log in");
    }

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
