import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Sparkles,
  HelpCircle,
  ChevronRight,
  Building2,
  BadgeCheck,
  Zap,
  Camera,
  Loader2,
  Wallet,
  Bell,
  Megaphone,
  Lock,
  RefreshCcw,
  Gamepad2,
  Calendar,
  ClockIcon,
  Trophy,
  PlayCircle,
  Stethoscope,
  BookOpen,
  PenLine,
  AtSign,
  Mail,
  X,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import { UsernameModal } from "@/components/UsernameModal";

function canAccessPastQuestions(studentId: string): boolean {
  return /^SM\/(SMS|GEM)\/\d{2}\/\d{4}$/.test(studentId.trim());
}

interface ActivityItem {
  id: number;
  title: string;
  createdAt: string;
  difficulty: string;
  status: "Completed" | "In Progress";
  score: string | null;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 200;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Dashboard() {
  const { user, loading, updateProfilePicture, refetch } = useAuth();
  const [, navigate] = useLocation();

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!loading && user) {
      const justRegistered = localStorage.getItem("qym_just_registered");
      if (justRegistered === "true" && !user.username) {
        localStorage.removeItem("qym_just_registered");
        setShowUsernameModal(true);
      }
    }
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    fetch(`${import.meta.env.BASE_URL}api/user/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.activity) setActivity(data.activity);
      })
      .catch(() => {})
      .finally(() => setActivityLoading(false));

    fetch(`${import.meta.env.BASE_URL}api/notices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: { notices?: Notice[] }) => {
        if (data.notices) setNotices(data.notices);
      })
      .catch(() => {})
      .finally(() => setNoticesLoading(false));
  }, [user]);

  function gatedNavigate(path: string) {
    if (!user?.email) {
      setPendingNav(path);
      setEmailInput("");
      setEmailError(null);
      setShowEmailModal(true);
    } else {
      navigate(path);
    }
  }

  async function handleEmailModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    const trimmed = emailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
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
        setEmailError(data.error ?? "Could not save email. Please try again.");
        return;
      }
      await refetch();
      setShowEmailModal(false);
      if (pendingNav) {
        navigate(pendingNav);
        setPendingNav(null);
      }
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleProfilePicture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      await updateProfilePicture(dataUrl);
    } catch {
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const showPastQuestions = canAccessPastQuestions(user.studentId);
  const firstName = user.name.split(" ")[0] || user.name;
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isExpired = user.subscriptionStatus === "expired";

  return (
    <>
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">

        {/* Page title */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Quiz Your Mind Learning Platform
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome to your personalized study dashboard. Ready to master your courses today?
            </p>
          </div>

          {/* Account status + Activate My Account */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 shadow-sm ${
              isExpired
                ? "border-destructive/30 bg-destructive/5"
                : "border-success/30 bg-success/5"
            }`}>
              <Wallet className={`h-4 w-4 ${isExpired ? "text-destructive" : "text-success"}`} />
              <div className="text-right">
                <p className={`text-lg font-bold leading-tight tracking-wide ${isExpired ? "text-destructive" : "text-success"}`}>
                  {isExpired ? "INACTIVE" : "ACTIVE"}
                </p>
                {!isExpired && user.planEndDate && (
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Expires {new Date(user.planEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
            <span onClick={() => gatedNavigate("/load-account")} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isExpired
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "border border-border bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}>
                <RefreshCcw className="h-3.5 w-3.5" />
                Activate My Account
              </span>
          </div>
        </div>

        {/* WELCOME + NOTICE BOARD row */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">

        {/* WELCOME CARD */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Profile picture with upload overlay */}
            <div className="relative shrink-0">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary ring-2 ring-primary/20">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Upload profile picture"
                className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow hover:bg-muted hover:text-primary transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePicture}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">
                Welcome back, {firstName}!
              </h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{user.institution}</span>
                <span className="text-border">•</span>
                <span>Student ID: {user.studentId}</span>
              </p>
              {user.username ? (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-primary font-medium">
                  <AtSign className="h-3.5 w-3.5" />
                  {user.username.replace(/^@+/, "")}
                </p>
              ) : (
                <button
                  onClick={() => setShowUsernameModal(true)}
                  className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                >
                  <AtSign className="h-3 w-3" />
                  Set a username
                </button>
              )}
              <div className="mt-2.5 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                  Level {user.level}
                </span>
                {user.subscriptionStatus === "expired" ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                    <BadgeCheck className="h-3 w-3" />
                    Subscription Inactive
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                    <BadgeCheck className="h-3 w-3" />
                    Active Student
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NOTICE BOARD */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Notice Board</h2>
            </div>
            {(notices.length + (isExpired ? 1 : 0)) > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {notices.length + (isExpired ? 1 : 0)}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto" style={{ maxHeight: "280px" }}>
            {noticesLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : notices.length === 0 && !isExpired ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Megaphone className="h-7 w-7 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No notices yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {isExpired && (
                  <li className="bg-destructive/5 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                      <div>
                        <p className="text-xs font-semibold text-destructive">Account Inactive</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          Please Click on <strong>Activate My Account</strong> to Make Payment And Continue With Your Quiz.
                        </p>
                      </div>
                    </div>
                  </li>
                )}
                {notices.map((notice) => (
                  <li key={notice.id} className="px-4 py-3">
                    <p className="text-xs font-semibold text-foreground">{notice.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.content}</p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                      {new Date(notice.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        </div>{/* end grid */}

        {/* TEST YOURSELF */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Test Yourself</h2>
            {!isExpired && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <Zap className="h-3 w-3" />
                Autosave Enabled
              </span>
            )}
          </div>

          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* MCQs Exams card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                  AI Powered
                </span>
              </div>
              <h3 className="mb-1.5 text-base font-bold text-foreground">MCQs Exams</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Upload your study materials (PDF, PPT, or Images) and let our AI generate custom MCQ exams tailored to your content.
              </p>
              <button onClick={() => gatedNavigate("/test-portal")} className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Theory Exams card */}
            <div className="rounded-xl border border-amber-200/70 bg-card p-6 shadow-sm dark:border-amber-800/30">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <PenLine className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-400">
                  Written Answers
                </span>
              </div>
              <h3 className="mb-1.5 text-base font-bold text-foreground">Theory Exams</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Generate written-answer theory questions from your study materials and get AI-powered semantic scoring with detailed feedback.
              </p>
              <button onClick={() => gatedNavigate("/theory-portal")} className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-amber-600 hover:underline">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Lock overlay when expired */}
            {isExpired && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                <Lock className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Account Inactive</p>
                <p className="mt-1 text-xs text-muted-foreground">Activate your account to unlock learning</p>
                <span onClick={() => gatedNavigate("/load-account")} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Activate My Account
                </span>
              </div>
            )}
          </div>
        </section>

        {/* START LEARNING */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Start Learning</h2>
          </div>

          <div className={`relative grid grid-cols-1 gap-4 sm:grid-cols-2 ${showPastQuestions ? "lg:grid-cols-3" : ""}`}>
            {showPastQuestions && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/5 px-2.5 py-0.5 text-xs font-medium text-success">
                    Verified Content
                  </span>
                </div>
                <h3 className="mb-1.5 text-base font-bold text-foreground">Practice Past Questions</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  Access a curated library of historical institutional exams. Filter by year, level, and department to focus your prep.
                </p>
                <button onClick={() => gatedNavigate("/past-questions")} className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Get Started <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Create Study Plan card */}
            <div className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:border-indigo-700/40 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <Zap className="h-3 w-3" />
                  AI Powered
                </span>
              </div>
              <h3 className="mb-1.5 text-base font-bold text-foreground">Create Study Plan</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Tell us your schedule, sleep pattern, and energy levels. Our AI will build a personalized weekly timetable from your uploaded study materials.
              </p>
              <button onClick={() => gatedNavigate("/study-plan")} className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {isExpired && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                  <Lock className="mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Account Inactive</p>
                  <p className="mt-1 text-xs text-muted-foreground">Activate your account to unlock</p>
                  <span onClick={() => gatedNavigate("/load-account")} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Activate My Account
                  </span>
                </div>
              )}
            </div>

            {/* Make Study Notes card */}
            <div className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <PenLine className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <Zap className="h-3 w-3" />
                  AI Powered
                </span>
              </div>
              <h3 className="mb-1.5 text-base font-bold text-foreground">Make Study Notes</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Upload PDFs, slides, audio, or video — or just type a topic — and let AI generate comprehensive, structured study notes.
              </p>
              <button onClick={() => gatedNavigate("/study-notes")} className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:underline">
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {isExpired && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                  <Lock className="mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Account Inactive</p>
                  <p className="mt-1 text-xs text-muted-foreground">Activate your account to unlock</p>
                  <span onClick={() => gatedNavigate("/load-account")} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Activate My Account
                  </span>
                </div>
              )}
            </div>

            {/* Lock overlay when expired (for past questions) */}
            {isExpired && showPastQuestions && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                <Lock className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Account Inactive</p>
                <p className="mt-1 text-xs text-muted-foreground">Activate your account to unlock learning</p>
                <span onClick={() => gatedNavigate("/load-account")} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Activate My Account
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ATTEMPT PROBLEM OF THE DAY */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Attempt Problem of The Day</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Test your clinical reasoning and knowledge with today's daily challenges.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Clinical Case card */}
            <div className="relative">
              <div onClick={() => !isExpired && gatedNavigate("/clinical-case")}>
                <div className={`group rounded-xl border border-border bg-card p-6 shadow-sm transition-all h-full ${isExpired ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-teal-400/40 hover:shadow-md"}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-sm">
                      <Stethoscope className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-foreground group-hover:text-teal-700 transition-colors">Clinical Case of the Day</h3>
                        <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold text-teal-700">Daily</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">Read today's patient scenario and answer open-ended questions. Results revealed at 8:00 PM.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-teal-600 transition-colors group-hover:translate-x-0.5 transform mt-0.5" />
                  </div>
                </div>
              </div>
              {isExpired && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                  <Lock className="mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Account Inactive</p>
                  <p className="mt-1 text-xs text-muted-foreground">Activate your account to unlock</p>
                  <span onClick={() => gatedNavigate("/load-account")} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Activate My Account
                  </span>
                </div>
              )}
            </div>

            {/* MCQs of The Day card */}
            <div className="relative">
              <div onClick={() => !isExpired && gatedNavigate("/mcq-of-the-day")}>
                <div className={`group rounded-xl border border-border bg-card p-6 shadow-sm transition-all h-full ${isExpired ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-indigo-400/40 hover:shadow-md"}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-foreground group-hover:text-indigo-700 transition-colors">MCQs of The Day</h3>
                        <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">Daily</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">Choose Pre-Clinical or Clinical track · 10 MCQs · 8 min timer. Leaderboard at 8:00 PM.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-indigo-600 transition-colors group-hover:translate-x-0.5 transform mt-0.5" />
                  </div>
                </div>
              </div>
              {isExpired && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                  <Lock className="mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">Account Inactive</p>
                  <p className="mt-1 text-xs text-muted-foreground">Activate your account to unlock</p>
                  <span onClick={() => gatedNavigate("/load-account")} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Activate My Account
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TAKE A BREAK */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-foreground">Take a Break</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step away from studying and enjoy some fun games!</p>
          </div>
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-1">
            <div onClick={() => !isExpired && gatedNavigate("/entertainment")}>
              <div className={`group rounded-xl border border-border bg-card p-5 shadow-sm transition-all ${isExpired ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/30 hover:shadow-md"}`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-sm">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Entertainment</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Play games with friends or challenge the computer. Includes Three Men's Morris and Chess.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors group-hover:translate-x-0.5 transform" />
                </div>
              </div>
            </div>

            {isExpired && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                <Lock className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Account Inactive</p>
                <p className="mt-1 text-xs text-muted-foreground">Activate your account to unlock</p>
                <span onClick={() => gatedNavigate("/load-account")} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Activate My Account
                </span>
              </div>
            )}
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="mb-10">
          <h2 className="mb-4 text-base font-semibold text-foreground">Recent Activity</h2>
          <div className="relative space-y-3">
            {activityLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-border bg-card py-12">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 py-12 text-center">
                <p className="text-sm text-muted-foreground">No activity yet.</p>
                <p className="text-xs text-muted-foreground">Generate your first quiz to get started.</p>
              </div>
            ) : (
              <>
                {activity.map((row, idx) => {
                  const pct = row.score !== null ? parseFloat(row.score) : null;
                  const isFirst = idx === 0;

                  /* ── FIRST ITEM — active card with action button ── */
                  if (isFirst) {
                    return (
                      <div
                        key={row.id}
                        className="rounded-xl border-2 border-primary/40 bg-card px-5 py-4 shadow-sm ring-1 ring-primary/10"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                            <PlayCircle className="h-3 w-3" />
                            Most Recent
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            row.status === "Completed"
                              ? "bg-success/10 text-success border border-success/20"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                          }`}>
                            {row.status}
                          </span>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-base font-bold text-foreground">{row.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="h-3.5 w-3.5" />
                                {formatDate(row.createdAt)}
                              </span>
                              <span className="capitalize">{row.difficulty}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            {pct !== null && (
                              <div className="text-right">
                                <p className={`text-2xl font-bold tabular-nums ${
                                  pct >= 75 ? "text-green-500" : pct >= 50 ? "text-yellow-500" : "text-red-500"
                                }`}>
                                  {pct.toFixed(1)}%
                                </p>
                              </div>
                            )}
                            {row.status === "Completed" ? (
                              <button
                                onClick={() => {
                                  localStorage.setItem("qym_last_result", JSON.stringify({ examId: row.id }));
                                  navigate("/results");
                                }}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                              >
                                Review Results
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const existing = localStorage.getItem("qym_quiz_config");
                                  const cfg = existing ? JSON.parse(existing) : {};
                                  localStorage.setItem("qym_quiz_config", JSON.stringify({ ...cfg, examId: row.id }));
                                  navigate("/exam-area");
                                }}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                              >
                                Continue Exam
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  /* ── ITEMS 2-7 — info-only history-style cards ── */
                  return (
                    <div
                      key={row.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{row.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {formatDate(row.createdAt)}
                          </span>
                          <span className="capitalize">{row.difficulty}</span>
                          <span className={`font-medium ${
                            row.status === "Completed" ? "text-success" : "text-amber-500"
                          }`}>
                            {row.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 shrink-0">
                        {pct !== null ? (
                          <div className="text-right">
                            <p className={`text-xl font-bold tabular-nums ${
                              pct >= 75 ? "text-green-500" : pct >= 50 ? "text-yellow-500" : "text-red-500"
                            }`}>
                              {pct.toFixed(1)}%
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Not scored</p>
                        )}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Lock overlay when expired */}
            {isExpired && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-[2px]">
                <Lock className="mb-2 h-7 w-7 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Activity Locked</p>
                <p className="mt-1 text-xs text-muted-foreground">Activate your account to view activity</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>

    {showUsernameModal && (
      <UsernameModal
        onSuccess={() => {
          setShowUsernameModal(false);
          refetch();
        }}
        onDismiss={() => setShowUsernameModal(false)}
      />
    )}

    {showEmailModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Email Required</h2>
                <p className="text-xs text-muted-foreground">Needed for payments and account recovery</p>
              </div>
            </div>
            <button
              onClick={() => { setShowEmailModal(false); setPendingNav(null); }}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleEmailModalSubmit} className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              To continue, please add your email address. This is used for payment receipts and account recovery — we don't send spam.
            </p>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email Address</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>

            {emailError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {emailError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowEmailModal(false); setPendingNav(null); }}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Later
              </button>
              <button
                type="submit"
                disabled={emailSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {emailSaving ? "Saving…" : "Save & Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
