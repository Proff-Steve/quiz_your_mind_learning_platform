import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Wallet,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

const MOMO_NETWORKS = [
  { value: "mtn", label: "MTN MoMo" },
  { value: "vod", label: "Vodafone Cash" },
  { value: "atl", label: "AirtelTigo Money" },
];

const GHS_AMOUNTS = [5, 10, 20, 50, 100];
const USD_AMOUNTS = [1, 2, 5, 10, 20];

type Step = "form" | "polling" | "success" | "error";

export default function LoadVirtualAccount() {
  const [, navigate] = useLocation();
  const { user, refetch } = useAuth();

  const isGhana = (user?.planCurrency ?? "GHS") === "GHS";
  const currencySymbol = isGhana ? "GH₵" : "$";
  const AMOUNTS = isGhana ? GHS_AMOUNTS : USD_AMOUNTS;

  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState<number>(AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("mtn");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successAmount, setSuccessAmount] = useState("");
  const [pollCount, setPollCount] = useState(0);
  const [pollMessage, setPollMessage] = useState("Waiting for your MoMo approval…");

  const effectiveAmount = customAmount ? parseFloat(customAmount) : amount;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === "polling" && reference) {
      timer = setInterval(async () => {
        setPollCount((c) => c + 1);
        const token = getToken();
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}api/paystack/check-charge/${encodeURIComponent(reference)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json() as { status?: string; message?: string };
          if (data.status === "success") {
            clearInterval(timer);
            await confirmPayment(reference);
          } else if (data.status === "failed" || data.status === "abandoned") {
            clearInterval(timer);
            setErrorMsg("Payment failed or was cancelled. Please try again.");
            setStep("error");
          } else {
            setPollMessage(data.message ?? "Waiting for MoMo confirmation…");
          }
        } catch {
          // keep polling
        }
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [step, reference]);

  useEffect(() => {
    if (pollCount >= 30) {
      setErrorMsg("Payment is taking too long. Please check your MoMo and try again.");
      setStep("error");
    }
  }, [pollCount]);

  async function confirmPayment(ref: string) {
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/virtual-account/load/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reference: ref }),
      });
      const data = await res.json() as { success?: boolean; credited?: string; error?: string };
      if (res.ok && data.success) {
        setSuccessAmount(data.credited ?? effectiveAmount.toFixed(2));
        setStep("success");
        refetch();
      } else {
        setErrorMsg(data.error ?? "Could not confirm payment.");
        setStep("error");
      }
    } catch {
      setErrorMsg("Network error while confirming payment.");
      setStep("error");
    }
  }

  async function handleMoMoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveAmount || effectiveAmount < 1) {
      setErrorMsg("Please enter a valid amount.");
      return;
    }
    if (isGhana && (!phone || phone.length < 9)) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/virtual-account/load/momo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone, provider, amount: effectiveAmount }),
      });
      const data = await res.json() as { status?: string; reference?: string; displayText?: string; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to initiate payment.");
        return;
      }
      if (data.status === "success") {
        setReference(data.reference ?? "");
        await confirmPayment(data.reference ?? "");
      } else {
        setReference(data.reference ?? "");
        setPollMessage(data.displayText ?? "Waiting for your MoMo approval…");
        setStep("polling");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const w = window as unknown as { PaystackPop?: unknown };
      if (w.PaystackPop) { resolve(); return; }
      const existing = document.getElementById("paystack-inline");
      if (existing) { existing.addEventListener("load", () => resolve()); return; }
      const script = document.createElement("script");
      script.id = "paystack-inline";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack script"));
      document.head.appendChild(script);
    });
  }

  async function handleCardPay() {
    if (!effectiveAmount || effectiveAmount < 1) {
      setErrorMsg("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    const token = getToken();
    try {
      await loadPaystackScript();
      const res = await fetch(`${import.meta.env.BASE_URL}api/virtual-account/load/init-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: effectiveAmount }),
      });
      const data = await res.json() as { accessCode?: string; reference?: string; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to initialize payment.");
        setLoading(false);
        return;
      }
      setReference(data.reference ?? "");
      const pubKey = await getPublicKey();
      const ps = (window as unknown as { PaystackPop?: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } } }).PaystackPop;
      if (ps?.setup) {
        const ref = data.reference ?? "";
        const handler = ps.setup({
          key: pubKey,
          access_code: data.accessCode,
          onSuccess: async () => {
            await confirmPayment(ref);
          },
          onCancel: () => {
            setErrorMsg("Payment was cancelled.");
            setLoading(false);
          },
        });
        handler.openIframe();
      } else {
        setErrorMsg("Payment widget failed to load. Please refresh and try again.");
        setLoading(false);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function getPublicKey(): Promise<string> {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/config`);
      const data = await res.json() as { paystackPublicKey?: string };
      return data.paystackPublicKey ?? "";
    } catch {
      return "";
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-md px-4 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/my-account-balance")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Top Up Balance</h1>
          </div>
        </div>

        {/* SUCCESS */}
        {step === "success" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 p-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Payment Successful!</h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-500">
              {currencySymbol}{successAmount} has been added to your virtual balance.
            </p>
            <button
              onClick={() => navigate("/my-account-balance")}
              className="mt-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              View Balance
            </button>
          </div>
        )}

        {/* POLLING */}
        {step === "polling" && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h2 className="text-base font-semibold text-foreground">Awaiting MoMo Confirmation</h2>
            <p className="text-sm text-muted-foreground">{pollMessage}</p>
            <p className="text-xs text-muted-foreground">
              Check your phone and enter your PIN to approve. This may take a moment.
            </p>
          </div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{errorMsg}</span>
            </div>
            <button
              onClick={() => { setStep("form"); setErrorMsg(""); }}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* FORM */}
        {step === "form" && (
          <>
            {/* Amount selector */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Select Amount ({currencySymbol})</h2>
              <div className="grid grid-cols-5 gap-2">
                {AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                      amount === a && !customAmount
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-foreground hover:border-primary/50"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{currencySymbol}</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  min={1}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && step === "form" && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {isGhana ? (
              /* MoMo Form */
              <form onSubmit={handleMoMoSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Smartphone className="h-4 w-4" />
                  <h2 className="text-sm font-semibold">Mobile Money</h2>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Network</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {MOMO_NETWORKS.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">MoMo Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 0241234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">You will pay: </span>
                  <span className="font-bold text-foreground">{currencySymbol}{effectiveAmount.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                  {loading ? "Processing…" : `Pay ${currencySymbol}${effectiveAmount.toFixed(2)} via MoMo`}
                </button>
              </form>
            ) : (
              /* Card Form */
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <CreditCard className="h-4 w-4" />
                  <h2 className="text-sm font-semibold">Card / Bank Payment</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will be charged <strong>${effectiveAmount.toFixed(2)} USD</strong> (billed as GHS {(effectiveAmount * 14).toFixed(2)}).
                </p>
                <button
                  onClick={handleCardPay}
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {loading ? "Processing…" : `Pay $${effectiveAmount.toFixed(2)}`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
