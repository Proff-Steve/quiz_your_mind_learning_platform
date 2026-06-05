import { Link } from "wouter";
import qymLogo from "@assets/QuizYourMind_1777758833214.png";
import {
  BookOpen,
  ArrowRight,
  Upload,
  Zap,
  Trophy,
  CheckCircle2,
  Brain,
  FlaskConical,
  GraduationCap,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck,
  Headphones,
  Check,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <span className="flex cursor-pointer items-center gap-2 font-semibold text-primary">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </div>
              Quiz Your Mind
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <span className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Login
              </span>
            </Link>
            <Link href="/register">
              <span className="cursor-pointer inline-flex items-center rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                Get Started
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background">
        {/* Subtle background gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:items-center">
          {/* Left — copy */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Powered by Advanced AI Models
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Welcome to{" "}
              <span className="text-primary">Quiz Your Mind</span>{" "}
              Learning Platform
            </h1>

            <p className="text-base text-muted-foreground sm:text-lg leading-relaxed max-w-lg">
              Transform your study materials into interactive MCQ exams instantly.
              Master complex topics through AI-generated quizzes designed for deep learning.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Learn More
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#3B82F6", "#8B5CF6", "#EC4899", "#10B981"].map((color, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background ring-0"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Join{" "}
                <span className="font-semibold text-foreground">1,200+ students</span>{" "}
                improving their grades today
              </p>
            </div>
          </div>

          {/* Right — decorative card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              {/* Main card with iridescent top area */}
              <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
                {/* Colorful abstract header */}
                <div className="h-48 w-full overflow-hidden">
                  <img src={qymLogo} alt="Quiz Your Mind" className="h-full w-full object-cover" />
                </div>

                {/* Card body */}
                <div className="bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Analysis Complete</p>
                      <p className="text-xs text-muted-foreground">54 MCQs derived from Pharmacology 101.pdf</p>
                    </div>
                    <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Processing complete</span>
                      <span>100%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-full rounded-full bg-primary" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                    {[
                      { label: "Questions", value: "54" },
                      { label: "Topics", value: "12" },
                      { label: "Difficulty", value: "Med" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p className="text-base font-bold text-primary">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-3 -left-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">AI Powered</p>
                  <p className="text-[10px] text-muted-foreground">Instant generation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Excel
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Our platform bridges the gap between passive reading and active recall
              using state-of-the-art AI.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: Brain,
                title: "What we do",
                description:
                  "We leverage advanced AI to ingest your PDFs, lecture slides, and notes. Our engine identifies key concepts and automatically generates high-quality multiple-choice questions that mirror real exam standards.",
              },
              {
                icon: Zap,
                title: "How it works",
                description:
                  "Simply upload your material, configure your preferred exam parameters (time, difficulty, count), and our system builds a custom testing environment in seconds. Practice, review, and repeat.",
              },
              {
                icon: GraduationCap,
                title: "How it helps students",
                description:
                  "By identifying knowledge gaps through active testing, you focus your study time where it matters most. Detailed post-quiz explanations ensure you understand the 'why' behind every answer.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 STEPS ───────────────────────────────────────────── */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left — text */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Master Any Subject in 3 Steps
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Forget about spending hours drafting your own practice questions. Let our
                  AI do the heavy lifting so you can focus on mastering the content.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Upload PDFs, PowerPoints, or pasted text",
                  "Choose between Easy, Medium, or Difficult settings",
                  "Take timed exams with real-time autosave",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
                  Start Your First Quiz
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            {/* Right — step cards */}
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
              {[
                {
                  step: 1,
                  icon: Upload,
                  title: "Upload",
                  description: "Drop your study materials — PDFs, slides, or notes — for our AI to analyse.",
                },
                {
                  step: 2,
                  icon: FlaskConical,
                  title: "Generate",
                  description: "Our engine reads the content and creates unique MCQs with pedagogical insights.",
                },
                {
                  step: 3,
                  icon: Trophy,
                  title: "Conquer",
                  description: "Take the exam and receive precise, detailed explanations for every answer.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex-1 rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {s.step}
                    </span>
                  </div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className="py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, Student &amp; Family-Friendly Pricing
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base max-w-xl mx-auto">
              Affordable plans for every student — choose what works for you. Cancel anytime.
            </p>
          </div>

          {/* Free Trial Banner */}
          <div className="mb-10 flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-5 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-sm text-foreground">
              <span className="font-semibold text-success">Free 24-hour trial included</span> — register today and get full access for 24 hours before your plan kicks in. No payment required to start.
            </p>
          </div>

          {/* Ghana Plans */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🇬🇭</span>
              <h3 className="text-lg font-semibold text-foreground">Ghana</h3>
              <span className="text-xs text-muted-foreground">(GHS — Mobile Money)</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
              {/* Ghana Weekly */}
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Weekly</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground">GH₵&nbsp;12</span>
                  <span className="text-sm text-muted-foreground mb-1">/week</span>
                </div>
                <p className="text-xs font-medium text-success mb-4">✓ 24 hours free trial</p>
                <ul className="space-y-2 mb-6">
                  {["Unlimited AI-generated MCQs", "Theory exam scoring", "All difficulty modes", "Detailed rationales & analytics"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <span className="block cursor-pointer text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Start Free Trial
                  </span>
                </Link>
              </div>

              {/* Ghana Monthly */}
              <div className="relative rounded-2xl border-2 border-primary bg-card p-6 shadow-md">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground shadow">
                  Best Value
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Monthly</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground">GH₵&nbsp;48</span>
                  <span className="text-sm text-muted-foreground mb-1">/month</span>
                </div>
                <p className="text-xs font-medium text-success mb-4">✓ 24 hours free trial</p>
                <ul className="space-y-2 mb-6">
                  {["Everything in Weekly", "Save vs weekly billing", "Priority support", "Full entertainment hub access"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <span className="block cursor-pointer text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Start Free Trial
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* International Plans */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🌍</span>
              <h3 className="text-lg font-semibold text-foreground">International</h3>
              <span className="text-xs text-muted-foreground">(USD — Card Payment)</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:max-w-2xl">
              {/* International Weekly */}
              <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Weekly</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground">$4</span>
                  <span className="text-sm text-muted-foreground mb-1">/week</span>
                </div>
                <p className="text-xs font-medium text-success mb-4">✓ 24 hours free trial</p>
                <ul className="space-y-2 mb-6">
                  {["Unlimited AI-generated MCQs", "Theory exam scoring", "All difficulty modes", "Detailed rationales & analytics"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <span className="block cursor-pointer text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Start Free Trial
                  </span>
                </Link>
              </div>

              {/* International Monthly */}
              <div className="relative rounded-2xl border-2 border-primary bg-card p-6 shadow-md">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground shadow">
                  Best Value
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Monthly</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground">$15</span>
                  <span className="text-sm text-muted-foreground mb-1">/month</span>
                </div>
                <p className="text-xs font-medium text-success mb-4">✓ 24 hours free trial</p>
                <ul className="space-y-2 mb-6">
                  {["Everything in Weekly", "Save vs weekly billing", "Priority support", "Full entertainment hub access"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <span className="block cursor-pointer text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Start Free Trial
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to transform your study habits?
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/80 sm:text-base">
            Join thousands of students who are already using AI to boost their exam performance.
            Start generating your own custom exams today from just GH₵ 12/week.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary-foreground/90 transition-colors">
                Get Started Now
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 bg-transparent px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              View Samples
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                Quiz Your Mind
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Empowering students with AI-driven learning tools to master their studies and ace every exam.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                Resources
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {["Study Guides", "Past Questions", "Diagram Templates"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                Support
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {["Help Center", "Contact Us", "Privacy Policy"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                Follow Us
              </h4>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
              <div className="mt-3">
                <a
                  href="mailto:quizyourmind.business@gmail.com"
                  className="text-xs text-foreground hover:text-primary transition-colors break-all"
                >
                  Email: quizyourmind.business@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © 2026 Quiz Your Mind. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure Payment
              </span>
              <span className="flex items-center gap-1">
                <Headphones className="h-3.5 w-3.5" /> 24/7 Support
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
