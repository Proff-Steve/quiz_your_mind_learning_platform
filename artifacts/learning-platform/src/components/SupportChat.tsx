import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Image,
  FileText,
  Play,
  Pause,
  ChevronDown,
} from "lucide-react";
import qymLogo from "@assets/QuizYourMind_1777758421054.png";
import { getToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface SupportMessage {
  id: number;
  chatId: number;
  senderRole: "user" | "admin";
  content: string;
  fileData: string | null;
  fileName: string | null;
  fileType: string | null;
  createdAt: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function groupByDate(messages: SupportMessage[]) {
  const groups: { date: string; messages: SupportMessage[] }[] = [];
  for (const msg of messages) {
    const date = formatDate(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
  }
  return groups;
}

function FileAttachment({ fileData, fileName, fileType }: { fileData: string; fileName: string | null; fileType: string | null }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isImage = fileType?.startsWith("image/");
  const isAudio = fileType?.startsWith("audio/") || fileType?.startsWith("video/webm") || fileType?.startsWith("video/ogg");
  const isDocument = !isImage && !isAudio;

  if (isImage) {
    return (
      <a href={fileData} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <img src={fileData} alt={fileName ?? "image"} className="max-w-[200px] max-h-[180px] rounded-lg object-cover border border-white/20" />
      </a>
    );
  }

  if (isAudio) {
    function togglePlay() {
      if (!audioRef.current) {
        audioRef.current = new Audio(fileData);
        audioRef.current.onended = () => setPlaying(false);
      }
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    }
    return (
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 mt-1 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 text-sm transition-colors"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span>{fileName ?? "Voice message"}</span>
      </button>
    );
  }

  if (isDocument) {
    return (
      <a
        href={fileData}
        download={fileName ?? "file"}
        className="flex items-center gap-2 mt-1 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm transition-colors"
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="truncate max-w-[160px]">{fileName ?? "Document"}</span>
      </a>
    );
  }

  return null;
}

export function SupportChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCountRef = useRef(0);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  async function fetchMessages(silent = false) {
    if (!user) return;
    const token = getToken();
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/chat/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { messages: SupportMessage[] };
      setMessages(data.messages);
      if (silent && data.messages.length > prevCountRef.current) {
        const newCount = data.messages.length - prevCountRef.current;
        if (!open) setUnread((u) => u + newCount);
        prevCountRef.current = data.messages.length;
      } else if (!silent) {
        prevCountRef.current = data.messages.length;
      }
    } catch {
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      prevCountRef.current = messages.length;
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [open]);

  useEffect(() => {
    if (open && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, open]);

  async function sendMessage(content: string, file?: File) {
    if (!user) return;
    setSending(true);
    const token = getToken();
    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("file", file);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/chat/message`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        await fetchMessages();
        setText("");
      }
    } catch {
    } finally {
      setSending(false);
    }
  }

  function handleSend() {
    if (!text.trim() && !sending) return;
    sendMessage(text.trim());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    sendMessage("", file);
    e.target.value = "";
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordingChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
        sendMessage("", file);
        setRecordingTime(0);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      recordingTimerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      alert("Could not access microphone. Please allow microphone permission.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }

  function formatRecordingTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  const groups = groupByDate(messages);

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {open && (
          <div className="w-[340px] sm:w-[380px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
            style={{ height: "520px" }}>
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-none">Chat for Support</p>
                  <p className="text-xs text-blue-100 mt-0.5">We typically reply within a few hours</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50 dark:bg-gray-900">
              {groups.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
                  <MessageCircle className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">Say hello to start the conversation!</p>
                </div>
              )}
              {groups.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{group.date}</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="space-y-2">
                    {group.messages.map((msg) => {
                      const isUser = msg.senderRole === "user";
                      return (
                        <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          {!isUser && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold mr-1.5 mt-1 shrink-0">A</div>
                          )}
                          <div
                            className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                              isUser
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700"
                            }`}
                          >
                            {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                            {msg.fileData && (
                              <FileAttachment
                                fileData={msg.fileData}
                                fileName={msg.fileName}
                                fileType={msg.fileType}
                              />
                            )}
                            <p className={`text-[10px] mt-1 ${isUser ? "text-blue-200 text-right" : "text-gray-400 dark:text-gray-500"}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="px-3 py-2.5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shrink-0">
              {recording ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">Recording {formatRecordingTime(recordingTime)}</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="h-9 w-9 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
                    title="Stop and send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    className="h-9 w-9 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                    title="Attach image or document"
                  >
                    <Paperclip className="h-4.5 w-4.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-gray-400 max-h-24 min-h-[36px]"
                    style={{ fieldSizing: "content" } as React.CSSProperties}
                  />
                  {text.trim() ? (
                    <button
                      onClick={handleSend}
                      disabled={sending}
                      className="h-9 w-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      disabled={sending}
                      className="h-9 w-9 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                      title="Record voice message"
                    >
                      <Mic className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          className="relative transition-all hover:scale-105 active:scale-95"
          style={{ width: 64, height: 68 }}
          title="Chat for Support"
        >
          {open ? (
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1e2d5a] shadow-lg">
              <X className="h-6 w-6 text-white" />
            </span>
          ) : (
            <svg
              viewBox="0 0 64 68"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-lg"
            >
              <path
                d="M4 4C4 2.895 4.895 2 6 2H58C59.105 2 60 2.895 60 4V46C60 47.105 59.105 48 58 48H20L8 62V48H6C4.895 48 4 47.105 4 46V4Z"
                fill="#1e2d5a"
              />
              <image
                href={qymLogo}
                x="10"
                y="5"
                width="44"
                height="40"
                clipPath="url(#logoClip)"
                preserveAspectRatio="xMidYMid meet"
              />
              <defs>
                <clipPath id="logoClip">
                  <rect x="10" y="5" width="44" height="40" rx="6" />
                </clipPath>
              </defs>
            </svg>
          )}
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center z-10">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
