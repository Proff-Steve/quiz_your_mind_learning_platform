import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="font-semibold tracking-tight">ExamAI</span>
        </div>
      </div>
    </header>
  );
}
