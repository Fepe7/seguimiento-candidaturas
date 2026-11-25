"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function AppHeader({ email }: { email: string }) {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido cerrar la sesión.");
      setSigningOut(false);
    }
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight">Seguimiento de candidaturas</h1>
          <p className="truncate text-xs text-stone-500" title={email}>
            {email}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="shrink-0 rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
        >
          {signingOut ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mx-auto max-w-6xl px-4 pb-3 text-sm text-red-700 sm:px-6">
          {error}
        </p>
      )}
    </header>
  );
}
