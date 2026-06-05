import { useEffect, useState } from "react";

interface RoundOverlayProps {
  roundWinner: string | null;
  matchWinner: string | null;
  myRole: string;
  player1Name: string;
  player2Name: string;
  roundNumber: number;
  roundScores: { player1: number; player2: number };
  onNextRound: () => void;
}

export function RoundOverlay({
  roundWinner,
  matchWinner,
  myRole,
  player1Name,
  player2Name,
  roundNumber,
  roundScores,
  onNextRound,
}: RoundOverlayProps) {
  const [countdown, setCountdown] = useState(5);

  const winnerName = roundWinner === "player1" ? player1Name
    : roundWinner === "player2" ? player2Name
    : null;

  const matchWinnerName = matchWinner === "player1" ? player1Name
    : matchWinner === "player2" ? player2Name
    : null;

  const iWonRound = roundWinner === myRole;
  const iWonMatch = matchWinner === myRole;
  const isDraw = roundWinner === "draw";
  const isMatchDraw = matchWinner === "draw";

  useEffect(() => {
    if (!roundWinner || matchWinner) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roundWinner, matchWinner]);

  if (!roundWinner && !matchWinner) return null;

  if (matchWinner) {
    return (
      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 flex flex-col items-center gap-4 max-w-xs w-full">
          <div className="text-4xl">{isMatchDraw ? "🤝" : iWonMatch ? "🏆" : "😔"}</div>
          <h2 className="text-xl font-black text-gray-800 text-center">
            {isMatchDraw ? "Match Draw!" : `${matchWinnerName} wins the match!`}
          </h2>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-xs text-gray-500">{player1Name}</p>
              <p className="text-2xl font-black text-blue-600">{roundScores.player1}</p>
            </div>
            <div className="text-gray-300 text-2xl font-bold self-center">–</div>
            <div>
              <p className="text-xs text-gray-500">{player2Name}</p>
              <p className="text-2xl font-black text-red-500">{roundScores.player2}</p>
            </div>
          </div>
          {!isMatchDraw && (
            <div className={`rounded-xl px-4 py-2 text-sm font-semibold text-center ${iWonMatch ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {iWonMatch
                ? "GH₵0.50 added to your account!"
                : "GH₵0.50 deducted from your account."}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
      <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 flex flex-col items-center gap-3 max-w-xs w-full">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Round {roundNumber} over</p>
        <div className="text-3xl">{isDraw ? "🤝" : iWonRound ? "🎉" : "😤"}</div>
        <h2 className="text-lg font-black text-gray-800 text-center">
          {isDraw ? "It's a Draw!" : `${winnerName} won this round!`}
        </h2>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-xs text-gray-500">{player1Name}</p>
            <p className="text-2xl font-black text-blue-600">{roundScores.player1}</p>
          </div>
          <div className="text-gray-300 text-2xl font-bold self-center">–</div>
          <div>
            <p className="text-xs text-gray-500">{player2Name}</p>
            <p className="text-2xl font-black text-red-500">{roundScores.player2}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">Next round in <span className="font-bold text-gray-700">{countdown}s</span>…</div>
        <button
          onClick={onNextRound}
          className="w-full py-2 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors text-sm"
        >
          Start Now
        </button>
      </div>
    </div>
  );
}
