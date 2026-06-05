import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Save, Lock, User, Loader2, CheckCircle2, AlertCircle, AtSign, Mail } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";

type Status = { type: "success" | "error"; message: string } | null;

const LEVEL_OPTIONS = ["100", "200", "300", "400", "500", "600"];

async function apiPut(path: string, body: object): Promise<void> {
  const token = getToken();
  const res = await fetch(`${import.meta.env.BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? "Request failed. Please try again.");
  }
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, refetch } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [institution, setInstitution] = useState(user?.institution ?? "");
  const [level, setLevel] = useState(user?.level ?? "100");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<Status>(null);

  const [email, setEmail] = useState(user?.email ?? "");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState<Status>(null);

  const [username, setUsername] = useState(user?.username ?? "");
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<Status>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<Status>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setInstitution(user.institution ?? "");
      setLevel(user.level ?? "100");
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailStatus(null);
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }
    setEmailSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.BASE_URL}api/user/email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setEmailStatus({ type: "error", message: data.error ?? "Could not update email." });
        return;
      }
      refetch();
      setEmailStatus({ type: "success", message: "Email updated successfully." });
    } catch {
      setEmailStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault();
    setUsernameStatus(null);
    const trimmed = username.trim();
    const handle = trimmed.replace(/^@+/, "");

    if (handle.length < 2) {
      setUsernameStatus({ type: "error", message: "Username must be at least 2 characters." });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      setUsernameStatus({ type: "error", message: "Only letters, numbers, and underscores are allowed." });
      return;
    }

    setUsernameSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${import.meta.env.BASE_URL}api/user/username`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setUsernameStatus({ type: "error", message: data.error ?? "Could not update username." });
        return;
      }
      refetch();
      setUsernameStatus({ type: "success", message: "Username updated successfully." });
    } catch {
      setUsernameStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setUsernameSaving(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      await apiPut("api/user/profile", { name, institution, level });
      refetch();
      setProfileStatus({ type: "success", message: "Profile updated successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not update profile.";
      setProfileStatus({ type: "error", message: msg });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwStatus(null);
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwStatus({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }
    setPwSaving(true);
    try {
      await apiPut("api/user/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwStatus({ type: "success", message: "Password changed successfully." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not change password.";
      setPwStatus({ type: "error", message: msg });
    } finally {
      setPwSaving(false);
    }
  }

  const themeOptions: { value: "light" | "dark" | "system"; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your preferences and account details.</p>
        </div>

        <div className="space-y-6">

          {/* THEME */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Appearance</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred colour theme.</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-sm font-medium transition-colors ${
                      theme === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Email Address
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your email is used for payments and account recovery. Keep it up to date.
              </p>
            </div>
            <form onSubmit={handleSaveEmail} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {emailStatus && (
                <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  emailStatus.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {emailStatus.type === "success"
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {emailStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={emailSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {emailSaving ? "Saving…" : "Save Email"}
              </button>
            </form>
          </div>

          {/* EDIT PROFILE */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <User className="h-4 w-4 text-primary" />
                Edit Profile
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Update your name, institution, and academic level.</p>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Your school or university"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Academic Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>

              {profileStatus && (
                <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  profileStatus.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {profileStatus.type === "success"
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {profileStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>

          {/* USERNAME */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <AtSign className="h-4 w-4 text-primary" />
                Username
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your leaderboard handle — only letters, numbers, and underscores.
              </p>
            </div>
            <form onSubmit={handleSaveUsername} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. medstudent_2026"
                  maxLength={50}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {usernameStatus && (
                <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  usernameStatus.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {usernameStatus.type === "success"
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {usernameStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={usernameSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {usernameSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {usernameSaving ? "Saving…" : "Save Username"}
              </button>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Change Password
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Keep your account secure with a strong password.</p>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {pwStatus && (
                <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  pwStatus.type === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {pwStatus.type === "success"
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {pwStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
