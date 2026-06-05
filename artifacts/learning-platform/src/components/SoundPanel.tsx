import { useEffect, useRef, useState } from "react";
import { soundSettings, SoundCategory } from "@/lib/sounds";

const CATEGORIES: { key: SoundCategory; label: string }[] = [
  { key: "background", label: "Background Music" },
  { key: "moves",      label: "Move Sounds" },
  { key: "captures",   label: "Capture Sounds" },
  { key: "alerts",     label: "Alerts" },
  { key: "outcomes",   label: "Win / Lose / Draw" },
  { key: "events",     label: "Game Events" },
];

export function SoundPanel({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => soundSettings.getPrefs());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = soundSettings.subscribe(() => setPrefs(soundSettings.getPrefs()));
    return unsub;
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const allMuted = prefs.masterMute;

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Sound settings"
        className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
          variant === "dark"
            ? "bg-gray-700 hover:bg-gray-600"
            : "bg-white/50 hover:bg-white/80"
        }`}
      >
        {allMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${variant === "dark" ? "text-gray-400" : "text-gray-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${variant === "dark" ? "text-gray-200" : "text-gray-700"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-xl bg-white shadow-xl border border-gray-100 p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Sound</span>
            <button
              onClick={() => soundSettings.setMasterMute(!prefs.masterMute)}
              className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${
                allMuted
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {allMuted ? "Unmute All" : "Mute All"}
            </button>
          </div>

          {CATEGORIES.map(({ key, label }) => {
            const enabled = !allMuted && prefs.categories[key];
            return (
              <label
                key={key}
                className={`flex items-center justify-between gap-2 cursor-pointer rounded-lg px-2 py-1.5 transition-colors ${
                  allMuted ? "opacity-40 pointer-events-none" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => soundSettings.toggleCategory(key)}
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    enabled ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
