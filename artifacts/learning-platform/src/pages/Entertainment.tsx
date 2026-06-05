import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Gamepad2, ChevronRight, ArrowLeft } from "lucide-react";

const GAMES = [
  {
    id: "align-it",
    title: "Align It: Three Men's Morris",
    description: "A classic strategy game. Place and move your 3 pieces to get them in a row before your opponent!",
    icon: "⬡",
    color: "from-orange-400 to-red-500",
    route: "/games/align-it",
    badge: "Strategy",
  },
  {
    id: "chess",
    title: "Chess",
    description: "The timeless game of kings. Move your pieces strategically to checkmate your opponent's king.",
    icon: "♟",
    color: "from-slate-600 to-slate-800",
    route: "/games/chess",
    badge: "Classic",
  },
];

export default function Entertainment() {
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Entertainment</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-13">
            Take a break and enjoy a game! Challenge the computer or play with friends.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => navigate(game.route)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${game.color} text-3xl text-white shadow-sm`}>
                    {game.icon}
                  </div>
                  <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {game.badge}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {game.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {game.description}
                </p>

                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Play Now <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">More games coming soon!</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
