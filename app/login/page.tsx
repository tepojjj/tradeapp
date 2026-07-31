"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/portfolio");
      router.refresh();
    }
  }

  return (
    <div className="max-w-sm mx-auto py-12">
      <h1 className="font-display text-3xl text-ivory mb-1">
        {mode === "signin" ? "Sign in" : "Create an account"}
      </h1>
      <p className="text-dim text-sm mb-6">
        {mode === "signin"
          ? "Welcome back to your paper-trading desk."
          : "Starts you off with $100,000 in simulated cash."}
      </p>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs text-dim mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-board-raised border border-board-line rounded-sm px-3 py-2 text-ivory focus:outline-none focus:ring-1 focus:ring-amber"
          />
        </div>
        <div>
          <label className="block text-xs text-dim mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-board-raised border border-board-line rounded-sm px-3 py-2 text-ivory focus:outline-none focus:ring-1 focus:ring-amber"
          />
        </div>

        {error && <p className="text-loss text-sm">{error}</p>}

        <button
          disabled={busy}
          type="submit"
          className="w-full bg-amber text-board font-medium py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-dim text-xs mt-4 underline"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
