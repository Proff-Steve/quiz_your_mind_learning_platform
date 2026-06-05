import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Wallet, ChevronRight, Loader2, CheckCircle, XCircle, ArrowLeft, Smartphone, Globe, CreditCard } from "lucide-react";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Plan = "weekly" | "monthly";
type Provider = "mtn" | "vod" | "atl";
type Step = "method" | "momo_form" | "intl_form" | "otp" | "awaiting" | "success" | "cancelled" | "error";
type PaymentMethod = "momo" | "intl";

const GHS_PLAN_OPTIONS: { value: Plan; label: string; amount: string; duration: string }[] = [
  { value: "weekly", label: "Weekly Plan", amount: "GH₵ 12", duration: "7 days access" },
  { value: "monthly", label: "Monthly Plan", amount: "GH₵ 48", duration: "28 days access" },
];

const INTL_PLAN_OPTIONS: { value: Plan; label: string; amount: string; duration: string }[] = [
  { value: "weekly", label: "1-Week Plan", amount: "$4.00", duration: "7 days access" },
  { value: "monthly", label: "Monthly Plan", amount: "$15.00", duration: "28 days access" },
];

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "vod", label: "Vodafone Cash" },
  { value: "atl", label: "AirtelTigo Money" },
];

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 30;

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(); return; }
    const existing = document.getElementById("paystack-inline");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.id = "paystack-inline";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(script);
  });
}

export default function LoadAccount() {
  const { user, loading: authLoading, refetch } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const isGhana = user?.country === "Ghana";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [plan, setPlan] = useState<Plan>("weekly");
  const [provider, setProvider] = useState<Provider>("mtn");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("method");

  useEffect(() => {
    if (!authLoading && user === null) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  // Non-Ghana users skip method selection and go straight to card/bank
  useEffect(() => {
    if (!authLoading && user !== null && user.country && user.country !== "Ghana") {
      setStep("intl_form");
    }
  }, [authLoading, user]);

  const [errorMsg, setErrorMsg] = useState("");
  const [statusText, setStatusText] = useState("");
  const [gatewayFailReason, setGatewayFailReason] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCount = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  async function pollStatus(ref: string) {
    if (cancelledRef.current) return;

    const token = getToken();
    pollCount.current += 1;

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/paystack/check-charge/${encodeURIComponent(ref)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json() as { status?: string; displayText?: string };

      if (cancelledRef.current) return;

      if (data.status === "success") {
        await confirmRenewal(ref);
        return;
      }

      const cancelStatuses = ["failed", "abandoned", "reversed", "declined", "cancelled"];
      if (data.status && cancelStatuses.includes(data.status)) {
        const reason = (data.displayText && data.displayText.trim())
          ? data.displayText.trim()
          : "Payment declined by your mobile network. Please ensure your MoMo number is correct and has sufficient balance, then try again.";
        setGatewayFailReason(reason);
        setStep("cancelled");
        return;
      }

      const stillPending = ["pay_offline", "pending", "charge_attempted", "ongoing", "send_otp"];
      if (data.status && stillPending.includes(data.status)) {
        setStatusText(data.displayText ?? "Waiting for your MoMo approval…");
      }
    } catch {
      if (cancelledRef.current) return;
    }

    if (pollCount.current >= POLL_MAX_ATTEMPTS) {
      setStep("error");
      setErrorMsg("Payment timed out. If your payment was deducted, please contact support.");
      return;
    }

    pollRef.current = setTimeout(() => pollStatus(ref), POLL_INTERVAL_MS);
  }

  async function confirmRenewal(ref: string) {
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/paystack/confirm-renewal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reference: ref }),
      });

      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        await refetch();
        setStep("success");
        toast({ title: "Account activated!", description: "Your account is now active. Happy studying!" });
        setTimeout(() => navigate("/dashboard"), 1800);
      } else {
        setStep("error");
        setErrorMsg(data.error ?? "Could not activate your account. Please contact support.");
      }
    } catch {
      setStep("error");
      setErrorMsg("Network error while activating account. Please contact support.");
    }
  }

  async function handleMomoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || submitting) return;

    setSubmitting(true);
    setErrorMsg("");
    cancelledRef.current = false;
    pollCount.current = 0;

    const token = getToken();

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/paystack/renew-charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phone: phone.trim(), provider, plan }),
      });

      const data = await res.json() as {
        status?: string;
        reference?: string;
        displayText?: string;
        error?: string;
        requiresOtp?: boolean;
      };

      if (!res.ok) {
        setErrorMsg(data.error ?? "Failed to initiate payment.");
        return;
      }

      if (data.status === "success" && data.reference) {
        setReference(data.reference);
        await confirmRenewal(data.reference);
        return;
      }

      if (data.reference) {
        setReference(data.reference);
        if (data.requiresOtp) {
          setStatusText(data.displayText ?? "Enter the OTP sent to your phone.");
          setStep("otp");
        } else {
          setStatusText(data.displayText ?? "A prompt has been sent to your phone. Enter your MoMo PIN to approve the payment.");
          setStep("awaiting");
          pollRef.current = setTimeout(() => pollStatus(data.reference!), POLL_INTERVAL_MS);
        }
      } else {
        setErrorMsg(data.error ?? "Unexpected response from payment gateway.");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleIntlPay() {
    setSubmitting(true);
    setErrorMsg("");

    const token = getToken();

    try {
      const initRes = await fetch(`${import.meta.env.BASE_URL}api/paystack/init-renewal-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });

      const initData = await initRes.json() as {
        accessCode?: string;
        reference?: string;
        email?: string;
        amount?: number;
        error?: string;
      };

      if (!initRes.ok || !initData.accessCode || !initData.reference) {
        setErrorMsg(initData.error ?? "Failed to initialize payment. Please try again.");
        setSubmitting(false);
        return;
      }

      const { accessCode, reference: ref, email: txEmail, amount: txAmount } = initData;
      setReference(ref);

      await loadPaystackScript();

      if (!window.PaystackPop) {
        setErrorMsg("Payment system unavailable. Please try again.");
        setSubmitting(false);
        return;
      }

      // Fetch public key from config
      const configRes = await fetch(`${import.meta.env.BASE_URL}api/config`);
      const configData = await configRes.json() as { paystackPublicKey?: string };
      const publicKey = configData.paystackPublicKey ?? "";

      const handler = window.PaystackPop.setup({
        key: publicKey,
        access_code: accessCode,
        email: txEmail,
        amount: txAmount,
        currency: "GHS",
        channels: ["card", "bank", "ussd", "qr", "mobile_money"],
        onSuccess: async () => {
          await confirmRenewal(ref);
        },
        onCancel: () => {
          setErrorMsg("Payment was cancelled. Please try again.");
          setSubmitting(false);
        },
      });

      handler.openIframe();
      setSubmitting(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(`Payment failed: ${msg}`);
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = otpValue.trim();
    if (!otp || otpSubmitting) return;
    setOtpError("");
    setOtpSubmitting(true);

    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/paystack/submit-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ otp, reference }),
      });

      const data = await res.json() as { status?: string; error?: string; displayText?: string };
      if (!res.ok) {
        setOtpError(data.error ?? "OTP verification failed.");
        return;
      }

      if (data.status === "success") {
        await confirmRenewal(reference);
      } else {
        setStatusText(data.displayText ?? "Payment is being processed on your phone.");
        setStep("awaiting");
        pollCount.current = 0;
        pollRef.current = setTimeout(() => pollStatus(reference), POLL_INTERVAL_MS);
      }
    } catch {
      setOtpError("Network error. Please try again.");
    } finally {
      setOtpSubmitting(false);
    }
  }

  function handleCancel() {
    cancelledRef.current = true;
    if (pollRef.current) clearTimeout(pollRef.current);
    setStatusText("");
    setGatewayFailReason("");
    setStep("cancelled");
  }

  function handleRetry() {
    cancelledRef.current = false;
    pollCount.current = 0;
    setReference("");
    setStatusText("");
    setGatewayFailReason("");
    setErrorMsg("");
    setOtpValue("");
    setOtpError("");
    setStep(isGhana ? "method" : "intl_form");
  }

  const planOptions = paymentMethod === "intl" ? INTL_PLAN_OPTIONS : GHS_PLAN_OPTIONS;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-12">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Activate My Account</h1>
            <p className="text-sm text-muted-foreground">Choose a plan and payment method</p>
          </div>
        </div>

        {/* SUCCESS */}
        {step === "success" && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-8 text-center shadow-sm">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success" />
            <h2 className="text-lg font-bold text-foreground">Payment Successful!</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your account is now active. Redirecting to dashboard…</p>
          </div>
        )}

        {/* OTP */}
        {step === "otp" && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-foreground">Enter OTP</h2>
            <p className="mb-4 text-sm text-muted-foreground">{statusText}</p>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="One-Time Password"
                autoFocus
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-center text-lg tracking-widest text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {otpError && <p className="text-sm text-destructive">{otpError}</p>}
              <button
                type="submit"
                disabled={otpSubmitting || !otpValue.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {otpSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : "Verify OTP"}
              </button>
              <button type="button" onClick={handleCancel} className="w-full text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* AWAITING */}
        {step === "awaiting" && (
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-primary" />
              <h2 className="text-base font-bold text-foreground">Awaiting Your Approval</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{statusText}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
              Check your phone for a MoMo prompt and enter your PIN to complete the payment.
            </div>
            <button
              onClick={handleCancel}
              className="mt-5 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        )}

        {/* CANCELLED */}
        {step === "cancelled" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="text-base font-bold text-foreground">
              {gatewayFailReason ? "Payment Failed" : "Payment Cancelled"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {gatewayFailReason || "You cancelled the payment. You can try again whenever you're ready."}
            </p>
            <button
              onClick={handleRetry}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ERROR */}
        {step === "error" && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center shadow-sm">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <h2 className="text-base font-bold text-foreground">Something Went Wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
            <button
              onClick={handleRetry}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* METHOD SELECTION */}
        {step === "method" && (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod("momo"); setPlan("weekly"); setStep("momo_form"); }}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mobile Money</p>
                    <p className="text-xs text-muted-foreground mt-0.5">GHS · Local</p>
                    <p className="text-[10px] text-muted-foreground">MTN, Telecel, AirtelTigo</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod("intl"); setPlan("weekly"); setStep("intl_form"); }}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-border bg-card p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Card / Bank</p>
                    <p className="text-xs text-muted-foreground mt-0.5">USD · International</p>
                    <p className="text-[10px] text-muted-foreground">Visa, Mastercard &amp; more</p>
                  </div>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* MOMO FORM */}
        {step === "momo_form" && (
          <form onSubmit={handleMomoSubmit} className="space-y-5">

            <button
              type="button"
              onClick={() => setStep("method")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to payment methods
            </button>

            {/* Plan selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Select Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GHS_PLAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPlan(opt.value)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      plan === opt.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <p className="text-lg font-bold text-foreground">{opt.amount}</p>
                    <p className="text-xs font-semibold text-primary">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{opt.duration}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Network */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mobile Money Network
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                MoMo Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0240000000"
                autoComplete="tel"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            {/* Summary */}
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold text-foreground">
                  {GHS_PLAN_OPTIONS.find((o) => o.value === plan)?.label}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">
                  {GHS_PLAN_OPTIONS.find((o) => o.value === plan)?.amount}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Network</span>
                <span className="font-semibold text-foreground">
                  {PROVIDERS.find((p) => p.value === provider)?.label}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !phone.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              ) : (
                <>Continue <ChevronRight className="h-4 w-4" /></>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Powered by Paystack · Secured &amp; Encrypted
            </p>
          </form>
        )}

        {/* INTERNATIONAL CARD FORM */}
        {step === "intl_form" && (
          <div className="space-y-5">

            <button
              type="button"
              onClick={() => isGhana ? setStep("method") : navigate("/dashboard")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {isGhana ? "Back to payment methods" : "Back to dashboard"}
            </button>

            {/* Plan selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Select Plan (GHS)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {INTL_PLAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPlan(opt.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      plan === opt.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <p className="text-xl font-bold text-primary">{opt.amount}</p>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{opt.duration}</p>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            {/* Summary */}
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold text-foreground">
                  {INTL_PLAN_OPTIONS.find((o) => o.value === plan)?.label}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">
                  {INTL_PLAN_OPTIONS.find((o) => o.value === plan)?.amount}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold text-foreground">
                  {INTL_PLAN_OPTIONS.find((o) => o.value === plan)?.duration}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-semibold text-foreground">USD (US Dollars)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleIntlPay}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Opening Paystack…</>
              ) : (
                <><CreditCard className="h-4 w-4" /> Pay {INTL_PLAN_OPTIONS.find((o) => o.value === plan)?.amount}</>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Prices shown in USD · charged as GHS at checkout
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Powered by Paystack · 256-bit SSL Encrypted
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
