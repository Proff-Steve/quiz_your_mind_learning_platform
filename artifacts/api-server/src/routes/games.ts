import { Router, type Response } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { db, usersTable, virtualTransactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

interface GamePlayer {
  id: number;
  name: string;
}

interface GameSession {
  code: string;
  gameType: "align-it" | "chess";
  boardType: string;
  difficulty: string;
  player1: GamePlayer;
  player2?: GamePlayer;
  board: (string | null)[];
  currentTurn: "player1" | "player2";
  phase: "waiting" | "placement" | "movement" | "finished";
  placedCount: { player1: number; player2: number };
  winner?: "player1" | "player2" | "draw";
  lastMove?: number;
  createdAt: Date;
  roundNumber: number;
  roundScores: { player1: number; player2: number };
  matchWinner?: "player1" | "player2" | "draw";
  matchSettled: boolean;
  nextRoundTriggered: boolean;
}

const sessions = new Map<string, GameSession>();

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function cleanupOldSessions() {
  const cutoff = Date.now() - 3 * 60 * 60 * 1000;
  for (const [code, session] of sessions) {
    if (session.createdAt.getTime() < cutoff) sessions.delete(code);
  }
}

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
  return adj[pos] ?? [];
}

function getAdjacentUcTas(pos: number): number[] {
  const adj: Record<number, number[]> = {
    0: [1, 3], 1: [0, 2, 4], 2: [1, 5],
    3: [0, 4, 6], 4: [1, 3, 5, 7], 5: [2, 4, 8],
    6: [3, 7], 7: [6, 4, 8], 8: [5, 7],
  };
  return adj[pos] ?? [];
}

function getAdjacent(pos: number, boardType: string): number[] {
  return boardType === "3mens" ? getAdjacent3Mens(pos) : getAdjacentUcTas(pos);
}

function sanitizeSession(session: GameSession, userId: number) {
  return {
    code: session.code,
    gameType: session.gameType,
    boardType: session.boardType,
    difficulty: session.difficulty,
    player1: session.player1,
    player2: session.player2 ?? null,
    board: session.board,
    currentTurn: session.currentTurn,
    phase: session.phase,
    placedCount: session.placedCount,
    winner: session.winner ?? null,
    lastMove: session.lastMove ?? null,
    myRole: session.player1.id === userId ? "player1" : session.player2?.id === userId ? "player2" : null,
    roundNumber: session.roundNumber,
    roundScores: session.roundScores,
    matchWinner: session.matchWinner ?? null,
    matchSettled: session.matchSettled,
  };
}

function initChessBoard(): (string | null)[] {
  const board: (string | null)[] = Array(64).fill(null);
  const backRank = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let i = 0; i < 8; i++) {
    board[i] = "b" + backRank[i];
    board[8 + i] = "bP";
    board[48 + i] = "wP";
    board[56 + i] = "w" + backRank[i];
  }
  return board;
}

async function getUserName(userId: number): Promise<string> {
  try {
    const rows = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return rows[0]?.name ?? "Player";
  } catch {
    return "Player";
  }
}

async function settleMatch(session: GameSession): Promise<void> {
  if (session.matchSettled || !session.matchWinner || session.matchWinner === "draw") return;
  if (!session.player2) return;
  session.matchSettled = true;

  const winnerId = session.matchWinner === "player1" ? session.player1.id : session.player2.id;
  const loserId  = session.matchWinner === "player1" ? session.player2.id : session.player1.id;

  try {
    const [winnerRow, loserRow] = await Promise.all([
      db.select({ planCurrency: usersTable.planCurrency }).from(usersTable).where(eq(usersTable.id, winnerId)).limit(1),
      db.select({ planCurrency: usersTable.planCurrency }).from(usersTable).where(eq(usersTable.id, loserId)).limit(1),
    ]);

    const winnerIsGhana = (winnerRow[0]?.planCurrency ?? "GHS") === "GHS";
    const loserIsGhana  = (loserRow[0]?.planCurrency ?? "GHS") === "GHS";
    const winnerReward  = winnerIsGhana ? 1.00 : 0.50;
    const loserDeduct   = loserIsGhana  ? 1.00 : 0.50;

    await db.update(usersTable)
      .set({ virtualBalance: sql`GREATEST(${usersTable.virtualBalance}::numeric - ${loserDeduct}, 0)` })
      .where(eq(usersTable.id, loserId));
    await db.update(usersTable)
      .set({ virtualBalance: sql`${usersTable.virtualBalance}::numeric + ${winnerReward}` })
      .where(eq(usersTable.id, winnerId));

    await Promise.all([
      db.insert(virtualTransactionsTable).values({
        userId: winnerId,
        amount: winnerReward.toFixed(2),
        type: "credit",
        description: `Game reward: won ${session.gameType} match`,
      }),
      db.insert(virtualTransactionsTable).values({
        userId: loserId,
        amount: loserDeduct.toFixed(2),
        type: "debit",
        description: `Game loss: lost ${session.gameType} match`,
      }),
    ]);
  } catch (err) {
    session.matchSettled = false;
    console.error("Balance transfer failed:", err);
  }
}

function resolveMatch(session: GameSession): void {
  const { player1, player2 } = session.roundScores;
  if (player1 >= 2) { session.matchWinner = "player1"; return; }
  if (player2 >= 2) { session.matchWinner = "player2"; return; }
  if (session.roundNumber >= 3) {
    if (player1 > player2) session.matchWinner = "player1";
    else if (player2 > player1) session.matchWinner = "player2";
    else session.matchWinner = "draw";
  }
}

router.post("/games/sessions", requireAuth, async (req: AuthRequest, res: Response) => {
  cleanupOldSessions();
  if (!req.user) { res.status(401).json({ error: "Unauthorized" }); return; }
  const userId = req.user.userId;
  const userName = await getUserName(userId);
  const { gameType, boardType, difficulty } = req.body as { gameType?: string; boardType?: string; difficulty?: string };

  const code = generateCode();
  const isChess = gameType === "chess";
  const session: GameSession = {
    code,
    gameType: isChess ? "chess" : "align-it",
    boardType: boardType ?? "3mens",
    difficulty: difficulty ?? "easy",
    player1: { id: userId, name: userName },
    board: isChess ? initChessBoard() : Array(9).fill(null),
    currentTurn: "player1",
    phase: isChess ? "movement" : "waiting",
    placedCount: { player1: 0, player2: 0 },
    createdAt: new Date(),
    roundNumber: 1,
    roundScores: { player1: 0, player2: 0 },
    matchSettled: false,
    nextRoundTriggered: false,
  };

  sessions.set(code, session);
  res.json({ code, session: sanitizeSession(session, userId) });
});

router.post("/games/sessions/join", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: "Unauthorized" }); return; }
  const userId = req.user.userId;
  const { code } = req.body as { code?: string };
  const upperCode = (code ?? "").toUpperCase();

  const session = sessions.get(upperCode);
  if (!session) { res.status(404).json({ error: "Game not found. Check the code and try again." }); return; }
  if (session.player2) {
    if (session.player2.id === userId) { res.json({ session: sanitizeSession(session, userId) }); return; }
    res.status(400).json({ error: "This game is already full." }); return;
  }
  if (session.player1.id === userId) { res.status(400).json({ error: "You cannot join your own game." }); return; }

  const userName = await getUserName(userId);
  session.player2 = { id: userId, name: userName };
  session.phase = session.gameType === "chess" ? "movement" : "placement";

  res.json({ session: sanitizeSession(session, userId) });
});

router.get("/games/sessions/:code", requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: "Unauthorized" }); return; }
  const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const session = sessions.get(code.toUpperCase());
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  res.json({ session: sanitizeSession(session, req.user.userId) });
});

router.post("/games/sessions/:code/move", requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: "Unauthorized" }); return; }
  const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const session = sessions.get(code.toUpperCase());
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  if (session.phase === "finished") { res.status(400).json({ error: "Game is over" }); return; }

  const userId = req.user.userId;
  const isPlayer1 = session.player1.id === userId;
  const isPlayer2 = session.player2?.id === userId;
  if (!isPlayer1 && !isPlayer2) { res.status(403).json({ error: "Not a participant" }); return; }

  const myRole = isPlayer1 ? "player1" : "player2";
  if (session.currentTurn !== myRole) { res.status(400).json({ error: "Not your turn" }); return; }

  const { from, to, promotion } = req.body as { from?: number; to?: number; promotion?: string };

  function finishRound(roundWinner: "player1" | "player2" | "draw") {
    session.phase = "finished";
    session.winner = roundWinner;
    session.nextRoundTriggered = false;
    if (roundWinner !== "draw") {
      session.roundScores[roundWinner]++;
    }
    resolveMatch(session);
    if (session.matchWinner) {
      void settleMatch(session);
    }
  }

  if (session.gameType === "align-it") {
    const symbol = myRole === "player1" ? "X" : "O";

    if (session.phase === "placement") {
      if (to === undefined || to === null) { res.status(400).json({ error: "No position given" }); return; }
      if (session.board[to] !== null) { res.status(400).json({ error: "Position occupied" }); return; }
      if (session.placedCount[myRole] >= 3) { res.status(400).json({ error: "Already placed all pieces" }); return; }

      session.board[to] = symbol;
      session.placedCount[myRole]++;
      session.lastMove = to;

      const winner = checkWinner(session.board);
      if (winner) {
        finishRound(winner === "X" ? "player1" : "player2");
      } else {
        const totalPlaced = session.placedCount.player1 + session.placedCount.player2;
        if (totalPlaced >= 6) session.phase = "movement";
        session.currentTurn = session.currentTurn === "player1" ? "player2" : "player1";
      }
    } else if (session.phase === "movement") {
      if (from === undefined || to === undefined) { res.status(400).json({ error: "from and to required" }); return; }
      if (session.board[from] !== symbol) { res.status(400).json({ error: "Not your piece" }); return; }
      if (session.board[to] !== null) { res.status(400).json({ error: "Position occupied" }); return; }
      const adj = getAdjacent(from, session.boardType);
      if (!adj.includes(to)) { res.status(400).json({ error: "Invalid move" }); return; }

      session.board[from] = null;
      session.board[to] = symbol;
      session.lastMove = to;

      const winner = checkWinner(session.board);
      if (winner) {
        finishRound(winner === "X" ? "player1" : "player2");
      } else {
        session.currentTurn = session.currentTurn === "player1" ? "player2" : "player1";
      }
    }
  } else if (session.gameType === "chess") {
    if (from === undefined || to === undefined) { res.status(400).json({ error: "from and to required" }); return; }
    const piece = session.board[from];
    if (!piece) { res.status(400).json({ error: "No piece at source" }); return; }
    const pieceColor = piece[0] === "w" ? "white" : "black";
    const expectedColor = myRole === "player1" ? "white" : "black";
    if (pieceColor !== expectedColor) { res.status(400).json({ error: "Not your piece" }); return; }

    const newBoard = [...session.board];
    const isPromo = piece[1] === "P" && (Math.floor(to / 8) === 0 || Math.floor(to / 8) === 7);
    newBoard[to] = isPromo ? piece[0] + (promotion ?? "Q") : piece;
    newBoard[from] = null;

    session.board = newBoard;
    session.lastMove = to;

    const oppColor = pieceColor === "white" ? "b" : "w";
    const hasKing = newBoard.some(p => p === oppColor + "K");
    if (!hasKing) {
      finishRound(myRole);
    } else {
      session.currentTurn = session.currentTurn === "player1" ? "player2" : "player1";
    }
  }

  res.json({ session: sanitizeSession(session, userId) });
});

router.post("/games/sessions/:code/next-round", requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) { res.status(401).json({ error: "Unauthorized" }); return; }
  const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
  const session = sessions.get(code.toUpperCase());
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  const userId = req.user.userId;
  const isPlayer1 = session.player1.id === userId;
  const isPlayer2 = session.player2?.id === userId;
  if (!isPlayer1 && !isPlayer2) { res.status(403).json({ error: "Not a participant" }); return; }

  if (session.phase !== "finished") { res.status(400).json({ error: "Round not finished yet" }); return; }
  if (session.matchWinner) { res.status(400).json({ error: "Match is already over" }); return; }
  if (session.nextRoundTriggered) {
    res.json({ session: sanitizeSession(session, userId) }); return;
  }

  session.nextRoundTriggered = true;
  session.roundNumber++;
  session.winner = undefined;
  session.lastMove = undefined;
  session.board = session.gameType === "chess" ? initChessBoard() : Array(9).fill(null);
  session.currentTurn = "player1";
  session.placedCount = { player1: 0, player2: 0 };
  session.phase = session.gameType === "chess" ? "movement" : "placement";

  res.json({ session: sanitizeSession(session, userId) });
});

export default router;
