import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import JSZip from "jszip";
import { toFile } from "openai";
import { YoutubeTranscript } from "youtube-transcript";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

const IMAGE_EXTS = new Set([
  "avif", "bmp", "gif", "ico", "jp2", "png", "webp", "tif", "tiff",
  "heic", "heif", "jpeg", "jpg", "jpe",
]);
const AUDIO_EXTS = new Set([
  "aac", "aif", "aifc", "aiff", "amr", "au", "m4a", "mid", "mp3",
  "ogg", "opus", "ra", "ram", "snd", "wav", "wma", "cda",
]);
const VIDEO_EXTS = new Set(["3g2", "3gp", "avi", "mp4", "mpeg", "mov", "webm"]);

function getExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const ext = getExt(file.originalname);

  if (ext === "pdf") {
    const result = await pdfParse(file.buffer);
    return result.text;
  }

  if (ext === "docx") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (ext === "pptx") {
    const zip = await JSZip.loadAsync(file.buffer);
    const texts: string[] = [];
    for (const [filename, f] of Object.entries(zip.files)) {
      if (filename.startsWith("ppt/slides/slide") && filename.endsWith(".xml")) {
        const xml = await f.async("string");
        const text = xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (text) texts.push(text);
      }
    }
    return texts.join("\n\n");
  }

  if (["txt", "md", "csv", "epub"].includes(ext)) {
    return file.buffer.toString("utf-8");
  }

  if (IMAGE_EXTS.has(ext)) {
    const base64 = file.buffer.toString("base64");
    const mimeType = ["jpg", "jpe"].includes(ext) ? "image/jpeg" : `image/${ext}`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract and describe all text, diagrams, charts, and educational content from this image in detail. If it is a slide or document page, transcribe all text content verbatim, then describe any diagrams or visual elements.",
              },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
              },
            ],
          },
        ],
        max_tokens: 2000,
      });
      return response.choices[0]?.message?.content ?? "";
    } catch {
      return "";
    }
  }

  if (AUDIO_EXTS.has(ext) || VIDEO_EXTS.has(ext)) {
    try {
      const audioFile = await toFile(file.buffer, file.originalname, { type: file.mimetype });
      const result = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });
      return result.text;
    } catch {
      return "";
    }
  }

  return "";
}

interface WikiResult {
  title: string;
  fullText: string;
  imageUrls: string[];
  pageUrl: string;
}

async function fetchWikipedia(topic: string): Promise<WikiResult | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = (await searchRes.json()) as [string, string[], string[], string[]];
    const pageTitle = searchData[1]?.[0];
    if (!pageTitle) return null;

    const encodedTitle = encodeURIComponent(pageTitle);

    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodedTitle}&format=json&origin=*&explaintext=true&exsectionformat=plain`;
    const extractRes = await fetch(extractUrl, {
      headers: { "Api-User-Agent": "ExamAI-StudyNotes/1.0" },
    });
    if (!extractRes.ok) return null;

    const extractData = (await extractRes.json()) as {
      query: { pages: Record<string, { extract?: string }> };
    };
    const pages = extractData.query.pages;
    const pageData = Object.values(pages)[0];
    const fullText = pageData?.extract ?? "";

    const mediaUrl = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodedTitle}`;
    let imageUrls: string[] = [];
    try {
      const mediaRes = await fetch(mediaUrl, {
        headers: { "Api-User-Agent": "ExamAI-StudyNotes/1.0" },
      });
      if (mediaRes.ok) {
        const mediaData = (await mediaRes.json()) as {
          items?: Array<{ type: string; srcset?: Array<{ src: string; scale: string }>; original?: { source: string } }>;
        };
        imageUrls = (mediaData.items ?? [])
          .filter((item) => item.type === "image" && (item.srcset || item.original))
          .slice(0, 5)
          .map((item) => {
            if (item.original?.source) return item.original.source;
            const best = item.srcset?.find((s) => s.scale === "2x") ?? item.srcset?.[0];
            return best?.src ?? "";
          })
          .filter(Boolean)
          .map((url) => (url.startsWith("//") ? `https:${url}` : url));
      }
    } catch {
      imageUrls = [];
    }

    return {
      title: pageTitle,
      fullText,
      imageUrls,
      pageUrl: `https://en.wikipedia.org/wiki/${encodedTitle}`,
    };
  } catch {
    return null;
  }
}

router.post(
  "/study-notes/generate",
  requireAuth,
  upload.array("files", 30),
  async (req: AuthRequest, res) => {
    try {
      const files = (req.files ?? []) as Express.Multer.File[];
      const prompt = (req.body.prompt as string | undefined) ?? "";
      const youtubeUrl = (req.body.youtubeUrl as string | undefined) ?? "";

      const contentParts: string[] = [];
      const wikiImages: string[] = [];

      for (const file of files) {
        const text = await extractTextFromFile(file);
        if (text.trim()) {
          contentParts.push(`[From: ${file.originalname}]\n${text}`);
        }
      }

      if (youtubeUrl.trim()) {
        try {
          const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
          const transcriptText = transcript.map((t) => t.text).join(" ");
          if (transcriptText.trim()) {
            contentParts.push(`[YouTube Video Transcript]\n${transcriptText}`);
          }
        } catch {
          contentParts.push(`[YouTube URL: ${youtubeUrl}]\nNote: Transcript could not be extracted from this video.`);
        }
      }

      const sourceContent = contentParts.join("\n\n---\n\n");

      const topicRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              'Extract 1–3 specific searchable topics from the user\'s instruction and any provided content. Return ONLY a JSON array of topic strings, e.g. ["Photosynthesis","Chlorophyll"]. If no specific topics can be identified, return [].',
          },
          {
            role: "user",
            content:
              prompt + (sourceContent ? `\n\nContent excerpt: ${sourceContent.slice(0, 600)}` : ""),
          },
        ],
        max_tokens: 120,
      });

      let topics: string[] = [];
      try {
        const raw = topicRes.choices[0]?.message?.content?.trim() ?? "[]";
        topics = JSON.parse(raw) as string[];
      } catch {
        topics = [];
      }

      const wikiParts: string[] = [];
      for (const topic of topics.slice(0, 3)) {
        const result = await fetchWikipedia(topic);
        if (result) {
          wikiParts.push(`[${result.title}]\n${result.fullText}`);
          wikiImages.push(...result.imageUrls);
        }
      }

      const wikiSection = wikiParts.length > 0
        ? `\n\n[Additional Reference Content]\n${wikiParts.join("\n\n")}`
        : "";

      const fullContext = (sourceContent + wikiSection).trim();

      const imageHtml = wikiImages
        .map((url) => `<img src="${url}" alt="Illustration" style="max-width:100%;border-radius:8px;margin:16px 0;">`)
        .join("\n");

      const systemPrompt = `You are an expert educator creating comprehensive, beautifully structured HTML study notes.

CRITICAL FORMATTING RULES — follow every rule without exception:
- Output ONLY valid inner HTML — no markdown fences, no <!DOCTYPE>, no <html>/<head>/<body> wrapper tags
- <h1> for the main document title (one only)
- <h2> for major topic sections
- <h3> for subsections
- <p> for all prose paragraphs
- <ul><li> for concept lists and bullet points
- <ol><li> for numbered steps or ranked items
- <strong> for key terms, definitions, and critical points
- <em> for technical terms and emphasis
- <blockquote> for important definitions, laws, or quotes
- <table><thead><tbody><tr><th><td> for comparative or tabular data
- Do NOT include a References section or any citations
- CRITICAL: Do NOT summarize, shorten, or condense the source content. Present ALL information faithfully and in full
- If images were provided, embed them inline at appropriate places: ${imageHtml || "(none this time)"}
- End with a <h2>Key Takeaways</h2> section`;

      const userMessage = `USER INSTRUCTION: ${prompt || "Generate comprehensive study notes from the provided content."}

${
  fullContext
    ? `SOURCE CONTENT:\n${fullContext.slice(0, 20000)}`
    : "Generate comprehensive notes on the topic(s) the user mentioned, using your expert knowledge."
}

Generate the full HTML study notes now. Remember: present all content in full — do not summarise or shorten it. Do NOT include a References section.`;

      const notesRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 4096,
      });

      const html =
        notesRes.choices[0]?.message?.content ??
        "<p>Unable to generate notes at this time. Please try again.</p>";

      res.json({ html, images: wikiImages });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate notes";
      res.status(500).json({ error: message });
    }
  },
);

function removeWikiSections(html: string, titlesToRemove: string[]): string {
  const titlesLower = titlesToRemove.map(t => t.toLowerCase().trim());
  // Split keeping h2 tags as separate elements via capturing group
  const parts = html.split(/(<h2[\s\S]*?<\/h2>)/gi);
  const result: string[] = [];
  let skip = false;
  for (const part of parts) {
    const isH2 = /^<h2[\s>]/i.test(part);
    if (isH2) {
      const headingText = part.replace(/<[^>]+>/g, '').toLowerCase().trim();
      if (titlesLower.some(t => headingText === t)) {
        skip = true;
        continue;
      }
      skip = false;
      result.push(part);
    } else {
      if (!skip) result.push(part);
    }
  }
  return result.join('');
}

function convertToBulletsBySentence(html: string): string {
  const skipPattern = /\b(references?|notes?|citations?|bibliography|footnotes?)\b/i;
  const parts = html.split(/(<h2[\s\S]*?<\/h2>)/gi);
  let inSkipSection = false;
  return parts.map(part => {
    const isH2 = /^<h2[\s>]/i.test(part);
    if (isH2) {
      const headingText = part.replace(/<[^>]+>/g, '').toLowerCase().trim();
      inSkipSection = skipPattern.test(headingText);
      return part;
    }
    if (inSkipSection) return part;
    return part.replace(/<p([^>]*)>([\s\S]*?)<\/p>/gi, (_match, attrs: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return `<p${attrs}>${content}</p>`;
      const sentences = trimmed
        .split(/(?<=[.!?])\s+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 3);
      if (sentences.length <= 1) return `<p${attrs}>${content}</p>`;
      return `<ul>${sentences.map((s: string) => `<li>${s}</li>`).join('')}</ul>`;
    });
  }).join('');
}

interface WikiDetailedResult {
  title: string;
  html: string;
  pageUrl: string;
  allImages: string[];
}

async function fetchWikipediaDetailed(topic: string): Promise<WikiDetailedResult | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = (await searchRes.json()) as [string, string[], string[], string[]];
    const pageTitle = searchData[1]?.[0];
    if (!pageTitle) return null;

    const encodedTitle = encodeURIComponent(pageTitle);

    const [parseRes, mediaRes] = await Promise.all([
      fetch(
        `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&prop=text&format=json&origin=*`,
        { headers: { "Api-User-Agent": "ExamAI-StudyNotes/1.0" } },
      ),
      fetch(
        `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodedTitle}`,
        { headers: { "Api-User-Agent": "ExamAI-StudyNotes/1.0" } },
      ),
    ]);

    if (!parseRes.ok) return null;

    const parseData = (await parseRes.json()) as {
      parse?: { title: string; text: { "*": string } };
    };
    if (!parseData.parse) return null;

    let html = parseData.parse.text["*"];

    html = html
      .replace(/src="\/\//g, 'src="https://')
      .replace(/srcset="([^"]*)"/g, (_, val: string) => `srcset="${val.replace(/\/\//g, 'https://')}"`)
      .replace(/href="\/wiki\//g, 'href="https://en.wikipedia.org/wiki/')
      .replace(/<span[^>]*class="[^"]*mw-editsection[^"]*"[\s\S]*?<\/span>/g, '')
      .replace(/<sup[^>]*class="[^"]*reference[^"]*"[\s\S]*?<\/sup>/g, '')
      .replace(/<table[^>]*class="[^"]*\b(?:navbox|ambox|metadata|mbox|tmbox|ombox|fmbox|cmbox|plainlinks tnavbar)[^"]*"[\s\S]*?<\/table>/g, '')
      .replace(/<div[^>]*class="[^"]*\b(?:hatnote|shortdescription|noprint|reflist|navbox)[^"]*"[\s\S]*?<\/div>/g, '')
      .replace(/style="[^"]*display\s*:\s*none[^"]*"/g, '');

    // Remove "See also" and "External links" sections
    html = removeWikiSections(html, ["See also", "External links"]);

    // Convert paragraph text to per-sentence bullets (skip References/Notes/Citations)
    html = convertToBulletsBySentence(html);

    let allImages: string[] = [];
    try {
      if (mediaRes.ok) {
        const mediaData = (await mediaRes.json()) as {
          items?: Array<{
            type: string;
            srcset?: Array<{ src: string; scale: string }>;
            original?: { source: string };
          }>;
        };
        allImages = (mediaData.items ?? [])
          .filter((item) => item.type === "image" && (item.original || item.srcset))
          .map((item) => {
            if (item.original?.source) return item.original.source;
            const best = item.srcset?.find((s) => s.scale === "2x") ?? item.srcset?.[0];
            return best?.src ?? "";
          })
          .filter(Boolean)
          .map((url) => (url.startsWith("//") ? `https:${url}` : url));
      }
    } catch {
      allImages = [];
    }

    return {
      title: parseData.parse.title,
      html,
      pageUrl: `https://en.wikipedia.org/wiki/${encodedTitle}`,
      allImages,
    };
  } catch {
    return null;
  }
}

router.post(
  "/study-notes/detailed-wikipedia",
  requireAuth,
  async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    try {
      const topic = (req.body.topic as string | undefined) ?? "";
      if (!topic.trim()) {
        res.status(400).json({ error: "Topic is required. Enter a topic in the Instructions field." });
        return;
      }

      const [userRow] = await db
        .select({ tokenBalance: usersTable.tokenBalance })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      const currentTokens = userRow?.tokenBalance ?? 0;
      if (currentTokens < 100) {
        res.status(402).json({
          error: "Insufficient tokens. Loading detailed notes costs 100 tokens.",
          code: "INSUFFICIENT_TOKENS",
          tokenBalance: currentTokens,
        });
        return;
      }

      const result = await fetchWikipediaDetailed(topic.trim());
      if (!result) {
        res.status(404).json({ error: `No article found for "${topic.trim()}". Try a more specific topic name.` });
        return;
      }

      await db.update(usersTable).set({
        tokenBalance: sql`${usersTable.tokenBalance} - 100`,
      }).where(eq(usersTable.id, userId));

      const newTokenBalance = currentTokens - 100;

      const wrapperHtml = `
<div style="font-family:Georgia,serif;line-height:1.7;color:inherit;">
  <div style="border-bottom:2px solid #d4a017;padding-bottom:12px;margin-bottom:24px;">
    <h1 style="margin:0;font-size:1.8em;">${result.title}</h1>
    <a href="${result.pageUrl}" target="_blank" rel="noopener noreferrer" style="font-size:0.75em;color:#3366cc;">View source ↗</a>
  </div>
  ${result.html}
</div>`;

      res.json({
        html: wrapperHtml,
        title: result.title,
        pageUrl: result.pageUrl,
        allImages: result.allImages,
        tokenBalance: newTokenBalance,
        tokensUsed: 100,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch content";
      res.status(500).json({ error: message });
    }
  },
);

router.post(
  "/study-notes/chat",
  requireAuth,
  upload.array("files", 30),
  async (req: AuthRequest, res) => {
    const userId = req.user!.userId;
    try {
      const files = (req.files ?? []) as Express.Multer.File[];
      const message = (req.body.message as string | undefined) ?? "";
      const youtubeUrl = (req.body.youtubeUrl as string | undefined) ?? "";
      const historyRaw = (req.body.history as string | undefined) ?? "[]";

      const [userRow] = await db
        .select({ tokenBalance: usersTable.tokenBalance })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);

      const currentTokens = userRow?.tokenBalance ?? 0;
      if (currentTokens <= 0) {
        res.status(402).json({
          error: "You have no tokens left. Purchase tokens to continue using Proff-Steve.",
          code: "INSUFFICIENT_TOKENS",
          tokenBalance: 0,
        });
        return;
      }

      let history: Array<{ role: string; content: string }> = [];
      try {
        history = JSON.parse(historyRaw) as Array<{ role: string; content: string }>;
      } catch {
        history = [];
      }

      const contentParts: string[] = [];

      for (const file of files) {
        const text = await extractTextFromFile(file);
        if (text.trim()) {
          contentParts.push(`[From: ${file.originalname}]\n${text}`);
        }
      }

      if (youtubeUrl.trim()) {
        try {
          const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
          const transcriptText = transcript.map((t) => t.text).join(" ");
          if (transcriptText.trim()) {
            contentParts.push(`[YouTube Video Transcript]\n${transcriptText}`);
          }
        } catch {
          contentParts.push(`[YouTube URL: ${youtubeUrl}]\nNote: Transcript could not be extracted from this video.`);
        }
      }

      const fileContext = contentParts.join("\n\n---\n\n");

      const systemPrompt = fileContext
        ? `You are Proff-Steve, a highly knowledgeable AI assistant helping a student. The student has uploaded files — use them as the primary context to answer questions and fulfill any request. Be thorough, accurate, and helpful.

OUTPUT FORMAT:
- Output valid inner HTML only (no <!DOCTYPE>, no <html>/<head>/<body> wrapper tags)
- Use <h2>/<h3> for sections, <p> for paragraphs, <ul><li> for lists, <strong> for key terms, <table> for data
- Do NOT include a References section
- Be comprehensive and detailed

UPLOADED FILE CONTENT:
${fileContext.slice(0, 18000)}`
        : `You are Proff-Steve, a highly knowledgeable AI assistant helping a student. Answer any question or request accurately, thoroughly, and in great detail. You can explain concepts, write essays, create summaries, generate notes, solve problems, compare topics, or do anything the student asks.

OUTPUT FORMAT:
- Output valid inner HTML only (no <!DOCTYPE>, no <html>/<head>/<body> wrapper tags)
- Use <h2>/<h3> for sections, <p> for paragraphs, <ul><li> for lists, <strong> for key terms, <table> for comparative data
- Do NOT include a References section
- Be comprehensive, detailed, and educational — include examples, explanations, and depth`;

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...history.slice(-6).map((h) => ({
          role: (h.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: message || "Analyse and describe everything in the provided content." },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 4096,
      });

      const html =
        response.choices[0]?.message?.content ??
        "<p>Unable to process your request at this time. Please try again.</p>";

      const wordCount = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter((w: string) => w.length > 0).length;
      const tokensToDeduct = Math.min(wordCount, currentTokens);

      if (tokensToDeduct > 0) {
        await db.update(usersTable).set({
          tokenBalance: sql`${usersTable.tokenBalance} - ${tokensToDeduct}`,
        }).where(eq(usersTable.id, userId));
      }

      const newTokenBalance = currentTokens - tokensToDeduct;

      res.json({ html, tokenBalance: newTokenBalance, tokensUsed: tokensToDeduct });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process request";
      res.status(500).json({ error: message });
    }
  },
);

export default router;
