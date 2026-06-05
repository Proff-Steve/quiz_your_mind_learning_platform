import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Mail, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { setToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface VerifyEmailProps {
  userId: number;
  token: string;
  email: string;
}

export default function VerifyEmail({ userId, token, email }: VerifyEmailProps) {
  const [, navigate] = useLocation();
  const { refetch } = useAuth();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError(null);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      submitCode(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      const next = pasted.split("");
      setCode(next);
      inputRefs.current[5]?.focus();
      submitCode(pasted);
    }
  }

  async function submitCode(otp: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      setVerified(true);
      setToken(token);
      await refetch();
      localStorage.setItem("qym_just_registered", "true");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
        return;
      }
      setResendCooldown(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h2 className="text-xl font-bold text-foreground">Email Verified!</h2>
          <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(0, b.length)) + c);

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
                <Mail className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify your email</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  We sent a 6-digit code to<br />
                  <span className="font-medium text-foreground">{maskedEmail}</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className="h-14 w-11 rounded-lg border-2 border-border bg-background text-center text-xl font-bold text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              ))}
            </div>

            <button
              onClick={() => submitCode(code.join(""))}
              disabled={loading || code.some((d) => !d)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Verifying…</> : "Verify Email"}
            </button>

            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <><Loader2 className="h-3 w-3 animate-spin" />Sending…</>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <><RefreshCw className="h-3 w-3" />Resend code</>
                  )}
                </button>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Quiz Your Mind. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
