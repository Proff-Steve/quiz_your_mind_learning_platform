import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";
type Mode = "single" | "friends";
type FriendsAction = "create" | "join";

function GaugeSVG({ level, selected }: { level: Difficulty; selected: boolean }) {
  const cx = 50, cy = 55, r = 35;
  const angles: Record<Difficulty, number> = { easy: -45, medium: 0, hard: 45 };
  const angle = angles[level];
  const nx = cx + r * 0.75 * Math.cos(((angle - 90) * Math.PI) / 180);
  const ny = cy + r * 0.75 * Math.sin(((angle - 90) * Math.PI) / 180);

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

function getToken() {
  return localStorage.getItem("qym_token") || sessionStorage.getItem("qym_token") || "";
}

export default function ChessSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"setup" | "mode">("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [mode, setMode] = useState<Mode | null>(null);
  const [friendsAction, setFriendsAction] = useState<FriendsAction | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreateGame() {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/games/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ gameType: "chess", difficulty }),
      });
      const data = await res.json();
      if (data.code) {
        setGeneratedCode(data.code);
        localStorage.setItem("qym_game_code", data.code);
        localStorage.setItem("qym_game_config", JSON.stringify({ gameType: "chess", difficulty, role: "player1" }));
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
          gameType: "chess",
          difficulty: data.session.difficulty,
          role: "player2",
        }));
        navigate("/games/chess/play");
      }
    } catch {
      setJoinError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSinglePlayer() {
    localStorage.setItem("qym_game_code", "");
    localStorage.setItem("qym_game_config", JSON.stringify({ gameType: "chess", difficulty, role: "player1", vsComputer: true }));
    navigate("/games/chess/play");
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const bgStyle = { background: "linear-gradient(160deg, #a8d8d8 0%, #e8dcc8 100%)", minHeight: "100vh" };

  if (step === "setup") {
    return (
      <div style={bgStyle} className="flex flex-col">
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <button onClick={() => navigate("/entertainment")} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 py-4 max-w-lg mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Chess</h1>

          <div className="mb-8">
            <h2 className="text-base font-bold text-red-600 mb-4">Select Board</h2>
            <button className="relative flex flex-col items-center gap-2 rounded-xl border-2 border-red-500 bg-white shadow-md p-5">
              <svg viewBox="0 0 80 80" className="h-16 w-16" fill="none">
                {Array.from({ length: 8 }).map((_, row) =>
                  Array.from({ length: 8 }).map((_, col) => (
                    <rect
                      key={`${row}-${col}`}
                      x={col * 10}
                      y={row * 10}
                      width="10"
                      height="10"
                      fill={(row + col) % 2 === 0 ? "#f0d9b5" : "#b58863"}
                    />
                  ))
                )}
                <rect x="0" y="0" width="80" height="80" stroke="#c0392b" strokeWidth="2" fill="none" />
              </svg>
              <span className="text-xs font-medium text-gray-700">Standard Chess</span>
              <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </button>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chess</h1>
        <p className="text-sm text-gray-500 mb-8">Difficulty: <span className="font-medium capitalize">{difficulty}</span></p>

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
                  <button onClick={copyCode} className="flex-1 rounded-xl border-2 border-red-200 bg-white py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                    {copied ? "✓ Copied!" : "📋 Copy Code"}
                  </button>
                  <button
                    onClick={async () => {
                      if (navigator.share) {
                        await navigator.share({ title: "Join my Chess game!", text: `Use code ${generatedCode} to join my Chess game on Quiz Your Mind!` });
                      } else copyCode();
                    }}
                    className="flex-1 rounded-xl border-2 border-green-200 bg-white py-3 text-sm font-semibold text-green-600 hover:bg-green-50"
                  >
                    📤 Share
                  </button>
                </div>
                <button onClick={() => navigate("/games/chess/play")} className="w-full rounded-full bg-red-500 py-4 text-base font-bold text-white shadow-lg hover:bg-red-600 active:scale-95">
                  Wait for Friend & Start
                </button>
                <p className="text-xs text-center text-gray-500">The game will start once your friend joins using the code above</p>
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
            {joinError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 text-center">{joinError}</p>}
            <button
              onClick={handleJoinGame}
              disabled={loading || joinCode.length < 4}
              className="w-full rounded-full bg-red-500 py-4 text-base font-bold text-white shadow-lg hover:bg-red-600 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Joining…" : "Join Game"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
