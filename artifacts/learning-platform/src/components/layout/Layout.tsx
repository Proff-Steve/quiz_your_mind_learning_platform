import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
