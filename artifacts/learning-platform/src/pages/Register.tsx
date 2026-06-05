import { useState } from "react";
import { Link, useLocation } from "wouter";
import { setToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  User,
  Hash,
  Building2,
  Lock,
  ChevronDown,
  MapPin,
  Loader2,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Info,
  Mail,
} from "lucide-react";
import VerifyEmail from "./VerifyEmail";

const LEVELS = ["100", "200", "300", "400", "500", "600"];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Brazzaville)", "Congo (Kinshasa)", "Costa Rica", "Croatia", "Cuba",
  "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
];

export default function Register() {
  const [, navigate] = useLocation();
  const { refetch } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    level: "",
    institution: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [verifyState, setVerifyState] = useState<{
    userId: number;
    token: string;
    email: string;
  } | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.fullName || !form.studentId || !form.email || !form.level || !form.institution || !form.country || !form.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          studentId: form.studentId,
          email: form.email,
          level: form.level,
          institution: form.institution,
          country: form.country,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      setVerifyState({
        userId: data.userId ?? 0,
        token: data.token,
        email: form.email,
      });
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
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-border bg-card shadow-md px-8 py-10">
            <div className="mb-7 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login">
                    <span className="cursor-pointer font-medium text-primary hover:underline">Sign in</span>
                  </Link>
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="fullName" name="fullName" type="text" required placeholder="Your full name"
                    value={form.fullName} onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
                </div>
              </div>

              {/* Student ID */}
              <div className="space-y-1.5">
                <label htmlFor="studentId" className="block text-sm font-medium text-foreground">Student ID</label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="studentId" name="studentId" type="text" required placeholder="e.g. SM/SMS/22/0001"
                    value={form.studentId} onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="email" name="email" type="email" required placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
                </div>
              </div>

              {/* Level */}
              <div className="space-y-1.5">
                <label htmlFor="level" className="block text-sm font-medium text-foreground">Level</label>
                <div className="relative">
                  <select id="level" name="level" required value={form.level} onChange={handleChange}
                    className="w-full appearance-none rounded-md border border-border bg-background py-2.5 pl-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                    <option value="">Select level</option>
                    {LEVELS.map((l) => <option key={l} value={l}>Level {l}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Institution */}
              <div className="space-y-1.5">
                <label htmlFor="institution" className="block text-sm font-medium text-foreground">Institution</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="institution" name="institution" type="text" required placeholder="Your school or university"
                    value={form.institution} onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label htmlFor="country" className="block text-sm font-medium text-foreground">Country</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select id="country" name="country" required value={form.country} onChange={handleChange}
                    className="w-full appearance-none rounded-md border border-border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="password" name="password" type="password" required placeholder="Create a password"
                    value={form.password} onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="confirmPassword" name="confirmPassword" type="password" required placeholder="Re-enter your password"
                    value={form.confirmPassword} onChange={handleChange}
                    className="w-full rounded-md border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating Account…</> : "Register"}
              </button>
            </form>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-card/60 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">How it works</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Register for free and verify your email to unlock full access to your dashboard. Afterwards, click <strong>Activate My Account</strong> on your dashboard to choose a plan and continue learning.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="#" className="hover:text-primary transition-colors"><Github className="h-4 w-4" /></a>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Quiz Your Mind. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
