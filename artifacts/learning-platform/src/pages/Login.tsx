import { useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Hash, Lock, ShieldCheck, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { setToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import VerifyEmail from "./VerifyEmail";

export default function Login() {
  const [, navigate] = useLocation();
  const { refetch } = useAuth();

  const [form, setForm] = useState({ studentId: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [verifyState, setVerifyState] = useState<{
    userId: number;
    token: string;
    email: string;
  } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 403 && data.requiresVerification) {
        setVerifyState({
          userId: data.userId,
          token: data.token,
          email: data.email ?? form.studentId,
        });
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      setToken(data.token);
      await refetch();
      navigate("/dashboard");
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verifyState) {
    return (
      <VerifyEmail
        userId={verifyState.userId}
        token={verifyState.token}
        email={verifyState.email}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/">
            <span className="flex cursor-pointer items-center gap-2 font-semibold text-primary">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              Quiz Your Mind
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card shadow-md px-8 py-10">
            <div className="mb-7 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Welcome back
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to continue your learning journey
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="studentId" className="block text-sm font-medium text-foreground">
                  Student ID
                </label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    required
                    placeholder="e.g. 20412345"
                    value={form.studentId}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register">
                  <span className="cursor-pointer font-medium text-primary hover:underline">
                    Register here
                  </span>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2026 Quiz Your Mind. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure Login
              </span>
              <div className="flex gap-3">
                {[Facebook, Twitter, Linkedin, Github].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
