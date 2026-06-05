import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { FontFamily } from "@tiptap/extension-font-family";
import FontSize from "@tiptap/extension-font-size";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Highlighter,
  Link2,
  Undo2,
  Redo2,
  RemoveFormatting,
  Printer,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Upload,
  X,
  Loader2,
  Sparkles,
  SendHorizontal,
  BookOpenText,
  Youtube,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  ChevronDown,
  BookMarked,
  MessagesSquare,
  PlusCircle,
  Code,
  Code2,
  Minus,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Palette,
  Trash2,
  Coins,
  ShoppingCart,
  Zap,
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const TEXT_EXTS = new Set(["pdf", "txt", "md", "docx", "csv", "pptx", "epub"]);
const AUDIO_EXTS = new Set([
  "aac", "aif", "aifc", "aiff", "amr", "au", "m4a", "mid", "mp3",
  "ogg", "opus", "ra", "ram", "snd", "wav", "wma", "cda",
]);
const VIDEO_EXTS = new Set(["3g2", "3gp", "avi", "mp4", "mpeg", "mov", "webm"]);
const IMAGE_EXTS = new Set([
  "avif", "bmp", "gif", "ico", "jp2", "png", "webp", "tif", "tiff",
  "heic", "heif", "jpeg", "jpg", "jpe",
]);

function getExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function getFileCategory(name: string): "text" | "audio" | "video" | "image" | "unknown" {
  const ext = getExt(name);
  if (TEXT_EXTS.has(ext)) return "text";
  if (AUDIO_EXTS.has(ext)) return "audio";
  if (VIDEO_EXTS.has(ext)) return "video";
  if (IMAGE_EXTS.has(ext)) return "image";
  return "unknown";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_ACCEPT = [
  ".pdf,.txt,.md,.docx,.csv,.pptx,.epub",
  ".aac,.aif,.aifc,.aiff,.amr,.au,.m4a,.mid,.mp3,.ogg,.opus,.ra,.ram,.snd,.wav,.wma,.cda",
  ".3g2,.3gp,.avi,.mp4,.mpeg,.mov,.webm",
  ".avif,.bmp,.gif,.ico,.jp2,.png,.webp,.tif,.tiff,.heic,.heif,.jpeg,.jpg,.jpe",
].join(",");

function FileCategoryIcon({ name }: { name: string }) {
  const cat = getFileCategory(name);
  const cls = "h-4 w-4 shrink-0";
  if (cat === "audio") return <Music className={`${cls} text-purple-500`} />;
  if (cat === "video") return <Video className={`${cls} text-blue-500`} />;
  if (cat === "image") return <ImageIcon className={`${cls} text-teal-500`} />;
  return <FileText className={`${cls} text-amber-500`} />;
}

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarBtn({ onClick, active, title, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Black", value: "#000000" },
  { label: "Dark Grey", value: "#374151" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Amber", value: "#d97706" },
  { label: "Green", value: "#16a34a" },
  { label: "Teal", value: "#0d9488" },
  { label: "Blue", value: "#2563eb" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Purple", value: "#9333ea" },
  { label: "Pink", value: "#db2777" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fecdd3" },
  { label: "Purple", value: "#e9d5ff" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Teal", value: "#99f6e4" },
  { label: "None", value: "" },
];

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Sans-serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

const FONT_SIZES = [
  "8", "9", "10", "11", "12", "13", "14", "15", "16",
  "18", "20", "22", "24", "28", "32", "36", "42", "48", "60", "72",
];

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [showHeadings, setShowHeadings] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const fontFamilyRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowHeadings(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowTextColor(false);
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) setShowHighlight(false);
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) setShowTable(false);
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(e.target as Node)) setShowFontFamily(false);
      if (fontSizeRef.current && !fontSizeRef.current.contains(e.target as Node)) setShowFontSize(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!editor) return null;

  const currentHeading = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
    ? "H2"
    : editor.isActive("heading", { level: 3 })
    ? "H3"
    : "¶";

  const handlePrint = () => {
    const content = editor.getHTML();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Study Notes</title>
      <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; color: #1a1a1a; line-height: 1.7; }
        h1 { font-size: 2em; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { font-size: 1.5em; color: #2c3e7a; margin-top: 2em; }
        h3 { font-size: 1.2em; color: #34495e; }
        blockquote { border-left: 4px solid #d4a017; padding: 8px 16px; margin: 16px 0; background: #fffbee; }
        table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        th, td { border: 1px solid #ccc; padding: 8px 12px; }
        th { background: #f0f0f0; font-weight: 600; }
        img { max-width: 100%; border-radius: 6px; margin: 12px 0; }
        ul, ol { padding-left: 24px; }
        mark { background: #ffe066; padding: 1px 3px; border-radius: 2px; }
        code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
        pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
        pre code { background: none; color: inherit; padding: 0; }
        hr { border: none; border-top: 2px solid #e5e7eb; margin: 24px 0; }
        sub { font-size: 0.75em; }
        sup { font-size: 0.75em; }
      </style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-card px-2 py-1.5">
      {/* History */}
      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Font family picker */}
      <div className="relative" ref={fontFamilyRef}>
        {(() => {
          const currentFamily = editor.getAttributes("textStyle").fontFamily as string | undefined;
          const found = FONT_FAMILIES.find((f) => f.value === currentFamily);
          const displayLabel = found ? (found.value ? found.label : "Font") : "Font";
          return (
            <button
              type="button"
              onClick={() => { setShowFontFamily(!showFontFamily); setShowFontSize(false); setShowHeadings(false); }}
              className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground max-w-[88px]"
              title="Font family"
              style={{ fontFamily: currentFamily || undefined }}
            >
              <span className="truncate">{displayLabel}</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
          );
        })()}
        {showFontFamily && (
          <div className="absolute left-0 top-8 z-50 min-w-[190px] rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            {FONT_FAMILIES.map((f) => (
              <button
                key={f.label}
                type="button"
                className="flex w-full items-center px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                style={{ fontFamily: f.value || undefined }}
                onClick={() => {
                  if (f.value) {
                    editor.chain().focus().setFontFamily(f.value).run();
                  } else {
                    editor.chain().focus().unsetFontFamily().run();
                  }
                  setShowFontFamily(false);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font size picker */}
      <div className="relative" ref={fontSizeRef}>
        {(() => {
          const currentSize = editor.getAttributes("textStyle").fontSize as string | undefined;
          const displaySize = currentSize ? currentSize.replace("px", "") : "—";
          return (
            <button
              type="button"
              onClick={() => { setShowFontSize(!showFontSize); setShowFontFamily(false); setShowHeadings(false); }}
              className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Font size"
            >
              <span className="w-6 text-center">{displaySize}</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
          );
        })()}
        {showFontSize && (
          <div className="absolute left-0 top-8 z-50 w-28 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            <div className="p-1.5 border-b border-border">
              <input
                type="number"
                min={6}
                max={96}
                placeholder="Size…"
                value={fontSizeInput}
                onChange={(e) => setFontSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && fontSizeInput) {
                    editor.chain().focus().setFontSize(`${fontSizeInput}px`).run();
                    setShowFontSize(false);
                    setFontSizeInput("");
                  }
                }}
                className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                  onClick={() => {
                    editor.chain().focus().setFontSize(`${size}px`).run();
                    setShowFontSize(false);
                    setFontSizeInput("");
                  }}
                >
                  <span>{size}</span>
                  <span className="text-muted-foreground" style={{ fontSize: `${Math.min(Number(size), 16)}px` }}>Aa</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Heading picker */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowHeadings(!showHeadings)}
          className="flex h-7 items-center gap-1 rounded px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Paragraph style"
        >
          {currentHeading}
          <ChevronDown className="h-3 w-3" />
        </button>
        {showHeadings && (
          <div className="absolute left-0 top-8 z-50 min-w-[140px] rounded-lg border border-border bg-card shadow-lg">
            {[
              { label: "Normal text", icon: <Type className="h-4 w-4" />, action: () => editor.chain().focus().setParagraph().run() },
              { label: "Heading 1", icon: <Heading1 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
              { label: "Heading 2", icon: <Heading2 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
              { label: "Heading 3", icon: <Heading3 className="h-4 w-4" />, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                onClick={() => { item.action(); setShowHeadings(false); }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
        <Bold className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
        <Italic className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">
        <SubscriptIcon className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">
        <SuperscriptIcon className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Text color picker */}
      <div className="relative" ref={colorRef}>
        <button
          type="button"
          onClick={() => { setShowTextColor(!showTextColor); setShowHighlight(false); setShowTable(false); }}
          title="Text color"
          className="flex h-7 w-7 flex-col items-center justify-center gap-0.5 rounded transition-colors hover:bg-accent"
        >
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <div
            className="h-0.5 w-4 rounded-full"
            style={{ background: editor.getAttributes("textStyle").color || "#000" }}
          />
        </button>
        {showTextColor && (
          <div className="absolute left-0 top-9 z-50 rounded-xl border border-border bg-card p-2 shadow-xl">
            <p className="mb-1.5 px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Text Color</p>
            <div className="grid grid-cols-6 gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => {
                    if (c.value) {
                      editor.chain().focus().setColor(c.value).run();
                    } else {
                      editor.chain().focus().unsetColor().run();
                    }
                    setShowTextColor(false);
                  }}
                  className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
                    c.value === "" ? "border-border bg-gradient-to-br from-red-400 via-green-400 to-blue-400" : "border-transparent"
                  }`}
                  style={c.value ? { background: c.value } : undefined}
                />
              ))}
            </div>
            <div className="mt-2 border-t border-border pt-2">
              <label className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground cursor-pointer">
                <input
                  type="color"
                  className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                />
                Custom color
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Highlight color picker */}
      <div className="relative" ref={highlightRef}>
        <button
          type="button"
          onClick={() => { setShowHighlight(!showHighlight); setShowTextColor(false); setShowTable(false); }}
          title="Highlight color"
          className={`flex h-7 w-7 flex-col items-center justify-center gap-0.5 rounded transition-colors hover:bg-accent ${editor.isActive("highlight") ? "bg-accent" : ""}`}
        >
          <Highlighter className="h-3.5 w-3.5 text-muted-foreground" />
          <div
            className="h-0.5 w-4 rounded-full"
            style={{ background: editor.getAttributes("highlight").color || "#fef08a" }}
          />
        </button>
        {showHighlight && (
          <div className="absolute left-0 top-9 z-50 rounded-xl border border-border bg-card p-2 shadow-xl">
            <p className="mb-1.5 px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Highlight</p>
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => {
                    if (c.value) {
                      editor.chain().focus().toggleHighlight({ color: c.value }).run();
                    } else {
                      editor.chain().focus().unsetHighlight().run();
                    }
                    setShowHighlight(false);
                  }}
                  className={`h-6 w-6 rounded border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                    c.value === "" ? "border-destructive/50" : "border-transparent"
                  }`}
                  style={c.value ? { background: c.value } : undefined}
                >
                  {c.value === "" && <X className="h-3 w-3 text-destructive" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
        <AlignLeft className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
        <AlignCenter className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
        <AlignRight className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
        <AlignJustify className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Lists & blocks */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        <List className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
        <Quote className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
        <Code className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
        <Code2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <Minus className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <ToolbarDivider />

      {/* Insert link */}
      <ToolbarBtn
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        title="Insert link"
      >
        <Link2 className="h-3.5 w-3.5" />
      </ToolbarBtn>

      {/* Table */}
      <div className="relative" ref={tableRef}>
        <ToolbarBtn
          onClick={() => { setShowTable(!showTable); setShowTextColor(false); setShowHighlight(false); }}
          active={editor.isActive("table")}
          title="Insert / edit table"
        >
          <TableIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        {showTable && (
          <div className="absolute left-0 top-9 z-50 min-w-[180px] rounded-xl border border-border bg-card p-2 shadow-xl">
            <p className="mb-1.5 px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Table</p>
            {[
              { label: "Insert 3×3 table", action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
              { label: "Add row above", action: () => editor.chain().focus().addRowBefore().run() },
              { label: "Add row below", action: () => editor.chain().focus().addRowAfter().run() },
              { label: "Add column left", action: () => editor.chain().focus().addColumnBefore().run() },
              { label: "Add column right", action: () => editor.chain().focus().addColumnAfter().run() },
              { label: "Toggle header row", action: () => editor.chain().focus().toggleHeaderRow().run() },
              { label: "Delete row", action: () => editor.chain().focus().deleteRow().run() },
              { label: "Delete column", action: () => editor.chain().focus().deleteColumn().run() },
              { label: "Delete table", action: () => editor.chain().focus().deleteTable().run() },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-accent ${item.label.startsWith("Delete") ? "text-destructive hover:text-destructive" : ""}`}
                onClick={() => { item.action(); setShowTable(false); }}
              >
                {item.label.startsWith("Delete") && <Trash2 className="h-3 w-3 shrink-0" />}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Clear formatting */}
      <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear formatting">
        <RemoveFormatting className="h-3.5 w-3.5" />
      </ToolbarBtn>

      <div className="ml-auto">
        <button
          type="button"
          onClick={handlePrint}
          title="Export as PDF"
          className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <Printer className="h-3.5 w-3.5" />
          Export PDF
        </button>
      </div>
    </div>
  );
}

interface ChatMsg {
  id: number;
  role: "user" | "ai";
  text: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}

export default function StudyNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  const [files, setFiles] = useState<File[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [detailedNotes, setDetailedNotes] = useState(false);
  const [appendMode, setAppendMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);

  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [showZeroTokenPopup, setShowZeroTokenPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState<"chat" | "detailed" | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("10");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchTokenBalance = useCallback(async () => {
    const token = getToken();
    try {
      const res = await fetch("/api/tokens/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { tokenBalance: number };
        setTokenBalance(data.tokenBalance);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    void fetchTokenBalance();
  }, [fetchTokenBalance]);

  const handleBuyTokens = async (ghsAmount: number) => {
    setBuyLoading(true);
    const token = getToken();
    try {
      const res = await fetch("/api/tokens/purchase", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ghsAmount }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        tokensAdded?: number;
        tokenBalance?: number;
        error?: string;
      };
      if (!res.ok) {
        toast({ title: "Purchase failed", description: data.error ?? "Please try again.", variant: "destructive" });
        return;
      }
      setTokenBalance(data.tokenBalance ?? 0);
      setShowBuyTokens(false);
      toast({
        title: `${(data.tokensAdded ?? 0).toLocaleString()} tokens added!`,
        description: "You can now continue using Proff-Steve.",
      });
      if (pendingAction === "chat") {
        setPendingAction(null);
        setShowZeroTokenPopup(false);
      } else if (pendingAction === "detailed") {
        setPendingAction(null);
        setShowZeroTokenPopup(false);
      }
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "destructive" });
    } finally {
      setBuyLoading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
      Placeholder.configure({
        placeholder:
          "Your notes will appear here. Use the right panel to generate content, or start typing directly…",
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      ImageExt.configure({ HTMLAttributes: { class: "max-w-full rounded-lg my-4" } }),
      LinkExt.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Typography,
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      FontFamily,
      FontSize,
    ],
    content: "",
    onUpdate({ editor: e }) {
      const text = e.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none p-6 min-h-full",
      },
    },
  });

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const fresh = arr.filter((f) => !existingNames.has(f.name));
      return [...prev, ...fresh];
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  function applyToEditor(html: string) {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const isEmpty = !currentHtml || currentHtml === "<p></p>";
    if (appendMode && !isEmpty) {
      editor.commands.setContent(
        currentHtml + '<hr style="margin:24px 0;border-color:#e2e8f0;">' + html,
      );
    } else {
      editor.commands.setContent(html);
    }
  }

  const handleAskAI = async () => {
    if (!prompt.trim() && files.length === 0 && !youtubeUrl.trim()) {
      toast({
        title: "Nothing to send",
        description: "Upload files, enter a YouTube URL, or type a question/request.",
        variant: "destructive",
      });
      return;
    }

    if (tokenBalance !== null && tokenBalance <= 0) {
      setPendingAction("chat");
      setShowZeroTokenPopup(true);
      return;
    }

    const userText = prompt.trim() || "(Analyze the uploaded files and describe what you find)";
    const userMsgId = ++msgIdRef.current;
    setChatMessages((prev) => [...prev, { id: userMsgId, role: "user", text: userText }]);
    setPrompt("");

    setIsGenerating(true);
    try {
      const token = getToken();
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("message", userText);
      formData.append("youtubeUrl", youtubeUrl.trim());
      const historyForApi = chatMessages.slice(-6).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      formData.append("history", JSON.stringify(historyForApi));

      const res = await fetch("/api/study-notes/chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string; code?: string };
        if (err.code === "INSUFFICIENT_TOKENS") {
          setPendingAction("chat");
          setShowZeroTokenPopup(true);
          setChatMessages((prev) => prev.filter((m) => m.id !== userMsgId));
          return;
        }
        throw new Error(err.error ?? "Failed to generate notes. Please try again.");
      }

      const data = (await res.json()) as { html: string; tokenBalance?: number; tokensUsed?: number };
      applyToEditor(data.html);

      if (data.tokenBalance !== undefined) setTokenBalance(data.tokenBalance);

      const aiPreview = stripHtml(data.html);
      const aiMsgId = ++msgIdRef.current;
      setChatMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: "ai", text: aiPreview || "Response added to editor ✓" },
      ]);

      if (data.tokenBalance === 0) {
        toast({
          title: "Tokens depleted",
          description: "You've used all your tokens. Purchase more to continue.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "AI request failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setChatMessages((prev) => prev.filter((m) => m.id !== userMsgId));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && files.length === 0 && !youtubeUrl.trim()) {
      toast({
        title: "Nothing to generate from",
        description: "Upload files, enter a YouTube URL, or type a prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const token = getToken();
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("prompt", prompt.trim());
      formData.append("youtubeUrl", youtubeUrl.trim());

      const res = await fetch("/api/study-notes/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Generation failed");
      }

      const data = (await res.json()) as { html: string };
      applyToEditor(data.html);
      toast({ title: "Notes generated!", description: "Your study notes are ready in the editor." });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDetailedFetch = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Enter a topic",
        description: 'Type a topic name in the Instructions field (e.g. "Mitochondria").',
        variant: "destructive",
      });
      return;
    }

    if (tokenBalance !== null && tokenBalance < 100) {
      setPendingAction("detailed");
      setShowZeroTokenPopup(true);
      return;
    }

    setIsGenerating(true);
    try {
      const token = getToken();
      const res = await fetch("/api/study-notes/detailed-wikipedia", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: prompt.trim() }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string; code?: string };
        if (err.code === "INSUFFICIENT_TOKENS") {
          setPendingAction("detailed");
          setShowZeroTokenPopup(true);
          return;
        }
        throw new Error(err.error ?? "Failed to fetch content");
      }

      const data = (await res.json()) as { html: string; title: string; pageUrl: string; tokenBalance?: number; tokensUsed?: number };
      applyToEditor(data.html);

      if (data.tokenBalance !== undefined) setTokenBalance(data.tokenBalance);

      toast({
        title: `Loaded: ${data.title}`,
        description: `Full detailed article loaded — 100 tokens used.`,
      });

      if (data.tokenBalance === 0) {
        toast({
          title: "Tokens depleted",
          description: "You've used all your tokens. Purchase more to continue.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Fetch failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
        {/* Page header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <BookOpenText className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">Make Study Notes</h1>
                <p className="text-xs text-muted-foreground">AI-powered note generation from any material</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {wordCount > 0 ? `${wordCount.toLocaleString()} words` : ""}
            </span>
            {/* Token balance display */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  tokenBalance === null
                    ? "bg-muted text-muted-foreground border-border"
                    : tokenBalance === 0
                    ? "bg-destructive/10 text-destructive border-destructive/30"
                    : tokenBalance < 500
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/40"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-400/40"
                }`}
              >
                <Coins className="h-3.5 w-3.5" />
                {tokenBalance === null ? (
                  <span>Loading…</span>
                ) : (
                  <span>{tokenBalance.toLocaleString()} tokens</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowBuyTokens(true)}
                className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <ShoppingCart className="h-3 w-3" />
                Buy Tokens
              </button>
            </div>
          </div>
        </div>

        {/* Three-pane layout */}
        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          {/* LEFT: Editor */}
          <Panel defaultSize={62} minSize={35} className="flex flex-col overflow-hidden">
            <EditorToolbar editor={editor} />
            <div className="flex-1 overflow-y-auto bg-background">
              <EditorContent editor={editor} className="h-full" />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border transition-colors hover:bg-primary/40 active:bg-primary/60" />

          {/* RIGHT COLUMN */}
          <Panel defaultSize={38} minSize={25} className="flex flex-col overflow-hidden">
            <PanelGroup direction="vertical">
              {/* TOP RIGHT: Upload zone */}
              <Panel defaultSize={45} minSize={28} className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">Upload Materials</span>
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    40+ formats
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
                  {/* Drop zone */}
                  <div
                    ref={dropZoneRef}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-5 transition-all ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/60"
                    }`}
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-sm">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      {isDragging ? "Drop files here" : "Drag & drop or click to browse"}
                    </p>
                    <p className="mt-1 text-center text-[10px] leading-relaxed text-muted-foreground">
                      PDF, DOCX, PPTX, TXT, MD, CSV, EPUB<br />
                      Images · Audio · Video · 40+ formats
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={FILE_ACCEPT}
                    className="hidden"
                    onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                  />

                  {/* YouTube URL */}
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                    <Youtube className="h-3.5 w-3.5 shrink-0 text-red-500" />
                    <input
                      type="url"
                      placeholder="Paste YouTube URL…"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {youtubeUrl && (
                      <button type="button" onClick={() => setYoutubeUrl("")}>
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="flex-1 space-y-1.5 overflow-y-auto">
                      {files.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                        >
                          <FileCategoryIcon name={file.name} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
                            <p className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length === 0 && !youtubeUrl && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { icon: <FileText className="h-3 w-3" />, label: "Docs & PDFs", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
                        { icon: <ImageIcon className="h-3 w-3" />, label: "Images & Slides", color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20" },
                        { icon: <Music className="h-3 w-3" />, label: "Audio files", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
                        { icon: <Video className="h-3 w-3" />, label: "Video files", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium ${item.color}`}
                        >
                          {item.icon}
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-border transition-colors hover:bg-primary/40 active:bg-primary/60" />

              {/* BOTTOM RIGHT: AI Chat or Detailed Notes */}
              <Panel defaultSize={55} minSize={32} className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
                  {detailedNotes ? (
                    <BookMarked className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <MessagesSquare className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="text-xs font-semibold text-foreground">
                    {detailedNotes ? "Detailed Notes" : "Proff-Steve"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3">

                  {/* CHAT MODE (toggle OFF) */}
                  {!detailedNotes && (
                    <>
                      {/* Chat history */}
                      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                        {chatMessages.length === 0 ? (
                          <div className="flex h-full flex-col items-center justify-center gap-2 py-4 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                              <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <p className="text-xs font-semibold text-foreground">Ask me anything</p>
                            <p className="text-[10px] leading-relaxed text-muted-foreground max-w-[180px]">
                              Upload files to ask questions about them, or ask me anything without files.
                            </p>
                          </div>
                        ) : (
                          <>
                            {chatMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[88%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                                    msg.role === "user"
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-foreground border border-border"
                                  }`}
                                >
                                  {msg.role === "ai" && (
                                    <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                      <Sparkles className="h-3 w-3" />
                                      Proff-Steve · Response added to editor
                                    </span>
                                  )}
                                  <span className={msg.role === "ai" ? "text-muted-foreground" : ""}>
                                    {msg.text}
                                  </span>
                                </div>
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </>
                        )}
                      </div>

                      {/* Input */}
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isGenerating) {
                            e.preventDefault();
                            void handleAskAI();
                          }
                        }}
                        placeholder={
                          files.length > 0
                            ? "Ask a question about the uploaded file(s)…"
                            : "Ask me anything — explain a concept, write notes, summarise a topic…"
                        }
                        rows={3}
                        className="resize-none rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                      />
                    </>
                  )}

                  {/* DETAILED NOTES MODE (toggle ON) */}
                  {detailedNotes && (
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={`Enter a topic to load detailed notes on, e.g.:\n• "Mitochondria"\n• "French Revolution"\n• "Photosynthesis"\n• "DNA replication"`}
                      className="flex-1 resize-none rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    />
                  )}

                  {/* Toggles row */}
                  <div className="flex flex-col gap-1.5">
                    {/* Detailed Notes toggle */}
                    <button
                      type="button"
                      onClick={() => setDetailedNotes((v) => !v)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                        detailedNotes
                          ? "border-amber-400/60 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      <div className={`relative h-4 w-7 rounded-full transition-colors ${detailedNotes ? "bg-amber-500" : "bg-muted-foreground/30"}`}>
                        <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${detailedNotes ? "translate-x-3.5" : "translate-x-0.5"}`} />
                      </div>
                      <BookMarked className="h-3.5 w-3.5 shrink-0" />
                      <span>Detailed Notes</span>
                    </button>

                    {/* Append to Notes toggle */}
                    <button
                      type="button"
                      onClick={() => setAppendMode((v) => !v)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                        appendMode
                          ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      <div className={`relative h-4 w-7 rounded-full transition-colors ${appendMode ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
                        <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${appendMode ? "translate-x-3.5" : "translate-x-0.5"}`} />
                      </div>
                      <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Append to Notes</span>
                      {appendMode && (
                        <span className="ml-auto text-[10px] font-normal opacity-75">adds below existing</span>
                      )}
                    </button>
                  </div>

                  {/* Action button */}
                  <button
                    type="button"
                    onClick={
                      detailedNotes
                        ? handleDetailedFetch
                        : handleAskAI
                    }
                    disabled={isGenerating}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                      detailedNotes
                        ? "bg-amber-500 text-white hover:bg-amber-500/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {detailedNotes ? "Loading notes…" : "Thinking…"}
                      </>
                    ) : detailedNotes ? (
                      <>
                        <BookMarked className="h-4 w-4" />
                        Load Detailed Notes
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="h-4 w-4" />
                        Ask Proff-Steve
                        <span className="ml-1 text-[10px] font-normal opacity-70">Ctrl+Enter</span>
                      </>
                    )}
                  </button>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* BUY TOKENS DIALOG */}
      {showBuyTokens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Purchase Tokens</h2>
                  <p className="text-xs text-muted-foreground">Power Proff-Steve with tokens</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBuyTokens(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                <Coins className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span>Current balance: <strong className="text-foreground">{tokenBalance?.toLocaleString() ?? 0} tokens</strong></span>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-1">Choose a package</p>

              {/* GHS 5 card */}
              <button
                type="button"
                onClick={() => void handleBuyTokens(5)}
                disabled={buyLoading}
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">50,000 Tokens</p>
                  <p className="text-xs text-muted-foreground">~50,000 words in AI mode · 500 detailed articles</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-primary">GH₵ 5</p>
                </div>
              </button>

              {/* GHS 10 card */}
              <button
                type="button"
                onClick={() => void handleBuyTokens(10)}
                disabled={buyLoading}
                className="relative flex w-full items-center gap-4 rounded-xl border-2 border-primary/40 bg-primary/5 px-4 py-3.5 text-left transition-all hover:border-primary/70 hover:bg-primary/10 disabled:opacity-60"
              >
                <div className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Best Value
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">100,000 Tokens</p>
                  <p className="text-xs text-muted-foreground">~100,000 words in AI mode · 1,000 detailed articles</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-primary">GH₵ 10</p>
                </div>
              </button>

              {/* Custom card */}
              <div className="rounded-xl border border-border bg-muted/40 px-4 py-3.5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Custom Amount</p>
                    <p className="text-xs text-muted-foreground">GH₵ 5 = 50,000 tokens (multiples of 5)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">GH₵</span>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="10"
                    />
                  </div>
                  <div className="flex-1 rounded-lg bg-muted/60 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">You get</p>
                    <p className="text-sm font-bold text-foreground">
                      {(() => {
                        const amt = parseInt(customAmount) || 0;
                        const rounded = Math.floor(amt / 5) * 5;
                        return rounded > 0 ? `${(rounded * 10000).toLocaleString()} tokens` : "—";
                      })()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const amt = parseInt(customAmount) || 0;
                      const rounded = Math.floor(amt / 5) * 5;
                      if (rounded >= 5) void handleBuyTokens(rounded);
                      else toast({ title: "Minimum is GH₵ 5", variant: "destructive" });
                    }}
                    disabled={buyLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {buyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Buy
                  </button>
                </div>
              </div>

              <p className="text-center text-[10px] text-muted-foreground pt-1">
                Tokens are deducted from your virtual account balance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ZERO TOKEN POPUP */}
      {showZeroTokenPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Out of Tokens</h2>
                  <p className="text-xs text-muted-foreground">
                    {pendingAction === "detailed"
                      ? "You need at least 100 tokens to load detailed notes."
                      : "You need tokens to use Proff-Steve."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowZeroTokenPopup(false); setPendingAction(null); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 flex items-center gap-3">
                <Coins className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">You have {tokenBalance?.toLocaleString() ?? 0} tokens remaining</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingAction === "detailed" ? "100 tokens needed · " : ""}Top up your account, then purchase tokens to continue.
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">How to get tokens</p>

              {[
                {
                  step: 1,
                  icon: <ArrowUpCircle className="h-4 w-4 text-primary" />,
                  title: "Top up your virtual account",
                  desc: "Go to My Account Balance → Top Up. Load via MoMo or card (GH₵ 5, 10, or any amount).",
                },
                {
                  step: 2,
                  icon: <Coins className="h-4 w-4 text-amber-500" />,
                  title: "Come back to this page",
                  desc: "Return to Make Study Notes after your top-up is confirmed.",
                },
                {
                  step: 3,
                  icon: <ShoppingCart className="h-4 w-4 text-emerald-500" />,
                  title: "Click \"Buy Tokens\" at the top",
                  desc: "Choose GH₵ 5 (50,000 tokens), GH₵ 10 (100,000 tokens), or a custom amount.",
                },
                {
                  step: 4,
                  icon: <Sparkles className="h-4 w-4 text-purple-500" />,
                  title: "Tokens added instantly — continue your session",
                  desc: "Your token balance updates immediately. Click Ask Proff-Steve or Load Detailed Notes to continue.",
                },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
                    {step}
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      {icon}
                      <p className="text-xs font-semibold text-foreground">{title}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-1">
                <Link href="/my-account-balance" className="flex-1">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
                  >
                    <ArrowUpCircle className="h-4 w-4" />
                    Top Up Account
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => { setShowZeroTokenPopup(false); setShowBuyTokens(true); }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy Tokens Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
