import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  ChevronRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  Trophy,
  Gamepad2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface VirtualTransaction {
  id: number;
  amount: string;
  type: "credit" | "debit";
  description: string;
  createdAt: string;
}

interface BalanceData {
  balance: string;
  currency: string;
  transactions: VirtualTransaction[];
}

const HOW_TO_EARN = [
  { icon: TrendingUp, title: "Score ≥ 80% on MCQ Exam", reward: "+0.50", color: "text-emerald-500" },
  { icon: TrendingUp, title: "Score ≥ 80% on Theory Exam", reward: "+0.50", color: "text-emerald-500" },
  { icon: Trophy, title: "Leaderboard #1 (Ghana)", reward: "+GH₵16", color: "text-amber-500" },
  { icon: Trophy, title: "Leaderboard #2 (Ghana)", reward: "+GH₵14", color: "text-amber-500" },
  { icon: Trophy, title: "Leaderboard #3 (Ghana)", reward: "+GH₵10", color: "text-amber-500" },
  { icon: Gamepad2, title: "Win a multiplayer game", reward: "+1.00", color: "text-blue-500" },
  { icon: ArrowDownCircle, title: "Lose a multiplayer game", reward: "−1.00", color: "text-rose-500" },
];

export default function MyAccountBalance() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isGhana = (user?.planCurrency ?? "GHS") === "GHS";
  const currencySymbol = isGhana ? "GH₵" : "$";

  async function fetchBalance() {
    setLoading(true);
    setError(null);
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/virtual-account/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error ?? "Failed to load balance.");
        return;
      }
      const d = await res.json() as BalanceData;
      setData(d);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBalance();
  }, []);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Account Balance</h1>
            <p className="text-sm text-muted-foreground">Virtual Account 2 — your rewards wallet</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-lg">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading balance…</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium opacity-80">Available Balance</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">
                {currencySymbol}{data?.balance ?? "0.00"}
              </p>
              <p className="mt-1 text-sm opacity-70">
                Virtual wallet — top up or earn through performance
              </p>
            </>
          )}

          <div className="mt-4 flex gap-3">
            <Link href="/load-virtual-account">
              <button className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-colors">
                <ArrowUpCircle className="h-4 w-4" />
                Top Up
              </button>
            </Link>
            <button
              onClick={fetchBalance}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* How to Earn */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            How to Earn / Spend
          </h2>
          <div className="space-y-2">
            {HOW_TO_EARN.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
                <span className={`text-sm font-bold ${item.color}`}>{item.reward}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Leaderboard prizes are distributed automatically after results are revealed. Game transfers happen when the match ends.
          </p>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Transactions
          </h2>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : !data || data.transactions.length === 0 ? (
            <div className="py-6 text-center">
              <Wallet className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Score ≥80% on a quiz or top up to get started
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {data.transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.type === "credit" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30"}`}>
                      {tx.type === "credit"
                        ? <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        : <ArrowDownCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${tx.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {tx.type === "credit" ? "+" : "−"}{currencySymbol}{tx.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Up CTA */}
        <Link href="/load-virtual-account">
          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowUpCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Top Up Your Balance</p>
                <p className="text-xs text-muted-foreground">Load via {isGhana ? "MoMo" : "card"} to buy leaderboard positions</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      </div>
    </DashboardLayout>
  );
}
