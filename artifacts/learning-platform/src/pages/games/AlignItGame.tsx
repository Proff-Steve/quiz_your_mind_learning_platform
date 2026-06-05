import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sounds } from "@/lib/sounds";
import { SoundPanel } from "@/components/SoundPanel";
import { RoundOverlay } from "@/components/RoundOverlay";

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: (string | null)[]): string | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function getAdjacent3Mens(pos: number): number[] {
  const adj: Record<number, number[]> = {
    0: [1, 3, 4], 1: [0, 2, 3, 4, 5], 2: [1, 4, 5],
    3: [0, 1, 4, 6, 7], 4: [0, 1, 2, 3, 5, 6, 7, 8], 5: [1, 2, 4, 7, 8],
    6: [3, 4, 7], 7: [3, 4, 5, 6, 8], 8: [4, 5, 7],
  };
  return adj[pos] || [];
}

function getAdjacentUcTas(pos: number): number[] {
  const adj: Record<number, number[]> = {
    0: [1, 3], 1: [0, 2, 4], 2: [1, 5],
    3: [0, 4, 6], 4: [1, 3, 5, 7], 5: [2, 4, 8],
    6: [3, 7], 7: [6, 4, 8], 8: [5, 7],
  };
  return adj[pos] || [];
}

function getAdjacent(pos: number, boardType: string): number[] {
  return boardType === "3mens" ? getAdjacent3Mens(pos) : getAdjacentUcTas(pos);
}

function computeAIMove(board: (string | null)[], difficulty: string, boardType: string): { from?: number; to: number } | null {
  const isPlacement = board.filter(c => c === "O").length < 3;
  const symbol = "O";
  const oppSymbol = "X";

  function canWin(s: string): number | null {
    for (const [a, b, c] of WINNING_LINES) {
      const cells = [board[a], board[b], board[c]];
      if (cells.filter(x => x === s).length === 2 && cells.includes(null)) {
        return [a, b, c][cells.indexOf(null)];
      }
    }
    return null;
  }

  if (difficulty === "easy") {
    if (isPlacement) {
      const empty = board.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
      return { to: empty[Math.floor(Math.random() * empty.length)] };
    } else {
      const pieces = board.map((v, i) => v === symbol ? i : -1).filter(i => i >= 0);
      const moves: { from: number; to: number }[] = [];
      for (const from of pieces) {
        for (const to of getAdjacent(from, boardType)) {
          if (!board[to]) moves.push({ from, to });
        }
      }
      if (!moves.length) return null;
      return moves[Math.floor(Math.random() * moves.length)];
    }
  }

  if (isPlacement) {
    const win = canWin(symbol);
    if (win !== null) return { to: win };
    const block = canWin(oppSymbol);
    if (block !== null) return { to: block };
    const corners = [0, 2, 6, 8].filter(i => !board[i]);
    if (corners.length && difficulty === "hard") return { to: corners[Math.floor(Math.random() * corners.length)] };
    if (!board[4]) return { to: 4 };
    const empty = board.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
    return { to: empty[Math.floor(Math.random() * empty.length)] };
  } else {
    const win = canWin(symbol);
    if (win !== null) {
      const pieces = board.map((v, i) => v === symbol ? i : -1).filter(i => i >= 0);
      for (const from of pieces) {
        if (getAdjacent(from, boardType).includes(win)) return { from, to: win };
      }
    }
    const block = canWin(oppSymbol);
    if (block !== null) {
      const pieces = board.map((v, i) => v === symbol ? i : -1).filter(i => i >= 0);
      for (const from of pieces) {
        if (getAdjacent(from, boardType).includes(block)) return { from, to: block };
      }
    }
    const pieces = board.map((v, i) => v === symbol ? i : -1).filter(i => i >= 0);
    const moves: { from: number; to: number }[] = [];
    for (const from of pieces) {
      for (const to of getAdjacent(from, boardType)) {
        if (!board[to]) moves.push({ from, to });
      }
    }
    if (!moves.length) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  }
}

function getToken() {
  return localStorage.getItem("qym_token") || sessionStorage.getItem("qym_token") || "";
}

interface PlayerBarProps {
  name: string;
  score: number;
  pieces: number;
  color: string;
  isBottom?: boolean;
  isActive: boolean;
  avatar?: string;
}

function PlayerBar({ name, score, pieces, color, isBottom, isActive, avatar }: PlayerBarProps) {
  const dots = Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className={`h-3.5 w-3.5 rounded-full transition-all ${
        i < pieces ? (color === "red" ? "bg-red-500" : "bg-blue-500") : "bg-gray-300"
      }`}
    />
  ));

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${isBottom ? "rounded-t-none" : ""} ${isActive ? "bg-white/40" : ""}`}>
      {!isBottom && <div className="flex gap-1">{dots}</div>}
      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm shrink-0 ${
        color === "red" ? "bg-red-400" : "bg-blue-400"
      }`}>
        {avatar || name[0]}
      </div>
      <span className="text-sm font-semibold text-gray-800 flex-1">
        {name}: <span className="text-red-600">{score}</span>
      </span>
      {isBottom && <div className="flex gap-1">{dots}</div>}
    </div>
  );
}

export default function AlignItGame() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const config = JSON.parse(localStorage.getItem("qym_game_config") || "{}");
  const gameCode = localStorage.getItem("qym_game_code") || "";
  const vsComputer = config.vsComputer === true;
  const boardType: string = config.boardType || "3mens";
  const difficulty: string = config.difficulty || "easy";
  const myRole: string = config.role || "player1";

  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<"player1" | "player2">("player1");
  const [phase, setPhase] = useState<"waiting" | "placement" | "movement">("placement");
  const [placedCount, setPlacedCount] = useState({ player1: 0, player2: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [player1Name, setPlayer1Name] = useState(user?.name || "You");
  const [player2Name, setPlayer2Name] = useState(vsComputer ? "Computer" : "Waiting...");
  const [status, setStatus] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundScores, setRoundScores] = useState({ player1: 0, player2: 0 });
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPhaseRef = useRef<string>("waiting");
  const prevBoardRef = useRef<(string | null)[]>(Array(9).fill(null));
  const prevRoundRef = useRef(1);
  const isMyTurn = currentTurn === myRole;
  const mySymbol = myRole === "player1" ? "X" : "O";
  const theirSymbol = myRole === "player1" ? "O" : "X";

  useEffect(() => {
    if (vsComputer) {
      setPhase("placement");
      setPlayer1Name(user?.name || "You");
      setPlayer2Name("Computer");
      sounds.gameStart();
      sounds.startBackground();
      return () => sounds.stopBackground();
    }

    sounds.startBackground();

    async function fetchState() {
      if (!gameCode) return;
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/games/sessions/${gameCode}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (!data.session) return;
        const s = data.session;

        const prevPhase = prevPhaseRef.current;
        const prevBoard = prevBoardRef.current;

        if (prevPhase === "waiting" && s.phase !== "waiting") {
          sounds.opponentJoined();
        }

        const oppRole = myRole === "player1" ? "player2" : "player1";
        if (s.currentTurn === myRole && prevPhase !== "waiting" && s.phase !== "waiting") {
          const changed = s.board.some((cell: string | null, i: number) => cell !== prevBoard[i]);
          if (changed) {
            sounds.move();
          }
        }

        if (s.roundNumber > prevRoundRef.current) {
          sounds.gameStart();
          setWinner(null);
          setWinningLine(null);
          setSelected(null);
        }
        prevRoundRef.current = s.roundNumber;
        prevPhaseRef.current = s.phase;
        prevBoardRef.current = s.board;

        setBoard(s.board);
        setCurrentTurn(s.currentTurn);
        setPhase(s.phase);
        setPlacedCount(s.placedCount);
        setPlayer1Name(s.player1.name);
        setPlayer2Name(s.player2?.name || "Waiting for friend...");
        setRoundNumber(s.roundNumber);
        setRoundScores(s.roundScores);
        if (s.matchWinner) setMatchWinner(s.matchWinner);
        if (s.winner) {
          setWinner(s.winner);
          detectWinningLine(s.board);
          if (!s.matchWinner) {
            const iWon = s.winner === myRole;
            setTimeout(() => iWon ? sounds.win() : sounds.lose(), 200);
          }
        }
        if (s.matchWinner) {
          const iWon = s.matchWinner === myRole;
          const isDraw = s.matchWinner === "draw";
          setTimeout(() => isDraw ? sounds.draw() : iWon ? sounds.win() : sounds.lose(), 200);
        }
      } catch {}
    }

    fetchState();
    pollRef.current = setInterval(fetchState, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      sounds.stopBackground();
    };
  }, [vsComputer, gameCode]);

  function detectWinningLine(b: (string | null)[]) {
    for (const line of WINNING_LINES) {
      const [a, c1, c2] = line;
      if (b[a] && b[a] === b[c1] && b[a] === b[c2]) {
        setWinningLine(line);
        return;
      }
    }
  }

  async function serverMove(from: number | undefined, to: number) {
    if (!gameCode) return;
    from === undefined ? sounds.place() : sounds.move();
    const res = await fetch(`${import.meta.env.BASE_URL}api/games/sessions/${gameCode}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ from, to }),
    });
    const data = await res.json();
    if (data.session) {
      const s = data.session;
      prevBoardRef.current = s.board;
      setBoard(s.board);
      setCurrentTurn(s.currentTurn);
      setPhase(s.phase);
      setPlacedCount(s.placedCount);
      setRoundScores(s.roundScores);
      if (s.matchWinner) setMatchWinner(s.matchWinner);
      if (s.winner) {
        setWinner(s.winner);
        detectWinningLine(s.board);
        if (s.winner !== "draw") setScore(prev => ({ ...prev, [s.winner]: prev[s.winner as "player1" | "player2"] + 1 }));
        if (!s.matchWinner) {
          const iWon = s.winner === myRole;
          setTimeout(() => iWon ? sounds.win() : sounds.lose(), 300);
        }
      }
      if (s.matchWinner) {
        const iWon = s.matchWinner === myRole;
        const isDraw = s.matchWinner === "draw";
        setTimeout(() => isDraw ? sounds.draw() : iWon ? sounds.win() : sounds.lose(), 300);
      }
    }
  }

  async function handleNextRound() {
    if (!gameCode || matchWinner) return;
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/games/sessions/${gameCode}/next-round`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.session) {
        const s = data.session;
        prevRoundRef.current = s.roundNumber;
        prevBoardRef.current = s.board;
        prevPhaseRef.current = s.phase;
        setRoundNumber(s.roundNumber);
        setBoard(s.board);
        setCurrentTurn(s.currentTurn);
        setPhase(s.phase);
        setPlacedCount(s.placedCount);
        setWinner(null);
        setWinningLine(null);
        setSelected(null);
        sounds.gameStart();
      }
    } catch {}
  }

  function localMove(from: number | undefined, to: number) {
    from === undefined ? sounds.place() : sounds.move();
    setBoard(prev => {
      const next = [...prev];
      if (from !== undefined) next[from] = null;
      next[to] = currentTurn === "player1" ? "X" : "O";

      const w = checkWinner(next);
      if (w) {
        const won = w === "X" ? "player1" : "player2";
        setWinner(won);
        setScore(prev2 => ({ ...prev2, [won]: prev2[won] + 1 }));
        detectWinningLine(next);
        setTimeout(() => won === "player1" ? sounds.win() : sounds.lose(), 300);
        return next;
      }

      const newPlaced = {
        ...placedCount,
        [currentTurn]: placedCount[currentTurn] + (from === undefined ? 1 : 0),
      };
      if (from === undefined) setPlacedCount(newPlaced);

      const totalPlaced = newPlaced.player1 + newPlaced.player2;
      if (totalPlaced >= 6 && phase === "placement") setPhase("movement");

      const nextTurn = currentTurn === "player1" ? "player2" : "player1";
      setCurrentTurn(nextTurn);

      if (vsComputer && nextTurn === "player2") {
        const b2 = [...next];
        const newPhase = totalPlaced >= 6 ? "movement" : "placement";
        setAiThinking(true);
        setTimeout(() => {
          const aiMove = computeAIMove(b2, difficulty, boardType);
          if (aiMove) {
            aiMove.from === undefined ? sounds.place() : sounds.move();
            const b3 = [...b2];
            if (aiMove.from !== undefined) b3[aiMove.from] = null;
            b3[aiMove.to] = "O";
            const w2 = checkWinner(b3);
            if (w2) {
              const won2 = w2 === "X" ? "player1" : "player2";
              setWinner(won2);
              setScore(prev2 => ({ ...prev2, [won2]: prev2[won2] + 1 }));
              detectWinningLine(b3);
              setTimeout(() => won2 === "player1" ? sounds.win() : sounds.lose(), 300);
            } else {
              const np2 = { ...newPlaced, player2: newPlaced.player2 + (aiMove.from === undefined ? 1 : 0) };
              setPlacedCount(np2);
              const total2 = np2.player1 + np2.player2;
              if (total2 >= 6 && newPhase === "placement") setPhase("movement");
              setCurrentTurn("player1");
            }
            setBoard(b3);
          }
          setAiThinking(false);
        }, 500 + Math.random() * 700);
      }

      return next;
    });
  }

  function handleCellClick(idx: number) {
    if (winner || aiThinking) return;
    if (!vsComputer && !isMyTurn) return;
    if (phase === "waiting") return;

    const myS = vsComputer ? (currentTurn === "player1" ? "X" : "O") : mySymbol;
    const isMyT = vsComputer ? currentTurn === "player1" : isMyTurn;
    if (!isMyT) return;

    if (phase === "placement") {
      if (board[idx] !== null) return;
      const count = vsComputer ? placedCount[currentTurn] : placedCount[myRole as "player1" | "player2"];
      if (count >= 3) return;
      if (vsComputer) localMove(undefined, idx);
      else serverMove(undefined, idx);
    } else {
      if (selected === null) {
        if (board[idx] !== myS) return;
        setSelected(idx);
      } else {
        if (idx === selected) { setSelected(null); return; }
        if (board[idx] === myS) { setSelected(idx); return; }
        const adj = getAdjacent(selected, boardType);
        if (!adj.includes(idx) || board[idx] !== null) { sounds.invalid(); setStatus("Invalid move!"); setTimeout(() => setStatus(""), 1500); return; }
        if (vsComputer) localMove(selected, idx);
        else serverMove(selected, idx);
        setSelected(null);
      }
    }
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setCurrentTurn("player1");
    setPhase("placement");
    setPlacedCount({ player1: 0, player2: 0 });
    setSelected(null);
    setWinner(null);
    setWinningLine(null);
    setStatus("");
    setAiThinking(false);
  }

  const positions: [number, number][] = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2],
  ];

  const piecesLeft1 = 3 - placedCount.player1;
  const piecesLeft2 = 3 - placedCount.player2;

  const bgStyle = { background: "linear-gradient(160deg, #a8d8d8 0%, #e8dcc8 100%)", minHeight: "100vh" };

  const turnLabel = winner
    ? winner === "draw" ? "It's a draw!" : `${winner === "player1" ? player1Name : player2Name} wins! 🎉`
    : vsComputer
    ? currentTurn === "player1" ? "Your turn" : "Computer is thinking..."
    : isMyTurn ? "Your turn" : `${currentTurn === "player1" ? player1Name : player2Name}'s turn`;

  return (
    <div style={bgStyle} className="flex flex-col select-none">
      <div className="flex items-center justify-between px-4 py-3 bg-white/30">
        <button onClick={() => navigate("/games/align-it")} className="flex items-center justify-center h-8 w-8 rounded-full bg-white/50 hover:bg-white/80 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-700" />
        </button>

        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold ${myRole === "player2" ? "bg-red-400" : "bg-blue-400"}`}>
            {player2Name[0]}
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {myRole === "player2" ? player1Name : player2Name}: <span className="text-red-500 font-bold">{myRole === "player2" ? score.player1 : score.player2}</span>
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`h-3 w-3 rounded-full ${i < (myRole === "player2" ? piecesLeft1 : piecesLeft2) ? "bg-red-400" : "bg-gray-300"}`} />
            ))}
          </div>
        </div>

        <SoundPanel />
      </div>

      {!vsComputer && (
        <div className="flex items-center justify-center gap-4 py-1.5 bg-black/10">
          <span className="text-xs font-bold text-white/90 uppercase tracking-wide">Round {roundNumber} of 3</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-black text-blue-200">{roundScores.player1}</span>
            <span className="text-white/50 text-xs">–</span>
            <span className="font-black text-red-200">{roundScores.player2}</span>
          </div>
        </div>
      )}

      <div className="text-center py-2">
        <p className={`text-sm font-semibold ${winner ? "text-green-700" : "text-gray-600"}`}>{turnLabel}</p>
        {status && <p className="text-xs text-red-500 mt-0.5">{status}</p>}
        {phase === "waiting" && <p className="text-xs text-amber-600 mt-0.5">Waiting for your friend to join…</p>}
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="relative" style={{ width: "min(85vw, 360px)", height: "min(85vw, 360px)" }}>
          <svg
            viewBox="0 0 300 300"
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 0 }}
          >
            <rect x="10" y="10" width="280" height="280" stroke="#7a2424" strokeWidth="4" fill="none" rx="3" />
            <line x1="150" y1="10" x2="150" y2="290" stroke="#7a2424" strokeWidth="3" />
            <line x1="10" y1="150" x2="290" y2="150" stroke="#7a2424" strokeWidth="3" />
            {boardType === "3mens" && (
              <>
                <line x1="10" y1="10" x2="150" y2="150" stroke="#7a2424" strokeWidth="2.5" />
                <line x1="290" y1="10" x2="150" y2="150" stroke="#7a2424" strokeWidth="2.5" />
                <line x1="10" y1="290" x2="150" y2="150" stroke="#7a2424" strokeWidth="2.5" />
                <line x1="290" y1="290" x2="150" y2="150" stroke="#7a2424" strokeWidth="2.5" />
              </>
            )}
            {winningLine && winningLine.map((pos, i) => {
              if (i === 0) {
                const [ax, ay] = [positions[pos][0] * 140 + 10, positions[pos][1] * 140 + 10];
                const [bx, by] = [positions[winningLine[2]][0] * 140 + 10, positions[winningLine[2]][1] * 140 + 10];
                return <line key="win" x1={ax} y1={ay} x2={bx} y2={by} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.7" />;
              }
              return null;
            })}
          </svg>

          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            {positions.map(([col, row], idx) => {
              const x = col * 140 + 10;
              const y = row * 140 + 10;
              const pct_x = (x / 300) * 100;
              const pct_y = (y / 300) * 100;

              const cell = board[idx];
              const isWinCell = winningLine?.includes(idx);
              const isSelected = selected === idx;

              const myS = vsComputer ? (currentTurn === "player1" ? "X" : "O") : mySymbol;
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all"
                  style={{
                    left: `${pct_x}%`,
                    top: `${pct_y}%`,
                    width: "52px",
                    height: "52px",
                  }}
                >
                  {cell ? (
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md border-2 transition-all ${
                      cell === "X"
                        ? isWinCell ? "bg-blue-500 border-yellow-400 scale-110" : isSelected ? "bg-blue-400 border-blue-300 ring-2 ring-blue-300" : "bg-blue-500 border-blue-300"
                        : isWinCell ? "bg-red-500 border-yellow-400 scale-110" : "bg-red-500 border-red-300"
                    }`}>
                      <span className="text-white font-black text-lg">{cell}</span>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-white/30 hover:bg-white/60 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>

          {!vsComputer && winner && (
            <RoundOverlay
              roundWinner={winner}
              matchWinner={matchWinner}
              myRole={myRole}
              player1Name={player1Name}
              player2Name={player2Name}
              roundNumber={roundNumber}
              roundScores={roundScores}
              onNextRound={handleNextRound}
            />
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-white/40 border border-white/60 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`h-3 w-3 rounded-full ${i < (myRole === "player1" ? piecesLeft1 : piecesLeft2) ? "bg-blue-400" : "bg-gray-300"}`} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                {myRole === "player1" ? player1Name : player2Name}: <span className="text-blue-600 font-bold">{myRole === "player1" ? score.player1 : score.player2}</span>
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold ${myRole === "player1" ? "bg-blue-400" : "bg-red-400"}`}>
                {(myRole === "player1" ? player1Name : player2Name)[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-3xl bg-white p-8 text-center shadow-2xl mx-4 max-w-sm w-full">
            <div className="text-5xl mb-4">
              {winner === "draw" ? "🤝" : (winner === "player1" ? player1Name : player2Name) === (vsComputer ? user?.name || "You" : (myRole === "player1" ? player1Name : player2Name)) ? "🎉" : "😞"}
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              {winner === "draw" ? "It's a Draw!" : `${winner === "player1" ? player1Name : player2Name} Wins!`}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Score — {player1Name}: {score.player1} · {player2Name}: {score.player2}
            </p>
            <div className="flex gap-3">
              <button
                onClick={resetGame}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate("/entertainment")}
                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
