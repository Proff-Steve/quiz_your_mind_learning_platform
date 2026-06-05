import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  LayoutDashboard,
  FolderOpen,
  ClockIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Menu,
  X,
  Wallet,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Materials", icon: FolderOpen, href: "/materials" },
  { label: "Exam History", icon: ClockIcon, href: "/history" },
  { label: "My Account Balance", icon: Wallet, href: "/my-account-balance" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("qym_sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();

  const displayName = user?.name ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("qym_sidebar_collapsed", String(next));
      return next;
    });
  }

  function handleLogout() {
    logout();
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 text-foreground">

      {/* ── TOP NAVBAR ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              title="Open menu"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/dashboard">
              <span className="flex cursor-pointer items-center gap-2 font-semibold text-primary">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline">Quiz Your Mind</span>
              </span>
            </Link>
          </div>

          {/* Right: user profile */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">Student Account</p>
            </div>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-primary/20">
                {initials}
              </div>
            )}
            <span className="hidden h-2 w-2 rounded-full bg-success sm:block" />
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER OVERLAY ────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* ── MOBILE DRAWER ────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card shadow-xl
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span className="flex items-center gap-2 font-semibold text-primary">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            Quiz Your Mind
          </span>
          <button
            onClick={closeMobileMenu}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto p-3 pt-4">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = location === item.href;
              return (
                <li key={item.label}>
                  <Link href={item.href}>
                    <span
                      onClick={closeMobileMenu}
                      className={`
                        flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium
                        transition-colors duration-150
                        ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Drawer user info */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={displayName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-primary/20">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">Student Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── COLLAPSIBLE SIDEBAR (desktop only) ───────────── */}
        <aside
          className={`
            relative hidden shrink-0 border-r border-border bg-card lg:flex lg:flex-col
            transition-[width] duration-300 ease-in-out
            ${collapsed ? "w-16" : "w-48"}
          `}
        >
          {/* Toggle button — sits on the right edge of the sidebar */}
          <button
            onClick={toggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="
              absolute -right-3.5 top-5 z-10
              flex h-7 w-7 items-center justify-center
              rounded-full border border-border bg-card
              text-muted-foreground shadow-sm
              hover:bg-muted hover:text-foreground
              transition-colors
            "
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>

          <nav className="flex-1 overflow-hidden p-3 pt-4">
            <p
              className={`
                mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground
                transition-opacity duration-200
                ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}
              `}
            >
              Menu
            </p>

            <ul className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const active = location === item.href;
                return (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <span
                        title={collapsed ? item.label : undefined}
                        className={`
                          flex cursor-pointer items-center rounded-md py-2 text-sm font-medium
                          transition-colors duration-150
                          ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"}
                          ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                        `}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span
                          className={`
                            overflow-hidden whitespace-nowrap
                            transition-[max-width,opacity] duration-300 ease-in-out
                            ${collapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"}
                          `}
                        >
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* ── MAIN CONTENT + FOOTER ─────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-auto">
          <main className="flex-1">
            {children}
          </main>

          {/* ── SHARED FOOTER ──────────────────────────────── */}
          <footer className="border-t border-border bg-card">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
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
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    Resources
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {["Study Guides", "Past Questions", "Diagram Templates"].map((item) => (
                      <li key={item}>
                        <a href="#" className="hover:text-foreground transition-colors">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    Support
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {["Help Center", "Contact Us", "Privacy Policy"].map((item) => (
                      <li key={item}>
                        <a href="#" className="hover:text-foreground transition-colors">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                    Follow Us
                  </h4>
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
              <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
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
      </div>
    </div>
  );
}
