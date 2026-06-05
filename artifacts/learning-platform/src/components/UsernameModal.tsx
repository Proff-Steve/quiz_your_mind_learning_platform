import { useState } from "react";
import { User, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { getToken } from "@/lib/auth";

interface UsernameModalProps {
  onSuccess: (username: string) => void;
  onDismiss?: () => void;
  required?: boolean;
}

function validateUsername(value: string): string | null {
  const handle = value.replace(/^@+/, "");
  if (handle.length < 2) return "Username must be at least 2 characters.";
  if (handle.length > 49) return "Username must be 50 characters or fewer.";
  if (!/^[a-zA-Z0-9_]+$/.test(handle)) return "Only letters, numbers, and underscores are allowed.";
  return null;
}

export function UsernameModal({ onSuccess, onDismiss, required = false }: UsernameModalProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    const validationError = validateUsername(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
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
      const data = await res.json() as { ok?: boolean; username?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save username.");
        return;
      }
      onSuccess(data.username ?? trimmed);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">Choose a Username</h2>
          </div>
          {!required && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your username is shown on leaderboards instead of your real name. Use only letters, numbers, or underscores.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={value}
                onChange={handleInput}
                placeholder="e.g. medstudent_2026"
                maxLength={50}
                autoFocus
                className="w-full rounded-lg border border-border bg-muted/30 pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Example: <span className="font-mono font-medium text-foreground">medstudent_2026</span>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {!required && onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            )}
            <button
              type="submit"
              disabled={saving || value.trim().length < 2}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Save Username</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
