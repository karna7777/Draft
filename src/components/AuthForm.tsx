"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { login, register } from "@/lib/api";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/projects";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (isRegister) await register({ email, password, name: name || undefined });
      else await login({ email, password });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="app tone-charcoal auth-app">
      <header className="app-bar">
        <Link href="/" className="brand"><BrandMark />Draft</Link>
        <span className="app-step mono">{isRegister ? "CREATE ACCOUNT" : "SIGN IN"}</span>
        <Link href="/" className="app-exit">Exit</Link>
      </header>

      <main className="auth-main">
        <form className="auth-card" onSubmit={submit}>
          <p className="eyebrow accent">{isRegister ? "Welcome to Draft" : "Welcome back"}</p>
          <h1 className="auth-h">{isRegister ? "Create your studio." : "Sign in to Draft."}</h1>
          <p className="auth-sub">
            {isRegister
              ? "Your home projects, floor plans and designs — saved and ready whenever you return."
              : "Pick up exactly where you left off."}
          </p>

          {error && <div className="auth-error" role="alert">{error}</div>}

          {isRegister && (
            <label className="auth-field">
              <span>Name <em>optional</em></span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" />
            </label>
          )}
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@email.com"
            />
          </label>
          <label className="auth-field">
            <span>Password {isRegister && <em>at least 8 characters</em>}</span>
            <input
              type="password"
              required
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="••••••••"
            />
          </label>

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "One moment…" : isRegister ? "Create account" : "Sign in"}
          </button>

          <p className="auth-switch">
            {isRegister ? (
              <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></>
            ) : (
              <>New to Draft? <Link href={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></>
            )}
          </p>
        </form>
      </main>
    </div>
  );
}
