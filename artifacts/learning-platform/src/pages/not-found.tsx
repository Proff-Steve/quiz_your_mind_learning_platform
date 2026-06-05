import { BookOpen, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 text-primary">
          <BookOpen className="h-8 w-8" />
          <span className="text-2xl font-semibold">Quiz Your Mind</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold text-primary">404</h1>
          <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link href="/dashboard">
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Back to Dashboard
          </span>
        </Link>
      </div>
    </div>
  );
}
