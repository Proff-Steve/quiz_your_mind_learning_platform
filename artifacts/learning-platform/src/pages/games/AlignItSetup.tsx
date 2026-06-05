import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";

function Board3MensSVG({ selected }: { selected: boolean }) {
  const s = selected ? "#c0392b" : "#7f8c8d";
  return (
    <svg viewBox="0 0 80 80" className="h-12 w-12" fill="none">
      <rect x="5" y="5" width="70" height="70" stroke={s} strokeWidth="3" fill="none" rx="2" />
      <line x1="40" y1="5" x2="40" y2="75" stroke={s} strokeWidth="2.5" />
      <line x1="5" y1="40" x2="75" y2="40" stroke={s} strokeWidth="2.5" />
      <line x1="5" y1="5" x2="40" y2="40" stroke={s} strokeWidth="2" />
      <line x1="75" y1="5" x2="40" y2="40" stroke={s} strokeWidth="2" />
      <line x1="5" y1="75" x2="40" y2="40" stroke={s} strokeWidth="2" />
      <line x1="75" y1="75" x2="40" y2="40" stroke={s} strokeWidth="2" />
      {[5,40,75].map(x => [5,40,75].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={s} />
      )))}
    </svg>
  );
}

function BoardUcTasSVG({ selected }: { selected: boolean }) {
  const s = selected ? "#c0392b" : "#7f8c8d";
  return (
    <svg viewBox="0 0 80 80" className="h-12 w-12" fill="none">
      <rect x="5" y="5" width="70" height="70" stroke={s} strokeWidth="3" fill="none" rx="2" />
      <line x1="40" y1="5" x2="40" y2="75" stroke={s} strokeWidth="2.5" />
      <line x1="5" y1="40" x2="75" y2="40" stroke={s} strokeWidth="2.5" />
      {[5,40,75].map(x => [5,40,75].map(y => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={s} />
      )))}
    </svg>
  );
}

function GaugeSVG({ level, selected }: { level: "easy" | "medium" | "hard"; selected: boolean }) {
  const border = selected ? "#c0392b" : "#bdc3c7";
  const colors = {
    easy: { green: "#2ecc71", yellow: "#f1c40f", red: "#e74c3c", needleAngle: -45 },
    medium: { green: "#2ecc71", yellow: "#f1c40f", red: "#e74c3c", needleAngle: 0 },
    hard: { green: "#2ecc71", yellow: "#f1c40f", red: "#e74c3c", needleAngle: 45 },
  };
  const { needleAngle } = colors[level];
  const cx = 50, cy = 55, r = 35;
  const nx = cx + r * 0.75 * Math.cos(((needleAngle - 90) * Math.PI) / 180);
  const ny = cy + r * 0.75 * Math.sin(((needleAngle - 90) * Math.PI) / 180);

  return (
    <svg viewBox="0 0 100 80" className="h-12 w-16" fill="none">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="#e74c3c" strokeWidth="8" fill="none" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`} stroke="#f1c40f" strokeWidth="8" fill="none" />
      <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="#2ecc71" strokeWidth="8" fill="none" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#2c3e50" />
    </svg>
  );
}

type Step = "setup" | "mode";
type BoardType = "3mens" | "uctas";
type Difficulty = "easy" | "medium" | "hard";
type Mode = "single" | "friends";
type FriendsAction = "create" | "join";

export default function AlignItSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("setup");
  const [boardType, setBoardType] = useState<BoardType>("3mens");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<Mode | null>(null);
  const [friendsAction, setFriendsAction] = useState<FriendsAction | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  function getToken() {
    return localStorage.getItem("qym_token") || sessionStorage.getItem("qym_token") || "";
  }

  async function handleCreateGame() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/games/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ gameType: "align-it", boardType, difficulty }),
      });
      const data = await res.json();
      if (data.code) {
        setGeneratedCode(data.code);
        localStorage.setItem("qym_game_code", data.code);
        localStorage.setItem("qym_game_config", JSON.stringify({ boardType, difficulty, role: "player1" }));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame() {
    if (!joinCode.trim()) return;
    setLoading(true);
    setJoinError("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/games/sessions/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.error) {
        setJoinError(data.error);
      } else {
        localStorage.setItem("qym_game_code", joinCode.trim().toUpperCase());
        localStorage.setItem("qym_game_config", JSON.stringify({
          boardType: data.session.boardType,
          difficulty: data.session.difficulty,
          role: "player2",
        }));
        navigate("/games/align-it/play");
      }
    } catch {
      setJoinError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSinglePlayer() {
    localStorage.setItem("qym_game_code", "");
    localStorage.setItem("qym_game_config", JSON.stringify({ boardType, difficulty, role: "player1", vsComputer: true }));
    navigate("/games/align-it/play");
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const bgStyle = {
    background: "linear-gradient(160deg, #a8d8d8 0%, #e8dcc8 100%)",
    minHeight: "100vh",
  };

  if (step === "setup") {
    return (
      <div style={bgStyle} className="flex flex-col">
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <button onClick={() => navigate("/entertainment")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 py-4 max-w-lg mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Align It: Three Men's Morris</h1>

          <div className="mb-8">
            <h2 className="text-base font-bold text-red-600 mb-4">Select Board</h2>
            <div className="flex gap-4">
              {([
                { type: "3mens" as BoardType, label: "3 Men's", SVG: Board3MensSVG },
                { type: "uctas" as BoardType, label: "Uc Tas", SVG: BoardUcTasSVG },
              ] as const).map(({ type, label, SVG }) => (
                <button
                  key={type}
                  onClick={() => setBoardType(type)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    boardType === type ? "border-red-500 bg-white shadow-md" : "border-gray-300 bg-white/60"
                  }`}
                >
                  <SVG selected={boardType === type} />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                  {boardType === type && (
                    <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-base font-bold text-red-600 mb-4">Select difficulty level</h2>
            <div className="flex gap-3">
              {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                    difficulty === level ? "border-red-500 bg-white shadow-md" : "border-gray-300 bg-white/60"
                  }`}
                >
                  <GaugeSVG level={level} selected={difficulty === level} />
                  <span className="text-xs font-medium text-gray-700 capitalize">{level}</span>
                  {difficulty === level && (
                    <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={() => setStep("mode")}
              className="w-full rounded-full bg-red-500 py-4 text-base font-bold text-white shadow-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={bgStyle} className="flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-6 pt-6 pb-2">
        <button onClick={() => {
          if (friendsAction) { setFriendsAction(null); setGeneratedCode(""); setJoinCode(""); setJoinError(""); }
          else if (mode) setMode(null);
          else setStep("setup");
        }} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 py-4 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Align It: Three Men's Morris</h1>
        <p className="text-sm text-gray-500 mb-8">
          Board: <span className="font-medium capitalize">{boardType === "3mens" ? "3 Men's" : "Uc Tas"}</span> · Difficulty: <span className="font-medium capitalize">{difficulty}</span>
        </p>

        {!mode && (
          <>
            <h2 className="text-base font-bold text-gray-700 mb-4">Choose how to play</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setMode("single"); handleSinglePlayer(); }}
                className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left shadow-sm hover:border-red-400 hover:shadow-md transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-3xl">🤖</div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Single Player</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Play against the computer</p>
                </div>
              </button>

              <button
                onClick={() => setMode("friends")}
                className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left shadow-sm hover:border-red-400 hover:shadow-md transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-3xl">👥</div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Play with Friends</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Invite a friend with a code or link</p>
                </div>
              </button>
            </div>
          </>
        )}

        {mode === "friends" && !friendsAction && (
          <>
            <h2 className="text-base font-bold text-gray-700 mb-4">Play with Friends</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setFriendsAction("create"); handleCreateGame(); }}
                className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left shadow-sm hover:border-red-400 hover:shadow-md transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-3xl">🔗</div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Generate a Code</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Create a game and share the code</p>
                </div>
              </button>

              <button
                onClick={() => setFriendsAction("join")}
                className="flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left shadow-sm hover:border-red-400 hover:shadow-md transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 text-3xl">🎯</div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Join a Game</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Enter a code to join your friend</p>
                </div>
              </button>
            </div>
          </>
        )}

        {mode === "friends" && friendsAction === "create" && (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-base font-bold text-gray-700 self-start">Your Game Code</h2>
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
                <p className="text-sm text-gray-500">Creating game…</p>
              </div>
            ) : generatedCode ? (
              <>
                <div className="w-full rounded-2xl border-2 border-dashed border-red-300 bg-white p-6 text-center">
                  <p className="text-xs text-gray-500 mb-2">Share this code with your friend</p>
                  <p className="text-5xl font-black tracking-widest text-red-600">{generatedCode}</p>
                </div>

                <div className="flex w-full gap-3">
                  <button
                    onClick={copyCode}
                    className="flex-1 rounded-xl border-2 border-red-200 bg-white py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Code"}
                  </button>
                  <button
                    onClick={async () => {
                      if (navigator.share) {
                        await navigator.share({ title: "Join my Align It game!", text: `Use code ${generatedCode} to join my Three Men's Morris game on Quiz Your Mind!` });
                      } else {
                        copyCode();
                      }
                    }}
                    className="flex-1 rounded-xl border-2 border-green-200 bg-white py-3 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors"
                  >
                    📤 Share
                  </button>
                </div>

                <button
                  onClick={() => navigate("/games/align-it/play")}
                  className="w-full rounded-full bg-red-500 py-4 text-base font-bold text-white shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                >
                  Wait for Friend & Start
                </button>
                <p className="text-xs text-center text-gray-500">
                  The game will start once your friend joins using the code above
                </p>
              </>
            ) : (
              <p className="text-sm text-red-500">Failed to create game. Please try again.</p>
            )}
          </div>
        )}

        {mode === "friends" && friendsAction === "join" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-base font-bold text-gray-700">Join a Game</h2>
            <p className="text-sm text-gray-500">Ask your friend for their 6-character game code and enter it below.</p>

            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. AB12CD)"
              maxLength={6}
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-center text-2xl font-black tracking-widest uppercase text-gray-800 outline-none focus:border-red-400"
            />

            {joinError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">{joinError}</p>
            )}

            <button
              onClick={handleJoinGame}
              disabled={loading || joinCode.length < 4}
              className="w-full rounded-full bg-red-500 py-4 text-base font-bold text-white shadow-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Joining…" : "Join Game"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
