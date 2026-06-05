import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Bell,
  Send,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Wallet,
  Search,
  Plus,
  Minus,
  Users,
  Loader2,
  KeyRound,
  MessageCircle,
  FileText,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  CheckCheck,
  Paperclip,
  Mic,
  MapPin,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

const STORAGE_KEY = "qym_admin_secret";

type Tab = "notices" | "accounts" | "passwords" | "chat" | "cases" | "mcq";

interface UserBalance {
  id: number;
  name: string;
  studentId: string;
  level: string;
  institution: string;
  country: string | null;
  accountBalance: string;
  subscriptionStatus: string;
  planType: string | null;
  planCurrency: string | null;
  planEndDate: string | null;
}

export default function AdminNotices() {
  const [, navigate] = useLocation();
  const [secret, setSecret] = useState("");
  const [storedSecret, setStoredSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("notices");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setStoredSecret(stored);
  }, []);

  function handleSecretSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secret.trim()) return;
    localStorage.setItem(STORAGE_KEY, secret.trim());
    setStoredSecret(secret.trim());
    setSecret("");
  }

  function handleClearSecret() {
    localStorage.removeItem(STORAGE_KEY);
    setStoredSecret(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage notices and virtual accounts</p>
          </div>
        </div>

        {!storedSecret ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-medium">Enter admin secret to continue</p>
            </div>
            <form onSubmit={handleSecretSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Admin secret"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={!secret.trim()}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Authenticated as admin</p>
              <button
                onClick={handleClearSecret}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Sign out
              </button>
            </div>

            <div className="mb-4 flex rounded-xl border border-border bg-muted/40 p-1 gap-1">
              <button
                onClick={() => setActiveTab("notices")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "notices"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bell className="h-4 w-4" />
                Notices
              </button>
              <button
                onClick={() => setActiveTab("accounts")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "accounts"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-4 w-4" />
                Accounts
              </button>
              <button
                onClick={() => setActiveTab("passwords")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "passwords"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                Passwords
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "chat"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab("cases")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "cases"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                Cases
              </button>
              <button
                onClick={() => setActiveTab("mcq")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  activeTab === "mcq"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                MCQ
              </button>
            </div>

            {activeTab === "notices" ? (
              <NoticesPanel storedSecret={storedSecret} navigate={navigate} />
            ) : activeTab === "accounts" ? (
              <AccountsPanel storedSecret={storedSecret} />
            ) : activeTab === "passwords" ? (
              <PasswordsPanel storedSecret={storedSecret} />
            ) : activeTab === "cases" ? (
              <CasesPanel storedSecret={storedSecret} />
            ) : activeTab === "mcq" ? (
              <McqSetsPanel storedSecret={storedSecret} />
            ) : (
              <AdminChatPanel storedSecret={storedSecret} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NoticesPanel({
  storedSecret,
  navigate,
}: {
  storedSecret: string;
  navigate: (path: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": storedSecret,
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        } else {
          setError(data.error ?? "Failed to post notice.");
        }
        return;
      }

      setTitle("");
      setContent("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Notice posted successfully and is now visible to all users.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notice Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. System Maintenance Notice"
            maxLength={200}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the announcement content here…"
            rows={5}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Posting…" : "Post Notice"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordsPanel({ storedSecret }: { storedSecret: string }) {
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{ name: string; studentId: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearching(true);
    setSearchError(null);
    setFoundUser(null);
    setSaveSuccess(false);
    setSaveError(null);
    setNewPassword("");
    setConfirmPassword("");

    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/admin/user-balance?studentId=${encodeURIComponent(searchId.trim())}`,
        { headers: { "x-admin-secret": storedSecret } }
      );
      const data = (await res.json()) as { name?: string; studentId?: string; error?: string };
      if (!res.ok) {
        setSearchError(data.error ?? "Failed to find user.");
        return;
      }
      setFoundUser({ name: data.name!, studentId: data.studentId! });
    } catch {
      setSearchError("Network error. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!foundUser) return;
    if (newPassword.length < 6) {
      setSaveError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSaveError("Passwords do not match.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/user-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": storedSecret,
        },
        body: JSON.stringify({ studentId: foundUser.studentId, newPassword }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        } else {
          setSaveError(data.error ?? "Failed to update password.");
        }
        return;
      }

      setSaveSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Find Student</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Student ID…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={searching || !searchId.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>

        {searchError && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {searchError}
          </div>
        )}
      </div>

      {foundUser && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <KeyRound className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Changing password for
              </p>
              <p className="font-semibold text-foreground">
                {foundUser.name}{" "}
                <span className="text-sm font-normal text-muted-foreground">({foundUser.studentId})</span>
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Password updated successfully for {foundUser.name}.
            </div>
          )}

          {saveError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {saveError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !newPassword || !confirmPassword}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                </span>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function AccountsPanel({ storedSecret }: { storedSecret: string }) {
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useState<UserBalance | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [action, setAction] = useState<"add" | "reduce" | "set">("add");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const [newCountry, setNewCountry] = useState("");
  const [savingCountry, setSavingCountry] = useState(false);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [countrySuccess, setCountrySuccess] = useState<string | null>(null);

  async function handleCountryChange(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newCountry.trim()) return;
    setSavingCountry(true);
    setCountryError(null);
    setCountrySuccess(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/user-country`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-secret": storedSecret },
        body: JSON.stringify({ studentId: user.studentId, country: newCountry.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; country?: string; planCurrency?: string; error?: string };
      if (!res.ok) {
        setCountryError(data.error ?? "Failed to update country.");
        return;
      }
      setUser((u) => u ? { ...u, country: data.country ?? u.country, planCurrency: data.planCurrency ?? u.planCurrency } : u);
      setCountrySuccess(`Country updated to "${data.country}". Plan currency set to ${data.planCurrency}.`);
      setNewCountry("");
    } catch {
      setCountryError("Network error. Please try again.");
    } finally {
      setSavingCountry(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearching(true);
    setSearchError(null);
    setUser(null);
    setUpdateSuccess(null);
    setUpdateError(null);

    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}api/admin/user-balance?studentId=${encodeURIComponent(searchId.trim())}`,
        { headers: { "x-admin-secret": storedSecret } }
      );
      const data = (await res.json()) as UserBalance & { error?: string };
      if (!res.ok) {
        setSearchError(data.error ?? "Failed to find user.");
        return;
      }
      setUser(data);
    } catch {
      setSearchError("Network error. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !amount.trim()) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed < 0) {
      setUpdateError("Please enter a valid amount.");
      return;
    }

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/user-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": storedSecret,
        },
        body: JSON.stringify({ studentId: user.studentId, amount: parsed, action }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        newBalance?: string;
        previousBalance?: string;
        subscriptionStatus?: string;
        error?: string;
      };

      if (!res.ok) {
        setUpdateError(data.error ?? "Failed to update balance.");
        return;
      }

      const verb = action === "add" ? "Added" : action === "reduce" ? "Reduced" : "Set";
      const currSymbol = user.planCurrency === "USD" ? "$" : "GH₵";
      setUpdateSuccess(
        `${verb} ${currSymbol}${parsed.toFixed(2)}. New balance: ${currSymbol}${data.newBalance} (${data.subscriptionStatus}).`
      );
      setUser((u) =>
        u
          ? { ...u, accountBalance: data.newBalance ?? u.accountBalance, subscriptionStatus: data.subscriptionStatus ?? u.subscriptionStatus }
          : u
      );
      setAmount("");
    } catch {
      setUpdateError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Look Up Student</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Student ID…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={searching || !searchId.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>

        {searchError && (
          <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {searchError}
          </div>
        )}
      </div>

      {user && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {user.studentId} · Level {user.level} · {user.institution}
              </p>
              {user.country && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {user.country}
                </p>
              )}
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                user.subscriptionStatus === "active"
                  ? "border border-success/30 bg-success/10 text-success"
                  : "border border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {user.subscriptionStatus}
            </span>
          </div>

          <div className="mb-5 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Virtual Account Balance
              </p>
              <p className="text-xl font-bold text-primary">
                {user.planCurrency === "USD" ? "$" : "GH₵"} {parseFloat(user.accountBalance).toFixed(2)}
              </p>
            </div>
          </div>

          {updateSuccess && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {updateSuccess}
            </div>
          )}

          {updateError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {updateError}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Action
              </label>
              <div className="flex gap-2">
                {(["add", "reduce", "set"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAction(a)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                      action === a
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {a === "add" ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" /> Add
                      </span>
                    ) : a === "reduce" ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Minus className="h-3.5 w-3.5" /> Reduce
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5" /> Set
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Amount (GH₵)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={updating || !amount.trim()}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {updating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                </span>
              ) : (
                `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change Country</h3>

            {countrySuccess && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {countrySuccess}
              </div>
            )}
            {countryError && (
              <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {countryError}
              </div>
            )}

            <form onSubmit={handleCountryChange} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  placeholder={`Current: ${user.country ?? "not set"}`}
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                type="submit"
                disabled={savingCountry || !newCountry.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {savingCountry ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Save
              </button>
            </form>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Setting to <span className="font-medium">Ghana</span> → GHS plan. Any other country → USD plan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ChatConversation {
  id: number;
  userId: number;
  status: "open" | "closed";
  lastMessageAt: string;
  createdAt: string;
  userName: string | null;
  studentId: string | null;
  institution: string | null;
}

interface ChatMessage {
  id: number;
  chatId: number;
  senderRole: "user" | "admin";
  content: string;
  fileData: string | null;
  fileName: string | null;
  fileType: string | null;
  createdAt: string;
}

function formatChatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AdminFileAttachment({ fileData, fileName, fileType }: { fileData: string; fileName: string | null; fileType: string | null }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isImage = fileType?.startsWith("image/");
  const isAudio = fileType?.startsWith("audio/") || fileType?.startsWith("video/webm") || fileType?.startsWith("video/ogg");

  if (isImage) {
    return (
      <a href={fileData} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <img src={fileData} alt={fileName ?? "image"} className="max-w-[200px] max-h-[160px] rounded-lg object-cover border border-border" />
      </a>
    );
  }

  if (isAudio) {
    function togglePlay() {
      if (!audioRef.current) {
        audioRef.current = new Audio(fileData);
        audioRef.current.onended = () => setPlaying(false);
      }
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    }
    return (
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 mt-1 bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 text-sm transition-colors text-foreground"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span>{fileName ?? "Voice message"}</span>
      </button>
    );
  }

  return (
    <a
      href={fileData}
      download={fileName ?? "file"}
      className="flex items-center gap-2 mt-1 bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 text-sm transition-colors text-foreground"
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate max-w-[180px]">{fileName ?? "Document"}</span>
    </a>
  );
}

function AdminChatPanel({ storedSecret }: { storedSecret: string }) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchConversations() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/chat/conversations`, {
        headers: { "x-admin-secret": storedSecret },
      });
      if (!res.ok) return;
      const data = await res.json() as { chats: ChatConversation[] };
      setConversations(data.chats);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(chatId: number, silent = false) {
    if (!silent) setLoadingMsgs(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/chat/conversations/${chatId}/messages`, {
        headers: { "x-admin-secret": storedSecret },
      });
      if (!res.ok) return;
      const data = await res.json() as { messages: ChatMessage[] };
      setMessages(data.messages);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: silent ? "smooth" : "auto" }), 50);
    } catch {
    } finally {
      if (!silent) setLoadingMsgs(false);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedChat) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    fetchMessages(selectedChat.id);
    pollRef.current = setInterval(() => fetchMessages(selectedChat.id, true), 6000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedChat?.id]);

  async function sendReply(content: string, file?: File) {
    if (!selectedChat) return;
    setSending(true);
    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("file", file);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/chat/conversations/${selectedChat.id}/reply`, {
        method: "POST",
        headers: { "x-admin-secret": storedSecret },
        body: formData,
      });
      if (res.ok) {
        setReplyText("");
        await fetchMessages(selectedChat.id, true);
        await fetchConversations();
      }
    } catch {
    } finally {
      setSending(false);
    }
  }

  async function toggleStatus() {
    if (!selectedChat) return;
    const newStatus = selectedChat.status === "open" ? "closed" : "open";
    await fetch(`${import.meta.env.BASE_URL}api/admin/chat/conversations/${selectedChat.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": storedSecret },
      body: JSON.stringify({ status: newStatus }),
    });
    setSelectedChat((c) => c ? { ...c, status: newStatus } : c);
    setConversations((list) => list.map((c) => c.id === selectedChat.id ? { ...c, status: newStatus } : c));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    sendReply("", file);
    e.target.value = "";
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordingChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        sendReply("", file);
        setRecordingTime(0);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      recordingTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      alert("Could not access microphone.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
  }

  function formatRecordingTime(s: number) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }

  if (selectedChat) {
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col" style={{ height: "600px" }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <button onClick={() => setSelectedChat(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{selectedChat.userName ?? "Unknown User"}</p>
            <p className="text-xs text-muted-foreground truncate">{selectedChat.studentId} · {selectedChat.institution}</p>
          </div>
          <button
            onClick={toggleStatus}
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              selectedChat.status === "open"
                ? "border-success/30 bg-success/10 text-success hover:bg-success/20"
                : "border-muted-foreground/30 bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {selectedChat.status === "open" ? "Open" : "Closed"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-muted/20">
          {loadingMsgs && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loadingMsgs && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No messages in this conversation</p>
            </div>
          )}
          {messages.map((msg) => {
            const isAdmin = msg.senderRole === "admin";
            return (
              <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                {!isAdmin && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold mr-1.5 mt-1 shrink-0">
                    {(selectedChat.userName ?? "U")[0].toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isAdmin
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card text-foreground rounded-bl-sm shadow-sm border border-border"
                }`}>
                  {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                  {msg.fileData && (
                    <AdminFileAttachment fileData={msg.fileData} fileName={msg.fileName} fileType={msg.fileType} />
                  )}
                  <p className={`text-[10px] mt-1 ${isAdmin ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                    {formatMsgTime(msg.createdAt)}
                    {isAdmin && <CheckCheck className="inline h-3 w-3 ml-1" />}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="px-3 py-2.5 border-t border-border shrink-0 bg-card">
          {recording ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm text-destructive font-medium">Recording {formatRecordingTime(recordingTime)}</span>
              </div>
              <button onClick={stopRecording} className="h-9 w-9 bg-destructive hover:bg-destructive/90 text-white rounded-full flex items-center justify-center transition-colors shrink-0" title="Stop and send">
                <Send className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-1.5">
              <button onClick={() => fileInputRef.current?.click()} disabled={sending} className="h-9 w-9 text-muted-foreground hover:text-primary flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0" title="Attach file">
                <Paperclip className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (replyText.trim()) sendReply(replyText.trim()); } }}
                placeholder="Type a reply…"
                rows={1}
                className="flex-1 resize-none bg-muted text-foreground rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder-muted-foreground max-h-24 min-h-[36px]"
              />
              {replyText.trim() ? (
                <button onClick={() => sendReply(replyText.trim())} disabled={sending} className="h-9 w-9 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-full flex items-center justify-center transition-colors shrink-0">
                  <Send className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={startRecording} disabled={sending} className="h-9 w-9 text-muted-foreground hover:text-primary flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0" title="Record voice">
                  <Mic className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Support Conversations</h2>
        <button onClick={fetchConversations} disabled={loading} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors" title="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>


      {loading && conversations.length === 0 && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <MessageCircle className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-xs mt-1">User messages will appear here</p>
        </div>
      )}

      <div className="divide-y divide-border">
        {conversations.map((chat) => (
          <button
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {(chat.userName ?? "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm text-foreground truncate">{chat.userName ?? "Unknown User"}</p>
                <span className="text-xs text-muted-foreground shrink-0">{formatChatTime(chat.lastMessageAt)}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground truncate">{chat.studentId} · {chat.institution}</p>
                <span className={`shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  chat.status === "open"
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {chat.status}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

interface CaseItem {
  id: number;
  caseDate: string;
  title: string;
  postedAt: string;
  revealResultsAt: string;
  questionCount: number;
  attemptCount: number;
}

interface QuestionInput {
  questionText: string;
  correctAnswerText: string;
  rationale: string;
}

function CasesPanel({ storedSecret }: { storedSecret: string }) {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [caseDate, setCaseDate] = useState("");
  const [title, setTitle] = useState("");
  const [caseContent, setCaseContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { questionText: "", correctAnswerText: "", rationale: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchCases() {
    setLoadingCases(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/cases`, {
        headers: { "x-admin-secret": storedSecret },
      });
      const data = (await res.json()) as { cases?: CaseItem[] };
      if (data.cases) setCases(data.cases);
    } catch {
    } finally {
      setLoadingCases(false);
    }
  }

  useEffect(() => { fetchCases(); }, []);

  function addQuestion() {
    setQuestions((prev) => [...prev, { questionText: "", correctAnswerText: "", rationale: "" }]);
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, field: keyof QuestionInput, value: string) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!caseDate || !title.trim() || !caseContent.trim()) {
      setFormError("Date, title, and case content are required.");
      return;
    }
    if (questions.some((q) => !q.questionText.trim() || !q.correctAnswerText.trim() || !q.rationale.trim())) {
      setFormError("All question fields (question, answer, rationale) must be filled.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("caseDate", caseDate);
      formData.append("title", title.trim());
      formData.append("caseContent", caseContent.trim());
      formData.append("questions", JSON.stringify(questions));
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/cases`, {
        method: "POST",
        headers: { "x-admin-secret": storedSecret },
        body: formData,
      });
      const data = (await res.json()) as { error?: string; case?: CaseItem };
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create case.");
        return;
      }
      setFormSuccess(`Case for ${caseDate} created with ${questions.length} question(s).`);
      setCaseDate("");
      setTitle("");
      setCaseContent("");
      setImageFile(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setQuestions([{ questionText: "", correctAnswerText: "", rationale: "" }]);
      setShowForm(false);
      fetchCases();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this case and all its questions and attempts?")) return;
    setDeletingId(id);
    try {
      await fetch(`${import.meta.env.BASE_URL}api/admin/cases/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": storedSecret },
      });
      setCases((prev) => prev.filter((c) => c.id !== id));
    } catch {
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {formSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {formSuccess}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Clinical Cases</h2>
        <button
          onClick={() => { setShowForm((p) => !p); setFormError(null); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Cancel" : "New Case"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-teal-600" /> Create Clinical Case
          </h3>
          {formError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={caseDate}
                  onChange={(e) => setCaseDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Case Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Acute Chest Pain in a 55-year-old"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Case Scenario
              </label>
              <textarea
                value={caseContent}
                onChange={(e) => setCaseContent(e.target.value)}
                placeholder="Write the full clinical case scenario here…"
                rows={6}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Case Image <span className="normal-case font-normal text-muted-foreground/70">(optional — displayed above the scenario)</span>
              </label>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img src={imagePreview} alt="Case preview" className="w-full max-h-56 object-contain bg-muted/30" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive/90 text-white shadow hover:bg-destructive transition-colors"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  Click to upload image (JPG, PNG, WebP — max 5 MB)
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Questions ({questions.length})
                </label>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </button>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Question {idx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={q.questionText}
                    onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
                    placeholder="Question text…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    value={q.correctAnswerText}
                    onChange={(e) => updateQuestion(idx, "correctAnswerText", e.target.value)}
                    placeholder="Correct answer (exact text students must type)…"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <textarea
                    value={q.rationale}
                    onChange={(e) => updateQuestion(idx, "rationale", e.target.value)}
                    placeholder="Rationale / explanation shown after submission…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <><Stethoscope className="h-4 w-4" /> Create Case</>}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loadingCases ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Stethoscope className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No cases yet</p>
            <p className="text-xs mt-1">Create your first clinical case above</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {cases.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5">
                      {c.caseDate}
                    </span>
                    <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.questionCount} question{c.questionCount !== 1 ? "s" : ""} · {c.attemptCount} attempt{c.attemptCount !== 1 ? "s" : ""} · reveals {new Date(c.revealResultsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  title="Delete case"
                >
                  {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface McqSetItem {
  id: number;
  setDate: string;
  type: "pre_clinical" | "clinical";
  timeLimitMinutes: number;
  totalQuestions: number;
  revealResultsAt: string;
  questionCount: number;
  attemptCount: number;
}

interface McqQuestionInput {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  rationale: string;
}

function emptyMcqQuestion(): McqQuestionInput {
  return { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A", rationale: "" };
}

function McqSetsPanel({ storedSecret }: { storedSecret: string }) {
  const [sets, setSets] = useState<McqSetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [setDate, setSetDate] = useState("");
  const [type, setType] = useState<"pre_clinical" | "clinical">("pre_clinical");
  const [questions, setQuestions] = useState<McqQuestionInput[]>(
    Array.from({ length: 10 }, emptyMcqQuestion)
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function fetchSets() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/mcq/sets`, {
        headers: { "x-admin-secret": storedSecret },
      });
      const data = (await res.json()) as { sets?: McqSetItem[] };
      if (data.sets) setSets(data.sets);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSets(); }, []);

  function updateQuestion(idx: number, field: keyof McqQuestionInput, value: string) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!setDate) {
      setFormError("Please select a date.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim() || !q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setFormError(`Question ${i + 1}: all fields except rationale are required.`);
        return;
      }
      if (!["A","B","C","D"].includes(q.correctAnswer.toUpperCase())) {
        setFormError(`Question ${i + 1}: correct answer must be A, B, C, or D.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/mcq/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": storedSecret },
        body: JSON.stringify({ setDate, type, questions }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create MCQ set.");
        return;
      }
      setFormSuccess(`MCQ set (${type === "pre_clinical" ? "Pre-Clinical" : "Clinical"}) for ${setDate} created!`);
      setSetDate("");
      setType("pre_clinical");
      setQuestions(Array.from({ length: 10 }, emptyMcqQuestion));
      setShowForm(false);
      fetchSets();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this MCQ set and all its questions and attempts?")) return;
    setDeletingId(id);
    try {
      await fetch(`${import.meta.env.BASE_URL}api/admin/mcq/sets/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": storedSecret },
      });
      setSets((prev) => prev.filter((s) => s.id !== id));
    } catch {
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {formSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {formSuccess}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Daily MCQ Sets</h2>
        <button
          onClick={() => { setShowForm((p) => !p); setFormError(null); setFormSuccess(null); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Cancel" : "New MCQ Set"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" /> Create Daily MCQ Set
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Exactly 10 questions required. Timer is 8 minutes. Results revealed at 8:00 PM (20h after midnight of the set date).
          </p>
          {formError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={setDate}
                  onChange={(e) => setSetDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Track
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "pre_clinical" | "clinical")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="pre_clinical">Pre-Clinical</option>
                  <option value="clinical">Clinical</option>
                </select>
              </div>
            </div>

            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Question {idx + 1} of 10</p>
                  <textarea
                    value={q.questionText}
                    onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
                    placeholder="Question text…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(["A","B","C","D"] as const).map((letter) => (
                      <div key={letter} className="flex items-center gap-2">
                        <span className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{letter}</span>
                        <input
                          type="text"
                          value={q[`option${letter}` as "optionA"|"optionB"|"optionC"|"optionD"]}
                          onChange={(e) => updateQuestion(idx, `option${letter}` as keyof McqQuestionInput, e.target.value)}
                          placeholder={`Option ${letter}`}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-muted-foreground shrink-0">Correct Answer:</label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(idx, "correctAnswer", e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <textarea
                    value={q.rationale}
                    onChange={(e) => updateQuestion(idx, "rationale", e.target.value)}
                    placeholder="Rationale / explanation (optional but recommended)…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <><FileText className="h-4 w-4" /> Create MCQ Set</>}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No MCQ sets yet</p>
            <p className="text-xs mt-1">Create your first daily MCQ set above</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sets.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2 py-0.5">
                      {s.setDate}
                    </span>
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 border ${
                      s.type === "pre_clinical"
                        ? "bg-violet-50 border-violet-200 text-violet-700"
                        : "bg-teal-50 border-teal-200 text-teal-700"
                    }`}>
                      {s.type === "pre_clinical" ? "Pre-Clinical" : "Clinical"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.questionCount} question{s.questionCount !== 1 ? "s" : ""} · {s.attemptCount} attempt{s.attemptCount !== 1 ? "s" : ""} · reveals {new Date(s.revealResultsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  title="Delete set"
                >
                  {deletingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
