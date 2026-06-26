"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthControls() {
  const router = useRouter();
  const [authEnabled, setAuthEnabled] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((data) => {
        setAuthEnabled(data.enabled);
        setAuthenticated(data.authenticated);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Link
        href="/admin"
        className="text-xs text-keuka-slate hover:text-keuka-accent transition hidden sm:inline"
      >
        Admin
      </Link>
      {authEnabled && authenticated && (
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-keuka-slate hover:text-keuka-accent transition"
        >
          Sign out
        </button>
      )}
    </div>
  );
}
