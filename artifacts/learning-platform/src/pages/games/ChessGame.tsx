import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sounds } from "@/lib/sounds";
import { SoundPanel } from "@/components/SoundPanel";
import { RoundOverlay } from "@/components/RoundOverlay";

type Piece = string | null;
type Color = "white" | "black";

const PIECE_SYMBOLS: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

const PIECE_COLORS: Record<string, string> = {
  w: "text-amber-100", b: "text-gray-900",
};

function initBoard(): Piece[] {
  const board: Piece[] = Array(64).fill(null);
  const backRank = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let i = 0; i < 8; i++) {
    board[i] = "b" + backRank[i];
    board[8 + i] = "bP";
    board[48 + i] = "wP";
    board[56 + i] = "w" + backRank[i];
  }
  return board;
}

function pieceColor(p: Piece): Color | null {
  if (!p) return null;
  return p[0] === "w" ? "white" : "black";
}

function idx(row: number, col: number): number { return row * 8 + col; }
function row(i: number): number { return Math.floor(i / 8); }
function col(i: number): number { return i % 8; }

function getLegalMoves(board: Piece[], from: number, enPassant: number | null, castlingRights: string): number[] {
  const piece = board[from];
  if (!piece) return [];
  const color = pieceColor(piece) as Color;
  const oppColor = color === "white" ? "black" : "white";
  const r = row(from), c = col(from);
  const moves: number[] = [];
  const type = piece[1];

  function addIfValid(to: number) {
    if (to < 0 || to >= 64) return;
    const target = board[to];
    if (target && pieceColor(target) === color) return;
    moves.push(to);
  }

  function addSliding(drs: [number, number][]) {
    for (const [dr, dc] of drs) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const ti = idx(nr, nc);
        if (board[ti]) {
          if (pieceColor(board[ti]) !== color) moves.push(ti);
          break;
        }
        moves.push(ti);
        nr += dr; nc += dc;
      }
    }
  }

  if (type === "P") {
    const dir = color === "white" ? -1 : 1;
    const startRow = color === "white" ? 6 : 1;
    const nr = r + dir;
    if (nr >= 0 && nr < 8) {
      if (!board[idx(nr, c)]) {
        moves.push(idx(nr, c));
        if (r === startRow && !board[idx(nr + dir, c)]) moves.push(idx(nr + dir, c));
      }
      for (const dc of [-1, 1]) {
        const nc2 = c + dc;
        if (nc2 >= 0 && nc2 < 8) {
          const ti = idx(nr, nc2);
          if (board[ti] && pieceColor(board[ti]) === oppColor) moves.push(ti);
          if (enPassant === ti) moves.push(ti);
        }
      }
    }
  } else if (type === "R") {
    addSliding([[0,1],[0,-1],[1,0],[-1,0]]);
  } else if (type === "B") {
    addSliding([[1,1],[1,-1],[-1,1],[-1,-1]]);
  } else if (type === "Q") {
    addSliding([[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
  } else if (type === "N") {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr2 = r + dr, nc2 = c + dc;
      if (nr2 >= 0 && nr2 < 8 && nc2 >= 0 && nc2 < 8) addIfValid(idx(nr2, nc2));
    }
  } else if (type === "K") {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const nr2 = r + dr, nc2 = c + dc;
      if (nr2 >= 0 && nr2 < 8 && nc2 >= 0 && nc2 < 8) addIfValid(idx(nr2, nc2));
    }
    if (color === "white" && r === 7) {
      if (castlingRights.includes("K") && !board[idx(7,5)] && !board[idx(7,6)]) moves.push(idx(7,6));
      if (castlingRights.includes("Q") && !board[idx(7,3)] && !board[idx(7,2)] && !board[idx(7,1)]) moves.push(idx(7,2));
    }
    if (color === "black" && r === 0) {
      if (castlingRights.includes("k") && !board[idx(0,5)] && !board[idx(0,6)]) moves.push(idx(0,6));
      if (castlingRights.includes("q") && !board[idx(0,3)] && !board[idx(0,2)] && !board[idx(0,1)]) moves.push(idx(0,2));
    }
  }

  return moves.filter(to => {
    const nb = applyMove([...board], from, to, piece, enPassant);
    return !isInCheck(nb, color);
  });
}

function isInCheck(board: Piece[], color: Color): boolean {
  const kingSymbol = color === "white" ? "wK" : "bK";
  const kingIdx = board.indexOf(kingSymbol);
  if (kingIdx === -1) return false;
  const oppColor = color === "white" ? "black" : "white";
  for (let i = 0; i < 64; i++) {
    if (board[i] && pieceColor(board[i]) === oppColor) {
      const moves = getRawMoves(board, i, null);
      if (moves.includes(kingIdx)) return true;
    }
  }
  return false;
}

function getRawMoves(board: Piece[], from: number, enPassant: number | null): number[] {
  const piece = board[from];
  if (!piece) return [];
  const color = pieceColor(piece);
  const oppColor = color === "white" ? "black" : "white";
  const r = row(from), c = col(from);
  const moves: number[] = [];
  const type = piece[1];

  function addIfValid(to: number) {
    if (to < 0 || to >= 64) return;
    const target = board[to];
    if (target && pieceColor(target) === color) return;
    moves.push(to);
  }
  function addSliding(drs: [number, number][]) {
    for (const [dr, dc] of drs) {
      let nr = r + dr, nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const ti = idx(nr, nc);
        if (board[ti]) {
          if (pieceColor(board[ti]) !== color) moves.push(ti);
          break;
        }
        moves.push(ti);
        nr += dr; nc += dc;
      }
    }
  }

  if (type === "P") {
    const dir = color === "white" ? -1 : 1;
    const startRow = color === "white" ? 6 : 1;
    const nr = r + dir;
    if (nr >= 0 && nr < 8) {
      if (!board[idx(nr, c)]) {
        moves.push(idx(nr, c));
        if (r === startRow && !board[idx(nr + dir, c)]) moves.push(idx(nr + dir, c));
      }
      for (const dc of [-1, 1]) {
        const nc2 = c + dc;
        if (nc2 >= 0 && nc2 < 8) {
          const ti = idx(nr, nc2);
          if ((board[ti] && pieceColor(board[ti]) === oppColor) || enPassant === ti) moves.push(ti);
        }
      }
    }
  } else if (type === "R") { addSliding([[0,1],[0,-1],[1,0],[-1,0]]);
  } else if (type === "B") { addSliding([[1,1],[1,-1],[-1,1],[-1,-1]]);
  } else if (type === "Q") { addSliding([[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
  } else if (type === "N") {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const nr2 = r + dr, nc2 = c + dc;
      if (nr2 >= 0 && nr2 < 8 && nc2 >= 0 && nc2 < 8) addIfValid(idx(nr2, nc2));
    }
  } else if (type === "K") {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const nr2 = r + dr, nc2 = c + dc;
      if (nr2 >= 0 && nr2 < 8 && nc2 >= 0 && nc2 < 8) addIfValid(idx(nr2, nc2));
    }
  }
  return moves;
}

function applyMove(board: Piece[], from: number, to: number, piece: string, enPassant: number | null, promotion?: string): Piece[] {
  const nb = [...board];
  const type = piece[1];
  const color = piece[0];
  const r_from = row(from), c_from = col(from);
  const r_to = row(to);

  nb[to] = piece;
  nb[from] = null;

  if (type === "P") {
    if (enPassant === to) {
      const dir = color === "w" ? 1 : -1;
      nb[idx(r_to + dir, col(to))] = null;
    }
    if (r_to === 0 || r_to === 7) {
      nb[to] = color + (promotion || "Q");
    }
  }
  if (type === "K") {
    if (to === from + 2) { nb[from + 1] = color + "R"; nb[from + 3] = null; }
    if (to === from - 2) { nb[from - 1] = color + "R"; nb[from - 4] = null; }
  }
  return nb;
}

function getAIMove(board: Piece[], color: Color, difficulty: string): { from: number; to: number } | null {
  const myPieces: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (board[i] && pieceColor(board[i]) === color) myPieces.push(i);
  }

  const allMoves: { from: number; to: number; score: number }[] = [];
  for (const from of myPieces) {
    const moves = getLegalMoves(board, from, null, "");
    for (const to of moves) {
      let score = 0;
      const captured = board[to];
      if (captured) {
        const vals: Record<string, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };
        score += (vals[captured[1]] || 0) * 10;
      }
      if (difficulty === "hard") {
        const nb = applyMove([...board], from, to, board[from]!, null);
        if (isInCheck(nb, color === "white" ? "black" : "white")) score += 5;
      }
      score += Math.random() * (difficulty === "easy" ? 20 : difficulty === "medium" ? 5 : 2);
      allMoves.push({ from, to, score });
    }
  }

  if (!allMoves.length) return null;

  if (difficulty === "easy") {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }
  allMoves.sort((a, b) => b.score - a.score);
  const topN = difficulty === "hard" ? 3 : 5;
  const top = allMoves.slice(0, topN);
  return top[Math.floor(Math.random() * top.length)];
}

function getToken() {
  return localStorage.getItem("qym_token") || sessionStorage.getItem("qym_token") || "";
}

export default function ChessGame() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const config = JSON.parse(localStorage.getItem("qym_game_config") || "{}");
  const gameCode = localStorage.getItem("qym_game_code") || "";
  const vsComputer = config.vsComputer === true;
  const difficulty: string = config.difficulty || "easy";
  const myRole: string = config.role || "player1";
  const myColor: Color = myRole === "player1" ? "white" : "black";

  const [board, setBoard] = useState<Piece[]>(initBoard());
  const [currentTurn, setCurrentTurn] = useState<Color>("white");
  const [selected, setSelected] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<number[]>([]);
  const [enPassant, setEnPassant] = useState<number | null>(null);
  const [castlingRights, setCastlingRights] = useState("KQkq");
  const [winner, setWinner] = useState<string | null>(null);
  const [promotionPending, setPromotionPending] = useState<{ from: number; to: number } | null>(null);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [player1Name, setPlayer1Name] = useState(user?.name || "You");
  const [player2Name, setPlayer2Name] = useState(vsComputer ? "Computer" : "Waiting...");
  const [phase, setPhase] = useState<"waiting" | "playing">(vsComputer ? "playing" : "waiting");
  const [aiThinking, setAiThinking] = useState(false);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundScores, setRoundScores] = useState({ player1: 0, player2: 0 });
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [roundWinnerRole, setRoundWinnerRole] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPhaseRef = useRef<string>("waiting");
  const prevBoardRef = useRef<(string | null)[]>([]);
  const prevRoundRef = useRef(1);

  const isMyTurn = vsComputer ? currentTurn === "white" : currentTurn === myColor;
  const flipped = myRole === "player2";

  useEffect(() => {
    if (vsComputer) {
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
        const newPhase = s.phase === "waiting" ? "waiting" : "playing";

        if (prevPhase === "waiting" && newPhase === "playing") {
          sounds.opponentJoined();
        }

        const myTurnColor: Color = myRole === "player1" ? "white" : "black";
        const newTurnColor: Color = s.currentTurn === "player1" ? "white" : "black";
        if (newTurnColor === myTurnColor && prevBoard.length > 0 && prevPhase !== "waiting") {
          const changed = s.board.some((cell: string | null, i: number) => cell !== prevBoard[i]);
          if (changed) {
            const anyCapture = prevBoard.some((cell: string | null, i: number) => cell !== null && s.board[i] === null);
            anyCapture ? sounds.capture() : sounds.move();
            if (s.inCheck) sounds.check();
          }
        }

        if (s.roundNumber > prevRoundRef.current) {
          sounds.gameStart();
          setWinner(null);
          setRoundWinnerRole(null);
          setSelected(null);
          setLegalMoves([]);
          setLastMove(null);
          setCapturedWhite([]);
          setCapturedBlack([]);
        }
        prevRoundRef.current = s.roundNumber;
        prevPhaseRef.current = newPhase;
        prevBoardRef.current = s.board;

        setBoard(s.board);
        setCurrentTurn(s.currentTurn === "player1" ? "white" : "black");
        setPhase(newPhase);
        setPlayer1Name(s.player1.name);
        setPlayer2Name(s.player2?.name || "Waiting for friend...");
        setRoundNumber(s.roundNumber);
        setRoundScores(s.roundScores);
        if (s.matchWinner) setMatchWinner(s.matchWinner);
        if (s.winner && !s.matchWinner) {
          const roundWinnerName = s.winner === "player1" ? s.player1.name : s.winner === "player2" ? s.player2?.name || "Player 2" : "Draw";
          setWinner(roundWinnerName);
          setRoundWinnerRole(s.winner);
          const iWon = s.winner === myRole;
          const isDraw = s.winner === "draw";
          setTimeout(() => isDraw ? sounds.draw() : iWon ? sounds.win() : sounds.lose(), 200);
        }
        if (s.matchWinner) {
          const matchWinnerName = s.matchWinner === "player1" ? s.player1.name : s.matchWinner === "player2" ? s.player2?.name || "Player 2" : "Draw";
          setWinner(matchWinnerName);
          setRoundWinnerRole(s.winner ?? null);
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

  function handleSquareClick(i: number) {
    if (winner || aiThinking || phase === "waiting") return;
    if (!isMyTurn) return;

    const piece = board[i];

    if (selected === null) {
      if (!piece || pieceColor(piece) !== (vsComputer ? "white" : myColor)) return;
      setSelected(i);
      setLegalMoves(getLegalMoves(board, i, enPassant, castlingRights));
      return;
    }

    if (i === selected) { setSelected(null); setLegalMoves([]); return; }
    if (piece && pieceColor(piece) === (vsComputer ? "white" : myColor)) {
      setSelected(i);
      setLegalMoves(getLegalMoves(board, i, enPassant, castlingRights));
      return;
    }

    if (!legalMoves.includes(i)) { setSelected(null); setLegalMoves([]); return; }

    const movingPiece = board[selected]!;
    const isPromotion = movingPiece[1] === "P" && (row(i) === 0 || row(i) === 7);

    if (isPromotion) {
      setPromotionPending({ from: selected, to: i });
      setSelected(null); setLegalMoves([]);
      return;
    }

    executeMove(selected, i, movingPiece, undefined);
  }

  function executeMove(from: number, to: number, piece: string, promotion: string | undefined) {
    const captured = board[to];
    const nb = applyMove([...board], from, to, piece, enPassant, promotion);

    if (captured) {
      sounds.capture();
      if (pieceColor(captured) === "white") setCapturedWhite(prev => [...prev, captured]);
      else setCapturedBlack(prev => [...prev, captured]);
    } else {
      sounds.move();
    }

    let newEP: number | null = null;
    if (piece[1] === "P" && Math.abs(row(to) - row(from)) === 2) {
      newEP = idx((row(from) + row(to)) / 2, col(to));
    }

    let newCR = castlingRights;
    if (piece === "wK") newCR = newCR.replace("K", "").replace("Q", "");
    if (piece === "bK") newCR = newCR.replace("k", "").replace("q", "");
    if (from === 63 || to === 63) newCR = newCR.replace("K", "");
    if (from === 56 || to === 56) newCR = newCR.replace("Q", "");
    if (from === 7 || to === 7) newCR = newCR.replace("k", "");
    if (from === 0 || to === 0) newCR = newCR.replace("q", "");

    setBoard(nb);
    setEnPassant(newEP);
    setCastlingRights(newCR);
    setLastMove([from, to]);
    setSelected(null);
    setLegalMoves([]);

    const nextColor: Color = piece[0] === "w" ? "black" : "white";
    const oppHasMoves = checkHasMoves(nb, nextColor, newEP, newCR);
    if (!oppHasMoves) {
      if (isInCheck(nb, nextColor)) {
        const winnerName = piece[0] === "w" ? (vsComputer ? "You" : player1Name) : player2Name;
        setWinner(winnerName);
        setTimeout(() => piece[0] === "w" ? sounds.win() : sounds.lose(), 300);
      } else {
        setWinner("Draw (Stalemate)");
        setTimeout(() => sounds.draw(), 300);
      }
      return;
    }

    if (isInCheck(nb, nextColor)) {
      sounds.check();
    }

    setCurrentTurn(nextColor);

    if (vsComputer && nextColor === "black") {
      setAiThinking(true);
      setTimeout(() => {
        const aiMove = getAIMove(nb, "black", difficulty);
        if (aiMove) {
          const aiPiece = nb[aiMove.from]!;
          const isAIPromo = aiPiece[1] === "P" && (row(aiMove.to) === 0 || row(aiMove.to) === 7);
          const nb2 = applyMove([...nb], aiMove.from, aiMove.to, aiPiece, newEP, isAIPromo ? "Q" : undefined);
          const captured2 = nb[aiMove.to];
          if (captured2) {
            sounds.capture();
            setCapturedWhite(prev => [...prev, captured2]);
          } else {
            sounds.move();
          }
          setBoard(nb2);
          setLastMove([aiMove.from, aiMove.to]);
          const hasM = checkHasMoves(nb2, "white", null, newCR);
          if (!hasM) {
            if (isInCheck(nb2, "white")) {
              setWinner("Computer");
              setTimeout(() => sounds.lose(), 300);
            } else {
              setWinner("Draw (Stalemate)");
              setTimeout(() => sounds.draw(), 300);
            }
          } else {
            if (isInCheck(nb2, "white")) sounds.check();
            setCurrentTurn("white");
          }
        }
        setAiThinking(false);
      }, 400 + Math.random() * 600);
    }
  }

  function checkHasMoves(board: Piece[], color: Color, ep: number | null, cr: string): boolean {
    for (let i = 0; i < 64; i++) {
      if (board[i] && pieceColor(board[i]) === color) {
        if (getLegalMoves(board, i, ep, cr).length > 0) return true;
      }
    }
    return false;
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
        prevPhaseRef.current = "playing";
        setRoundNumber(s.roundNumber);
        setBoard(s.board);
        setCurrentTurn("white");
        setPhase("playing");
        setWinner(null);
        setRoundWinnerRole(null);
        setSelected(null);
        setLegalMoves([]);
        setLastMove(null);
        setCapturedWhite([]);
        setCapturedBlack([]);
        sounds.gameStart();
      }
    } catch {}
  }

  async function serverMove(from: number, to: number, promotion?: string) {
    if (!gameCode) return;
    const res = await fetch(`${import.meta.env.BASE_URL}api/games/sessions/${gameCode}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ from, to, promotion }),
    });
    const data = await res.json();
    if (data.session) {
      const s = data.session;
      setBoard(s.board);
      setCurrentTurn(s.currentTurn === "player1" ? "white" : "black");
      setRoundScores(s.roundScores);
      if (s.matchWinner) setMatchWinner(s.matchWinner);
      if (s.winner && !s.matchWinner) {
        setWinner(s.winner === "player1" ? s.player1.name : s.player2?.name || "Player 2");
        setRoundWinnerRole(s.winner);
      }
      if (s.matchWinner) {
        setWinner(s.matchWinner === "player1" ? s.player1.name : s.matchWinner === "player2" ? s.player2?.name || "Player 2" : "Draw");
        setRoundWinnerRole(s.winner ?? null);
      }
    }
  }

  const squares = flipped ? Array.from({ length: 64 }, (_, i) => 63 - i) : Array.from({ length: 64 }, (_, i) => i);
  const files = flipped ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"];
  const ranks = flipped ? ["1","2","3","4","5","6","7","8"] : ["8","7","6","5","4","3","2","1"];

  const oppName = myRole === "player1" ? player2Name : player1Name;
  const myName = myRole === "player1" ? player1Name : player2Name;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 select-none">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
        <button onClick={() => navigate("/games/chess")} className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-200" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-white">Chess</p>
          {phase === "waiting" && <p className="text-xs text-amber-400">Waiting for friend…</p>}
          {phase === "playing" && !winner && (
            <p className={`text-xs font-medium ${isMyTurn ? "text-green-400" : "text-gray-400"}`}>
              {aiThinking ? "Computer thinking…" : isMyTurn ? "Your turn" : `${oppName}'s turn`}
            </p>
          )}
        </div>
        <SoundPanel variant="dark" />
      </div>

      {!vsComputer && (
        <div className="flex items-center justify-center gap-4 py-1.5 bg-gray-700/60">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Round {roundNumber} of 3</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-black text-blue-300">{roundScores.player1}</span>
            <span className="text-gray-500 text-xs">–</span>
            <span className="font-black text-red-300">{roundScores.player2}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center py-3 px-2 gap-2">
        <div className="flex items-center gap-3 w-full max-w-sm px-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm ${myRole === "player2" ? "bg-amber-200 text-gray-900" : "bg-gray-700 text-white"}`}>
            {oppName[0]}
          </div>
          <span className="text-sm font-semibold text-gray-200 flex-1">{oppName}</span>
          <div className="flex gap-0.5 flex-wrap max-w-[120px]">
            {(myColor === "white" ? capturedBlack : capturedWhite).map((p, i) => (
              <span key={i} className="text-xs text-gray-400">{PIECE_SYMBOLS[p] || "?"}</span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative" style={{ width: "min(90vw, 400px)", height: "min(90vw, 400px)" }}>
          <div className="grid w-full h-full" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
            {squares.map((squareIdx, displayIdx) => {
              const r = row(squareIdx), c2 = col(squareIdx);
              const isLight = (r + c2) % 2 === 0;
              const piece = board[squareIdx];
              const isSelected = selected === squareIdx;
              const isLastMove = lastMove && (lastMove[0] === squareIdx || lastMove[1] === squareIdx);
              const fileLabel = displayIdx >= 56 ? files[displayIdx % 8] : null;
              const rankLabel = displayIdx % 8 === 0 ? ranks[Math.floor(displayIdx / 8)] : null;

              return (
                <div
                  key={squareIdx}
                  onClick={() => handleSquareClick(squareIdx)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isSelected ? "bg-yellow-400" :
                    isLastMove ? (isLight ? "bg-yellow-200" : "bg-yellow-600") :
                    isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]"
                  }`}
                  style={{ aspectRatio: "1" }}
                >
                  {rankLabel && <span className="absolute top-0.5 left-0.5 text-[9px] font-bold text-gray-700/60 leading-none">{rankLabel}</span>}
                  {fileLabel && <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold text-gray-700/60 leading-none">{fileLabel}</span>}
                  {piece && (
                    <span className={`text-[min(7vw,32px)] leading-none select-none ${pieceColor(piece) === "white" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" : "drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"}`}
                      style={{ color: pieceColor(piece) === "white" ? "#fff" : "#1a1a1a", WebkitTextStroke: pieceColor(piece) === "white" ? "1px #333" : "0.5px #fff" }}
                    >
                      {PIECE_SYMBOLS[piece] || "?"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {!vsComputer && roundWinnerRole && (
            <RoundOverlay
              roundWinner={roundWinnerRole}
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

        <div className="flex items-center gap-3 w-full max-w-sm px-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm ${myColor === "white" ? "bg-amber-200 text-gray-900" : "bg-gray-700 text-white"}`}>
            {myName[0]}
          </div>
          <span className="text-sm font-semibold text-gray-200 flex-1">{myName} {myColor === "white" ? "(White)" : "(Black)"}</span>
          <div className="flex gap-0.5 flex-wrap max-w-[120px]">
            {(myColor === "white" ? capturedWhite : capturedBlack).map((p, i) => (
              <span key={i} className="text-xs text-gray-400">{PIECE_SYMBOLS[p] || "?"}</span>
            ))}
          </div>
        </div>
      </div>

      {promotionPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-2xl bg-white p-6 text-center shadow-2xl">
            <p className="font-bold text-gray-800 mb-4">Choose promotion piece</p>
            <div className="flex gap-3">
              {["Q","R","B","N"].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const piece = board[promotionPending.from]!;
                    if (vsComputer) {
                      executeMove(promotionPending.from, promotionPending.to, piece, type);
                    } else {
                      serverMove(promotionPending.from, promotionPending.to, type);
                    }
                    setPromotionPending(null);
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 text-3xl hover:border-amber-400 hover:bg-amber-50 transition-colors"
                >
                  {PIECE_SYMBOLS[(myColor === "white" ? "w" : "b") + type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-3xl bg-white p-8 text-center shadow-2xl mx-4 max-w-sm w-full">
            <div className="text-5xl mb-4">{winner.includes("Draw") ? "🤝" : winner === (vsComputer ? "You" : (myRole === "player1" ? player1Name : player2Name)) ? "🎉" : "😞"}</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              {winner.includes("Draw") ? winner : `${winner} Wins!`}
            </h2>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setBoard(initBoard()); setCurrentTurn("white"); setSelected(null); setLegalMoves([]); setEnPassant(null); setCastlingRights("KQkq"); setWinner(null); setLastMove(null); setCapturedWhite([]); setCapturedBlack([]); setAiThinking(false); }} className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600">
                Play Again
              </button>
              <button onClick={() => navigate("/entertainment")} className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
