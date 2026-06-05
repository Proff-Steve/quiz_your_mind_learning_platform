import { Router, type Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { toFile } from "openai";
import { YoutubeTranscript } from "youtube-transcript";
import { db, examsTable, questionsTable, examSessionsTable, materialsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { verifyToken } from "../lib/jwt.js";
import mammoth from "mammoth";
import JSZip from "jszip";
import sharp from "sharp";

const generateQuestionsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

type GenProgressEntry = { res: Response; userId: number };
const genProgressClients = new Map<string, GenProgressEntry>();

function emitGenProgress(jobId: string, userId: number, phase: string, percent?: number) {
  const entry = genProgressClients.get(jobId);
  if (entry && entry.userId === userId) {
    entry.res.write(`event: progress\ndata: ${JSON.stringify({ phase, percent })}\n\n`);
  }
}

function closeGenProgress(jobId: string, userId: number) {
  const entry = genProgressClients.get(jobId);
  if (entry && entry.userId === userId) {
    entry.res.write(`event: done\ndata: {}\n\n`);
    genProgressClients.delete(jobId);
  }
}

generateQuestionsRouter.get("/generate-questions/progress/:jobId", (req: AuthRequest, res) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.user = verifyToken(token);
  } catch {
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }

  const jobId = String(req.params.jobId);
  const userId = req.user!.userId;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("event: connected\ndata: {}\n\n");

  genProgressClients.set(jobId, { res, userId });

  req.on("close", () => {
    genProgressClients.delete(jobId);
  });
});

type DifficultyMode = "easy" | "medium" | "hard" | "usmle" | "uccsms" | "nmc";

function mapModeToEnum(mode: string): "easy" | "medium" | "hard" {
  if (mode === "easy") return "easy";
  if (mode === "medium") return "medium";
  if (mode === "hard" || mode === "usmle" || mode === "uccsms" || mode === "nmc") return "hard";
  return "medium";
}

function buildSystemPrompt(mode: DifficultyMode, numQuestions: number, isMedical: boolean): string {
  const medicalNote = isMedical
    ? "The content appears to be medical/health-related."
    : "";

  const easyFormats = `
EASY MODE distractor/format types (mix randomly):
- Negative/Exception-Based (NOT, EXCEPT, LEAST, FALSE)
- Absolute Terms (Always, Never, Only, Must)
- Vague/Qualifier (Usually, Commonly, Rarely, May, Can be)
- Comparative (More likely, Less likely, Most common)
- Causation vs Association (Causes vs Is associated with)
- Time/Sequence (Early vs Late, Acute vs Chronic)
- Double Negatives (Not uncommon, Cannot be excluded)
- Clinical Logic (Best next step, Most appropriate)
- Numerical/Threshold (Above/Below, Elevated vs Severely elevated)
- All/None patterns (All of the above, None of the above)
- Partially True, Close Cousin, Opposite Pair, Cause vs Effect Reversal, Mechanism vs Outcome, Gold Standard vs Practical, Overgeneralization, Outdated, Irrelevant but Correct, Extreme Detail, Numerical Near-Miss, Sequence Mix-Up, Eponym Confusion, Population Mismatch, Risk Factor vs Cause, Exception within Exception, Language Framing, Diagnostic vs Therapeutic, Anchor Bias, Too Good to Be True, Single Wrong Word, Unit Trap, Directionality Error, Context Shift, Stage/Phase, Frequency Illusion, Similar Concept, Same Category Overload, Redundant Option, Hidden Clue, Misleading Keyword, Process/Sequence, Feature Swap, Look-Alike Data, Timing Error, Strength of Relationship, Priority/Order, Overlapping Concepts, Terminology Trap, Pattern Recognition`;

  const longStemCount = {
    medium: Math.ceil(numQuestions * 0.20),
    hard: Math.ceil(numQuestions * 0.40),
    uccsms: Math.round(numQuestions * 0.30),
  };

  const longStemDefinition = `
DEFINITION — "Long Stem": A question_text that is 80–130 words long. For medical/clinical scenarios it must be 100–130 words and must include: patient demographics, key presenting complaint, 2–3 relevant past history items, current medications (if applicable), key vitals or one concise lab panel. Keep it focused — include only the details needed to answer the question. Do NOT pad with repetition.
DEFINITION — "Long Options": Each of the 4 options (A, B, C, D) must be a cohesive explanatory paragraph of 50–100 words (target 60–80 words). Each paragraph must include ALL THREE of the following: (1) the proposed answer or mechanism, (2) the underlying reasoning or evidence supporting or refuting it, and (3) the implication, consequence, or management step. Write each as a single cohesive paragraph — no bullet points.
FORMAT RULE FOR LONG-STEM QUESTIONS: Long-stem questions must randomly use format types from the mode's format list (e.g. Best Answer, EXCEPT, Assertion–Reason, Classic Combination, SATA, etc.). Each long option paragraph should be adapted to the chosen format — the three-part structure applies to all subjects, not only clinical scenarios.`;

  const mediumFormats = `
MEDIUM MODE formats (30% Easy + 70% of these):
- Classic Combination (Roman numerals I,II,III,IV with options like "I only", "II & III")
- True/False for each statement (independent MTF)
- Best Combination (K-type)
- "Which of the following are correct?" (A–E list, pick combination)
- "Select All That Apply" (SATA)
- Assertion–Reason (A-R type)
- Matching Type (EMQ – extended matching)
- Multiple Completion, Ranking/Ordering, Matrix Questions
- Cascading/Linked, Best Answer from Combinations
- Negative Combination (EXCEPT within combination)
- Confidence-Based MTF, Weighted Combination
- Conditional Combination, Hierarchical Combination
- Exception Within Combination, Scenario-Based Combination
- Multi-Step Reasoning Combination, Data Interpretation Combination
- Cross-Disciplinary Combination, Analogical Combination
- Cause–Effect Combination, Completeness-Based Combination
- Redundancy Detection, Contradiction-Based, Priority Ranking
- Partial Credit Combination
${isMedical ? "30% of questions must be scenario-based (clinical vignettes)." : ""}
${longStemDefinition}
MANDATORY LONG-STEM QUOTA: Exactly ${longStemCount.medium} of the ${numQuestions} questions must use a Long Stem AND Long Options (as defined above). The remaining ${numQuestions - longStemCount.medium} questions must use normal-length stems and options. Distribute the long-stem questions evenly — do NOT cluster them together.`;

  const hardFormats = `
DIFFICULT MODE formats (50% Medium + 50% of these advanced types):
- Matrix-Combination Hybrid, "Best Fit" Combination
- Uncertainty/Inference-Based, Constraint-Based Combination
- Error Identification Combination, "Minimum Set" Combination
- "Maximum Set" Combination, Necessary vs Sufficient
- Mutual Exclusivity, Hidden Assumption, Reframed Question
- Boundary Condition Trap, Counterexample-Based
- Equivalence Trap, Overlapping Truth Zones
- Signal vs Noise, Precision-Level Trap
- Definition vs Application Mix, Symbol/Notation Trap
- Reversal Under Condition, Composite Statement Trap
- Implicit Comparison, Default Assumption Trap
- Out-of-Scope Truth, Repetition with Variation
- Edge-Case Exception, Competing Correctness
- Implicit Negation, Perspective Shift, Cognitive Bias Exploit
${isMedical ? "40% of questions must be scenario-based (clinical vignettes)." : ""}
${longStemDefinition}
MANDATORY LONG-STEM QUOTA: Exactly ${longStemCount.hard} of the ${numQuestions} questions must use a Long Stem AND Long Options (as defined above). The remaining ${numQuestions - longStemCount.hard} questions must use normal-length stems and options. Distribute the long-stem questions evenly — do NOT cluster them together.`;

  const usmleFormats = `
USMLE STANDARD MODE (50% Difficult + 50% of):
- Uncertainty/Inference-Based ("most likely diagnosis", "best explanation")
- Best Fit (Single Best Answer – always one best even if others partially correct)
- Constraint-Based Reasoning (urgency, safety, guidelines)
- Error Identification (indirectly through wrong options)
- Matrix-Combination Hybrid (conceptual, e.g., ECG + lab)
- Single Best Answer (dominant format)
ALL questions should follow USMLE Step 1/2 clinical vignette style with rich clinical context. Each question stem must be at least 100 words, presenting a full clinical vignette before the question.`;

  const uccsmsHalf = Math.floor(numQuestions / 2);
  const uccsmsOtherHalf = numQuestions - uccsmsHalf;
  const uccsmsFormats = `
UCCSMS STANDARD MODE — STRICT 50% Medium + 50% Difficult split:
- For Level 400–600 students.
- 60% of questions must be clinical-based (scenarios).
- Do NOT include any student index numbers or ID references in the question text.

SPLIT RULE (non-negotiable): Exactly ${uccsmsHalf} questions must use MEDIUM MODE formats, and exactly ${uccsmsOtherHalf} questions must use DIFFICULT MODE formats. Interleave them — do NOT group all Medium questions together and all Difficult questions together.

MEDIUM MODE formats to use for the ${uccsmsHalf} medium questions (30% Easy + 70% of these):
- Classic Combination (Roman numerals I,II,III,IV with options like "I only", "II & III")
- True/False for each statement (independent MTF)
- Best Combination (K-type)
- "Which of the following are correct?" (A–E list, pick combination)
- "Select All That Apply" (SATA)
- Assertion–Reason (A-R type)
- Matching Type (EMQ – extended matching)
- Multiple Completion, Ranking/Ordering, Matrix Questions
- Cascading/Linked, Best Answer from Combinations
- Negative Combination (EXCEPT within combination)
- Confidence-Based MTF, Weighted Combination
- Conditional Combination, Hierarchical Combination
- Exception Within Combination, Scenario-Based Combination
- Multi-Step Reasoning Combination, Data Interpretation Combination
- Cross-Disciplinary Combination, Analogical Combination
- Cause–Effect Combination, Completeness-Based Combination
- Redundancy Detection, Contradiction-Based, Priority Ranking
- Partial Credit Combination

DIFFICULT MODE formats to use for the ${uccsmsOtherHalf} difficult questions (50% Medium + 50% of these advanced types):
- Matrix-Combination Hybrid, "Best Fit" Combination
- Uncertainty/Inference-Based, Constraint-Based Combination
- Error Identification Combination, "Minimum Set" Combination
- "Maximum Set" Combination, Necessary vs Sufficient
- Mutual Exclusivity, Hidden Assumption, Reframed Question
- Boundary Condition Trap, Counterexample-Based
- Equivalence Trap, Overlapping Truth Zones
- Signal vs Noise, Precision-Level Trap
- Definition vs Application Mix, Symbol/Notation Trap
- Reversal Under Condition, Composite Statement Trap
- Implicit Comparison, Default Assumption Trap
- Out-of-Scope Truth, Repetition with Variation
- Edge-Case Exception, Competing Correctness
- Implicit Negation, Perspective Shift, Cognitive Bias Exploit

${longStemDefinition}
MANDATORY LONG-STEM QUOTA: Exactly ${longStemCount.uccsms} of the ${numQuestions} questions (30%) must use a Long Stem AND Long Options (as defined above). The remaining ${numQuestions - longStemCount.uccsms} questions MUST use normal-length stems (15–40 words) and short options (5–15 words) — do NOT make them long. Distribute the long-stem questions evenly across the set — do NOT cluster them together. Making more than ${longStemCount.uccsms} questions long is a critical error.`;

  const nmcScenarioCount = Math.round(numQuestions * 0.50);
  const nmcKnowledgeCount = numQuestions - nmcScenarioCount;
  const nmcFormats = `
NMC STANDARD MODE — Nursing & Midwifery Council examination style.

FORMAT TYPES (mix randomly across ALL questions):
a. True/False for Each Statement (Independent MTF) — present 3–5 independent statements about a single topic; each statement is evaluated as True or False independently. The question should ask "Which of the following statements is/are TRUE?" or present as labelled statements with the options listing different true/false combinations.
b. Classic Combination Format — Roman numerals (I, II, III, IV) listing features/actions; options combine them (e.g. "I and III only", "II, III and IV", "All of the above").
c. Straight Single Best Answer (SBA) — one clear stem, four plausible options, one unambiguously correct answer. No tricks — just accurate recall or application.
d. "Almost true" statements — options contain statements that are mostly correct but have one critical inaccuracy (wrong dose, wrong timing, wrong anatomical structure, wrong patient group). The distractor is subtly wrong.
e. Absolute terms — options use "Always", "Never", "Must", "Only", "All patients" to create attractive but incorrect choices; the correct answer avoids absolutes or uses them accurately.
f. Concept mixing — options blend two related but distinct concepts (e.g. mixing standard precautions with transmission-based precautions, or mixing documentation requirements for different record types). Students must distinguish clearly.
g. Interdependence trap — a question where two options seem to depend on each other or appear linked, tempting the student to pick both; only one is the correct single best answer in context.
h. Reversal traps — options swap the correct direction of a relationship (e.g. "Notify the charge nurse BEFORE documenting" vs correct order; or listing the wrong party to inform first in a chain of command).

SCENARIO QUOTA — STRICT RULE:
Exactly ${nmcScenarioCount} of the ${numQuestions} questions (50%) must be REAL-LIFE WORKPLACE SCENARIOS set in a hospital or clinical facility but focused on NURSING/MIDWIFERY PRACTICE SITUATIONS — NOT on diagnosing or treating disease. These scenarios must depict everyday nursing/midwifery workplace events such as:
- Handover and shift communication (e.g. SBAR handover errors, incomplete handover)
- Documentation and record keeping (e.g. incident report timing, late entries, countersigning)
- Infection prevention and control practice (e.g. PPE donning/doffing order, hand hygiene moments, isolation procedures)
- Professional conduct and ethics (e.g. patient confidentiality breach, social media policy, scope of practice boundaries)
- Patient safety and incident management (e.g. near-miss reporting, fall prevention, pressure injury staging)
- Medication administration practice (e.g. 5 Rights check, witnessed discarding of controlled drugs, refusal to take medication)
- Team and ward management (e.g. delegation to HCAs, escalation pathways, staff-patient ratios)
- Equipment and environment (e.g. sharps disposal, labelling of infusions, checking emergency trolley)
- Consent and capacity (e.g. valid consent process, Gillick competence, best interest decisions)
- Safeguarding and duty of care (e.g. reporting concerns about a colleague, mandatory reporting obligations)
- Midwifery-specific situations (e.g. partogram interpretation prompt, skin-to-skin initiation, newborn check documentation)
Each scenario must name the nurse/midwife's role and give a brief situational context (2–4 sentences) before the question. Scenarios must feel realistic and immediately recognisable to a practising nurse or midwife.

The remaining ${nmcKnowledgeCount} questions (50%) must test underpinning knowledge and professional standards directly from the uploaded study material — using any of the 8 format types above.

Do NOT generate clinical diagnosis or treatment questions (no "what is the most likely diagnosis", no drug mechanism questions, no pathophysiology questions) — those belong to medical examinations, not NMC-style nursing/midwifery assessments.

Interleave scenario and knowledge questions — do NOT group them.`;

  let formatSection = "";
  if (mode === "easy") formatSection = easyFormats;
  else if (mode === "medium") formatSection = mediumFormats;
  else if (mode === "hard") formatSection = hardFormats;
  else if (mode === "usmle") formatSection = usmleFormats;
  else if (mode === "uccsms") formatSection = uccsmsFormats;
  else if (mode === "nmc") formatSection = nmcFormats;

  return `You are an expert MCQ question generator for academic and medical examinations.
${medicalNote}

Your task: Generate exactly ${numQuestions} high-quality multiple-choice questions based on the provided study material.

${formatSection}

CRITICAL OUTPUT RULES:
1. Output ONLY a valid JSON array — no markdown, no explanation, no code fences.
2. Each question object must have exactly these fields:
   - "question_text": string (the question stem)
   - "options": object with keys "A", "B", "C", "D" (each is a string option)
   - "correct_answer": string — exactly one of "A", "B", "C", or "D"
   - "rationale": string (brief explanation of why the correct answer is right)
3. All 4 options (A, B, C, D) must be plausible but only one is correct.
4. Do NOT include any text outside the JSON array.
5. Generate exactly ${numQuestions} question objects.
6. NEVER prefix the question_text with its format/type label. Do NOT start with labels like "Negative combination (EXCEPT):", "Extremely long stem (multi-step reasoning):", "Assertion–Reason (A-R type):", "Classic Combination:", or any similar descriptor. Write the question content directly.
7. For questions containing numbered statements, assertions, or reasons, place each one on its own line within question_text using \\n (e.g., "Consider the following statements:\\nStatement 1: ...\\nStatement 2: ...\\nWhich of the above is/are correct?").
8. NEVER include the answer choices inside "question_text". The "question_text" field must contain ONLY the question stem. All choices belong exclusively in the "options" object. Do not write lines like "A) ...", "B) ...", "A. ...", "B. ..." anywhere inside "question_text".
10. NEVER prefix option values with the option letter. The value of "A" must be the option text only — NOT "A. text" or "A) text" or "(A) text". The letter key IS the label; do not repeat it inside the value.
9. LONG-STEM QUOTA (applies only to Medium, Hard, and UCCSMS modes — ignore for Easy/USMLE): Produce EXACTLY the stated number of long-stem questions — no more, no fewer. Each long-stem question_text must be 80–130 words (100–130 for medical). Each of its 4 options must be a cohesive explanatory paragraph of 50–100 words (target 60–80 words) containing the proposed answer/mechanism, supporting reasoning, and an implication/management step. All remaining questions must use normal-length stems (15–40 words) and short options (5–15 words). Violating the quota count in either direction is a critical error.

Example format (short stem):
[
  {
    "question_text": "Which of the following is NOT a function of the liver?",
    "options": {
      "A": "Glycogen storage",
      "B": "Bile production",
      "C": "Insulin synthesis",
      "D": "Detoxification of drugs"
    },
    "correct_answer": "C",
    "rationale": "Insulin is synthesized by the beta cells of the pancreatic islets of Langerhans, not the liver."
  }
]

Example format (LONG stem + LONG options — long-stem questions must match this style; note the format type here is "Best Answer" but any mode format type is valid):
[
  {
    "question_text": "A 58-year-old woman with type 2 diabetes and CKD stage 3 (eGFR 42 mL/min/1.73m²) presents with 2 days of confusion and generalised weakness after completing a 5-day ibuprofen course for knee pain. Medications: metformin 1000 mg BD, lisinopril 10 mg daily, atorvastatin 40 mg nightly. Vitals: BP 98/62 mmHg, HR 108 bpm, RR 20. Labs: Na⁺ 136 mEq/L, K⁺ 6.5 mEq/L, Cl⁻ 102 mEq/L, HCO₃ 15 mEq/L, glucose 196 mg/dL, BUN 78 mg/dL, creatinine 3.8 mg/dL (baseline 1.2), lactate 2.3 mmol/L. Urinalysis: no casts, no eosinophils. Which of the following BEST explains the primary mechanism of her acute kidney injury?",
    "options": {
      "A": "NSAID-induced acute interstitial nephritis (AIN) is a cell-mediated hypersensitivity reaction causing tubular inflammation, classically presenting with the triad of fever, maculopapular rash, and urinary eosinophils alongside peripheral eosinophilia. This patient displays none of these hallmark features, making AIN an unlikely primary mechanism. If AIN were confirmed, management would require prompt NSAID cessation and a short course of corticosteroids to limit ongoing tubulo-interstitial damage.",
      "B": "Type 4 renal tubular acidosis (hyporeninemic hypoaldosteronism) arising from long-standing diabetic nephropathy causes persistent hyperkalemia through impaired aldosterone-driven urinary potassium excretion and a mild non-anion gap metabolic acidosis. However, this is a chronic, slowly progressive process that cannot explain the sudden threefold rise in creatinine observed here. There is no acute pharmacologic intervention that rapidly corrects established RTA type 4.",
      "C": "The 'triple whammy' mechanism occurs when an ACE inhibitor dilates the efferent arteriole while an NSAID constricts the afferent arteriole through prostaglandin inhibition, each independently reducing intraglomerular filtration pressure. In a patient with underlying diabetic nephropathy and already-diminished renal reserve, this haemodynamic synergy precipitates acute oliguric renal failure without tubular inflammation. Immediate management requires cessation of both lisinopril and ibuprofen and cautious IV isotonic saline to restore renal perfusion pressure.",
      "D": "Metformin undergoes exclusive renal clearance, and any significant drop in eGFR causes plasma accumulation, which eventually inhibits hepatic mitochondrial complex I, impairing lactate oxidation and producing type B lactic acidosis. Although metformin should be discontinued promptly in this patient, the only mildly abnormal bicarbonate and the absence of a measured serum lactate make metformin-induced lactic acidosis an unlikely primary driver of the acute creatinine elevation."
    },
    "correct_answer": "C",
    "rationale": "The combination of ACE inhibitor + NSAID + pre-existing CKD creates the classic triple whammy haemodynamic AKI. AIN (A) is excluded by absent urinalysis findings; RTA type 4 (B) does not explain an acute creatinine spike; metformin toxicity (D) is speculative without a reported lactate. Stopping both nephrotoxic agents and giving IV fluids is the immediate priority."
  }
]`;
}

/**
 * Strip any embedded option lines from a question stem.
 */
function stripEmbeddedOptions(text: string): string {
  const optionLinePattern = /(?:[\r\n]+[ \t]*(?:\([A-Da-d]\)|[A-Da-d][\)\.:])[ \t].+){2,4}\s*$/;
  return text.replace(optionLinePattern, "").trim();
}

/**
 * Strip leading option-letter prefixes that the AI sometimes includes in
 * option values, e.g. "A. Some text" → "Some text", "(A) Some text" → "Some text".
 */
function stripOptionPrefix(text: string): string {
  return text.replace(/^\s*(?:\([A-Da-d]\)|[A-Da-d][\)\.:])\s+/, "").trim();
}

function detectMedical(text: string): boolean {
  const medicalKeywords = [
    "patient", "diagnosis", "treatment", "symptom", "disease", "clinical",
    "anatomy", "physiology", "pathology", "pharmacology", "surgery", "medicine",
    "hospital", "drug", "therapy", "prognosis", "etiology", "epidemiology",
    "blood", "organ", "cell", "tissue", "infection", "antibiotic", "vaccine",
    "mcq", "usmle", "clinical vignette", "presenting complaint"
  ];
  const lowerText = text.toLowerCase();
  const matches = medicalKeywords.filter(k => lowerText.includes(k));
  return matches.length >= 3;
}

const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "m4a", "ogg", "webm", "flac", "aac", "opus"]);
const AUDIO_MIME_PREFIXES = ["audio/", "video/webm", "video/ogg", "video/mp4"];
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

function isAudioFile(file: Express.Multer.File): boolean {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";
  if (AUDIO_EXTENSIONS.has(ext)) return true;
  return AUDIO_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix));
}

function isImageFile(file: Express.Multer.File): boolean {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.has(ext) || file.mimetype.startsWith("image/");
}

async function transcribeAudio(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "mp3";
  const mimeType = file.mimetype || `audio/${ext}`;
  const audioFile = await toFile(file.buffer, file.originalname, { type: mimeType });
  const result = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });
  return result.text.trim();
}

async function fetchYoutubeTranscript(url: string): Promise<string> {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (!match) {
    throw new Error(
      "That doesn't look like a valid YouTube link. Please check the URL and try again (e.g. https://www.youtube.com/watch?v=…)."
    );
  }
  const videoId = match[1];
  try {
    const chunks = await YoutubeTranscript.fetchTranscript(videoId);
    if (!chunks || chunks.length === 0) {
      throw new Error(
        "This video doesn't have captions enabled. Try a video with auto-generated or manual captions."
      );
    }
    return chunks.map((c) => c.text).join(" ").trim();
  } catch (err) {
    if (!(err instanceof Error)) {
      throw new Error(
        "This video doesn't have captions enabled. Try a video with auto-generated or manual captions."
      );
    }

    // Re-throw errors we already classified (e.g. the empty-chunks check above)
    if (
      err.message.startsWith("This video doesn't have captions") ||
      err.message.startsWith("This video is unavailable")
    ) {
      throw err;
    }

    const msg = err.message.toLowerCase();

    // Check unavailable/private/removed FIRST — these often contain "transcript" too
    if (
      msg.includes("unavailable") ||
      msg.includes("private") ||
      msg.includes("not found") ||
      msg.includes("not exist") ||
      msg.includes("removed") ||
      msg.includes("404") ||
      msg.includes("410")
    ) {
      throw new Error(
        "This video is unavailable or private. Please check the link or try a different video."
      );
    }

    // Then check for captions/subtitles specifically disabled — avoid the
    // generic word "transcript" which also appears in unavailability errors
    if (
      msg.includes("disabled") ||
      msg.includes("no captions") ||
      msg.includes("captions") ||
      msg.includes("subtitles")
    ) {
      throw new Error(
        "This video doesn't have captions enabled. Try a video with auto-generated or manual captions."
      );
    }

    // Default: no transcript could be retrieved
    throw new Error(
      "This video doesn't have captions enabled. Try a video with auto-generated or manual captions."
    );
  }
}

type EmbeddedImage = { buffer: Buffer; mimeType: string };

/* ── COMBINED IMAGE ANALYSIS: OCR + MEDICAL CLASSIFICATION ─────────────── */
// One GPT-4o call per image extracts text AND classifies for medical use,
// replacing two sequential API waves with a single parallel wave.

type CombinedImageAnalysis = {
  ocrText: string;
  medical: MedicalImageAnalysis;
};

async function analyzeImageCombined(image: EmbeddedImage): Promise<CombinedImageAnalysis> {
  const base64Image = image.buffer.toString("base64");
  const dataUrl = `data:${image.mimeType};base64,${base64Image}`;

  const VALID_IMAGE_TYPES_COMBINED = new Set([
    "histology", "pathology",
    "radiology_xray", "radiology_ct", "radiology_mri", "radiology_ultrasound",
  ]);

  const prompt = `Analyze this image and respond with ONLY a valid JSON object — no markdown, no code fences.

Perform TWO tasks simultaneously:

TASK 1 — OCR: Extract ALL readable text visible in the image (printed, typed, handwritten, labels, captions, annotations, table data, formulas). Use an empty string if there is no readable text.

TASK 2 — STRICT medical classification. Only TWO categories qualify as medical:

  CATEGORY A — MICROGRAPHS (microscopy of tissue/cell specimens only):
    • histology  : stained tissue sections (H&E, PAS, Masson trichrome, Giemsa, IHC, etc.)
    • pathology  : microscopic pathology slides showing diseased tissue at cellular level

  CATEGORY B — RADIOLOGY (recognised imaging modality scans only):
    • radiology_xray       : plain-film X-ray radiograph
    • radiology_ct         : CT scan slice (axial/coronal/sagittal)
    • radiology_mri        : MRI scan slice
    • radiology_ultrasound : ultrasound / sonography image

  REJECT — return isMedical:false for ALL of the following regardless of medical content:
    • Clinical photographs of patients, skin lesions, wounds, or body parts
    • Gross anatomy / cadaver / macroscopic pathology specimens
    • Anatomical diagrams, illustrations, labeled drawings
    • Charts, graphs, tables, flowcharts
    • Equipment, instrument, or device photographs
    • Textbook page screenshots or scanned text pages
    • Photos of people, animals, buildings, or everyday objects
    • Any image that is NOT a microscopy slide OR a recognised imaging modality scan

If the image qualifies, also identify:
  1. Up to 4 key structures that are educationally important exam targets.
  2. Any existing labels, arrows, or annotations that could give away answers (to be covered).

NON-QUALIFYING → return:
{"ocrText":"<text or empty>","isMedical":false,"imageType":"not_medical","existingAnnotations":[],"keyStructures":[]}

QUALIFYING → return:
{"ocrText":"<text or empty>","isMedical":true,"imageType":"histology"|"pathology"|"radiology_xray"|"radiology_ct"|"radiology_mri"|"radiology_ultrasound","existingAnnotations":[{"cx":45,"cy":30,"w":15,"h":8}],"keyStructures":[{"x":50,"y":40,"description":"Nucleus showing karyolysis"}]}

All cx, cy, w, h, x, y values are PERCENTAGES of image dimensions (0–100). When in doubt, return not_medical.`;

  const fallback: CombinedImageAnalysis = {
    ocrText: "",
    medical: { isMedical: false, imageType: "not_medical", existingAnnotations: [], keyStructures: [] },
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 1400,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]) as {
      ocrText?: string;
      isMedical?: boolean;
      imageType?: string;
      existingAnnotations?: ExistingAnnotation[];
      keyStructures?: Array<{ x: number; y: number; description: string }>;
    };

    const qualifies =
      parsed.isMedical === true &&
      typeof parsed.imageType === "string" &&
      VALID_IMAGE_TYPES_COMBINED.has(parsed.imageType);

    return {
      ocrText: typeof parsed.ocrText === "string" ? parsed.ocrText : "",
      medical: qualifies
        ? {
            isMedical: true,
            imageType: parsed.imageType as MedicalImageAnalysis["imageType"],
            existingAnnotations: Array.isArray(parsed.existingAnnotations) ? parsed.existingAnnotations : [],
            keyStructures: Array.isArray(parsed.keyStructures) ? parsed.keyStructures : [],
          }
        : { isMedical: false, imageType: "not_medical", existingAnnotations: [], keyStructures: [] },
    };
  } catch {
    return fallback;
  }
}

/* ── MEDICAL IMAGE ANALYSIS TYPES ──────────────────────────────────────── */

type StructurePoint = {
  x: number;
  y: number;
  label: string;
  description: string;
};

type ExistingAnnotation = {
  cx: number;
  cy: number;
  w: number;
  h: number;
};

type MedicalImageAnalysis = {
  isMedical: boolean;
  imageType:
    | "histology"
    | "pathology"
    | "radiology_xray"
    | "radiology_ct"
    | "radiology_mri"
    | "radiology_ultrasound"
    | "not_medical";
  existingAnnotations: ExistingAnnotation[];
  keyStructures: Array<{ x: number; y: number; description: string }>;
};

/* ── MEDICAL IMAGE ANALYSIS (GPT-4o vision) ────────────────────────────── */

async function analyzeMedicalImage(image: EmbeddedImage): Promise<MedicalImageAnalysis | null> {
  const base64Image = image.buffer.toString("base64");
  const dataUrl = `data:${image.mimeType};base64,${base64Image}`;

  const VALID_IMAGE_TYPES = new Set([
    "histology", "pathology",
    "radiology_xray", "radiology_ct", "radiology_mri", "radiology_ultrasound",
  ]);

  const prompt = `Analyze this image and respond with ONLY a valid JSON object — no markdown, no code fences.

You must apply STRICT criteria. Only TWO categories of images qualify as medical for our purposes:

CATEGORY A — MICROGRAPHS (light or electron microscopy of tissue/cell specimens):
  • histology  : stained tissue sections (H&E, PAS, Masson trichrome, Giemsa, immunohistochemistry, etc.)
  • pathology  : microscopic pathology slides showing diseased tissue at cellular/subcellular level

CATEGORY B — RADIOLOGY (medical imaging modalities only):
  • radiology_xray       : plain-film X-ray radiograph
  • radiology_ct         : CT (computed tomography) scan slice (axial, coronal, or sagittal)
  • radiology_mri        : MRI (magnetic resonance imaging) scan slice
  • radiology_ultrasound : sonography / ultrasound image

REJECT EVERYTHING ELSE — the following must return isMedical:false regardless of medical content:
  • Clinical photographs of patients, wounds, skin lesions, or body parts
  • Gross anatomy / cadaver specimens (macroscopic, not under a microscope)
  • Anatomical diagrams, illustrations, or labeled drawings
  • Charts, graphs, tables, or flowcharts
  • Photographs of equipment, instruments, or devices
  • Textbook page screenshots or scanned text pages
  • Photos of people, buildings, or everyday objects
  • Any image that is NOT a microscopy slide OR a recognised imaging modality scan

If the image IS one of the two qualifying categories, identify:
1. Up to 4 key structures that are educationally important exam targets.
2. Any existing labels, arrows, annotations, or text overlays that could give away answers (to be covered).

QUALIFYING image — return EXACTLY:
{
  "isMedical": true,
  "imageType": "histology" | "pathology" | "radiology_xray" | "radiology_ct" | "radiology_mri" | "radiology_ultrasound",
  "existingAnnotations": [{ "cx": 45, "cy": 30, "w": 15, "h": 8 }],
  "keyStructures": [{ "x": 50, "y": 40, "description": "Nucleus of hepatocyte showing karyolysis" }]
}

NON-QUALIFYING image — return EXACTLY:
{ "isMedical": false, "imageType": "not_medical", "existingAnnotations": [], "keyStructures": [] }

All cx, cy, w, h, x, y values are PERCENTAGES of image dimensions (0–100). Be conservative — when in doubt, return not_medical.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 800,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as MedicalImageAnalysis;

    // Hard guard: isMedical must be true AND imageType must be a known qualifying type.
    if (!parsed.isMedical || !VALID_IMAGE_TYPES.has(parsed.imageType)) {
      return { isMedical: false, imageType: "not_medical", existingAnnotations: [], keyStructures: [] };
    }
    return parsed;
  } catch {
    return null;
  }
}

/* ── SVG BUILDERS ───────────────────────────────────────────────────────── */

function buildArrowSvg(structures: StructurePoint[], width: number, height: number): string {
  const defs: string[] = [];
  const elements: string[] = [];

  structures.forEach((s, i) => {
    const num = i + 1;
    const tx = Math.round((s.x / 100) * width);
    const ty = Math.round((s.y / 100) * height);

    const offX = tx < width / 2 ? -75 : 75;
    const offY = ty < height / 2 ? -75 : 75;
    const lx = Math.max(22, Math.min(width - 22, tx + offX));
    const ly = Math.max(22, Math.min(height - 22, ty + offY));

    defs.push(
      `<marker id="ah${num}" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">` +
        `<path d="M0,0 L0,6 L7,3 z" fill="#FF2222"/></marker>`
    );
    elements.push(
      `<line x1="${lx}" y1="${ly}" x2="${tx}" y2="${ty}" stroke="#FF2222" stroke-width="2.5" marker-end="url(#ah${num})"/>`,
      `<circle cx="${lx}" cy="${ly}" r="14" fill="#FF2222"/>`,
      `<text x="${lx}" y="${ly + 5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="white">${num}</text>`
    );
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<defs>${defs.join("")}</defs>` +
    elements.join("") +
    `</svg>`
  );
}

function buildCoverSvg(annotations: ExistingAnnotation[], width: number, height: number): string {
  if (annotations.length === 0)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`;

  const rects = annotations
    .map((a) => {
      const x = Math.round(((a.cx - a.w / 2) / 100) * width);
      const y = Math.round(((a.cy - a.h / 2) / 100) * height);
      const w = Math.round((a.w / 100) * width);
      const h = Math.round((a.h / 100) * height);
      return `<rect x="${x}" y="${y}" width="${Math.max(w, 10)}" height="${Math.max(h, 10)}" fill="black" opacity="0.82" rx="3"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${rects}</svg>`;
}

/* ── BATCH SIZE & TOKEN BUDGET PER MODE ─────────────────────────────────── */

function getBatchSize(mode: DifficultyMode): number {
  if (mode === "easy") return 40;
  if (mode === "medium") return 30;
  return 25; // hard, usmle, uccsms, nmc — need maximum headroom for long stems
}

function getTokenBudget(mode: DifficultyMode, chunkCount: number): number {
  if (mode === "easy") return Math.min(9000, Math.max(3000, chunkCount * 230));
  if (mode === "medium") return Math.min(14000, Math.max(4000, chunkCount * 480));
  return 16000; // hard/usmle/uccsms/nmc always need the full window
}

/* ── HELPERS ─────────────────────────────────────────────────────────────── */

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ── MEDICAL IMAGE PREPROCESSOR ─────────────────────────────────────────── */

/**
 * Enhance, de-label, and optionally annotate a medical image.
 * Pass a pre-computed analysis to avoid calling GPT-4o twice.
 * @param addArrows  When true, overlays numbered arrows for key structures.
 * @param maxArrows  Maximum arrows to draw (1–4). Ignored when addArrows=false.
 */
async function preprocessMedicalImage(
  image: EmbeddedImage,
  preComputedAnalysis?: MedicalImageAnalysis,
  addArrows: boolean = true,
  maxArrows: number = 4
): Promise<{
  processedImage: EmbeddedImage;
  structures: StructurePoint[];
  imageType: string;
} | null> {
  const analysis = preComputedAnalysis ?? await analyzeMedicalImage(image);
  if (!analysis || !analysis.isMedical) return null;

  try {
    const meta = await sharp(image.buffer).metadata();
    const width = meta.width ?? 800;
    const height = meta.height ?? 600;

    let processor = sharp(image.buffer).normalize();
    if (analysis.imageType.startsWith("radiology")) {
      processor = sharp(image.buffer).normalize().linear(1.25, -20);
    }
    let currentBuffer = await processor.png().toBuffer();

    if (analysis.existingAnnotations?.length > 0) {
      const coverSvg = buildCoverSvg(analysis.existingAnnotations, width, height);
      currentBuffer = await sharp(currentBuffer)
        .composite([{ input: Buffer.from(coverSvg), blend: "over" }])
        .png()
        .toBuffer();
    }

    const allStructures: StructurePoint[] = (analysis.keyStructures ?? [])
      .slice(0, 4)
      .map((s, i) => ({ x: s.x, y: s.y, label: String(i + 1), description: s.description }));

    const structures = addArrows ? allStructures.slice(0, Math.max(1, maxArrows)) : [];

    if (addArrows && structures.length > 0) {
      const arrowSvg = buildArrowSvg(structures, width, height);
      currentBuffer = await sharp(currentBuffer)
        .composite([{ input: Buffer.from(arrowSvg), blend: "over" }])
        .png()
        .toBuffer();
    }

    return {
      processedImage: { buffer: currentBuffer, mimeType: "image/png" },
      structures,
      imageType: analysis.imageType,
    };
  } catch {
    return null;
  }
}

/* ── MEDICAL IMAGE QUESTION GENERATION ──────────────────────────────────── */

const IMAGE_TYPE_LABEL: Record<string, string> = {
  histology: "histological micrograph",
  pathology: "pathology specimen image",
  radiology_xray: "X-ray radiograph",
  radiology_ct: "CT scan",
  radiology_mri: "MRI scan",
  radiology_ultrasound: "ultrasound image",
};

async function extractDocxContent(buffer: Buffer): Promise<{ text: string; images: EmbeddedImage[] }> {
  const images: EmbeddedImage[] = [];

  const result = await mammoth.convertToHtml(
    { buffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        try {
          const imgBuffer = await image.readAsBuffer();
          images.push({ buffer: imgBuffer, mimeType: image.contentType });
        } catch {
          // skip unreadable images
        }
        return { src: "" };
      }),
    }
  );

  const text = result.value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { text, images };
}

async function extractPptxContent(buffer: Buffer): Promise<{ text: string; images: EmbeddedImage[] }> {
  const zip = await JSZip.loadAsync(buffer);
  const images: EmbeddedImage[] = [];
  const slideTexts: string[] = [];

  const MIME_MAP: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
  };

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;

    if (path.startsWith("ppt/media/")) {
      const ext = path.split(".").pop()?.toLowerCase() ?? "";
      const mimeType = MIME_MAP[ext];
      if (mimeType) {
        const imgBuffer = Buffer.from(await file.async("arraybuffer"));
        images.push({ buffer: imgBuffer, mimeType });
      }
    }

    if (path.match(/^ppt\/slides\/slide\d+\.xml$/)) {
      const xmlContent = await file.async("text");
      const textMatches = xmlContent.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? [];
      const slideText = textMatches
        .map((m) => m.replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
        .join(" ");
      if (slideText) slideTexts.push(slideText);
    }
  }

  return { text: slideTexts.join("\n\n").trim(), images };
}

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "pdf") {
    try {
      const data = await pdfParse(file.buffer);
      const text = data.text.trim();
      if (!text) throw new Error("PDF parsed but contained no extractable text.");
      return text;
    } catch (err) {
      throw new Error(
        `Could not extract text from "${file.originalname}": ${err instanceof Error ? err.message : "PDF parse failed"}`
      );
    }
  }

  if (ext === "docx") {
    try {
      const { text } = await extractDocxContent(file.buffer);
      if (!text) throw new Error("Word document contained no extractable text.");
      return text;
    } catch (err) {
      throw new Error(
        `Could not extract text from "${file.originalname}": ${err instanceof Error ? err.message : "DOCX parse failed"}`
      );
    }
  }

  if (ext === "pptx" || ext === "ppt") {
    try {
      const { text } = await extractPptxContent(file.buffer);
      if (!text) return `[${file.originalname}] — Presentation content could not be extracted as text.`;
      return text;
    } catch {
      return `[${file.originalname}] — Presentation content could not be extracted as text.`;
    }
  }

  if (["txt", "md"].includes(ext)) {
    return file.buffer.toString("utf-8");
  }

  if (isAudioFile(file)) {
    return await transcribeAudio(file);
  }

  return `[File: ${file.originalname} — binary content not extractable as text]`;
}

type RawQuestion = {
  question_text: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  rationale: string;
};

type ImageQuestion = RawQuestion & { imageData: string };

type MedicalImageCandidate = {
  image: EmbeddedImage;
  analysis: MedicalImageAnalysis;
};

/**
 * Analyze all images in the pool and return only confirmed medical images.
 * Runs all analyses in parallel to minimise latency.
 */
async function analyzeAllMedicalImages(pool: EmbeddedImage[]): Promise<MedicalImageCandidate[]> {
  const results = await Promise.all(
    pool.map(async (image) => {
      const analysis = await analyzeMedicalImage(image);
      if (!analysis || !analysis.isMedical) return null;
      return { image, analysis };
    })
  );
  return results.filter(Boolean) as MedicalImageCandidate[];
}

/**
 * Generate EXACTLY ONE image-based MCQ from a pre-processed medical image.
 *
 * questionType:
 *   "whole"  → asks about the overall image (diagnosis, modality, general pathology).
 *              No arrows are drawn; the image is cleaned and enhanced only.
 *   "arrow"  → asks about a specific structure indicated by 1–2 numbered arrows
 *              drawn on the image.
 */
async function generateSingleImageQuestion(
  candidate: MedicalImageCandidate,
  contextText: string,
  questionType: "whole" | "arrow"
): Promise<ImageQuestion | null> {
  const addArrows = questionType === "arrow";
  const preprocessed = await preprocessMedicalImage(
    candidate.image,
    candidate.analysis,
    addArrows,
    2
  );
  if (!preprocessed) return null;

  const { processedImage, structures, imageType } = preprocessed;
  const base64Image = processedImage.buffer.toString("base64");
  const dataUrl = `data:image/png;base64,${base64Image}`;
  const typeLabel = IMAGE_TYPE_LABEL[imageType] ?? "medical image";

  let imagePrompt: string;

  if (questionType === "whole") {
    imagePrompt = `You are an expert medical MCQ question generator. The image shown is a ${typeLabel}.
All original labels, annotations, and arrows have been removed so you must assess the image directly.

Study material context (background only — do NOT copy questions from it):
${contextText.slice(0, 2000)}

Generate EXACTLY 1 multiple-choice question that tests understanding of the OVERALL image.
Focus on: overall diagnosis, tissue/organ/modality identification, predominant pathological process, or general interpretation.
Do NOT reference any arrow, label, or numbered structure.
Phrase the question as "Based on this image…", "The overall appearance of this ${typeLabel} is most consistent with…", "What is the most likely diagnosis shown in this image?", etc.

Output ONLY a valid JSON array containing exactly 1 object with:
- "question_text": string
- "options": { "A": "…", "B": "…", "C": "…", "D": "…" }
- "correct_answer": "A" | "B" | "C" | "D"
- "rationale": detailed medical explanation`;
  } else {
    const structureList =
      structures.length > 0
        ? structures.map((s) => `  Arrow ${s.label}: ${s.description}`).join("\n")
        : "  (Ask about the most prominent visible structure)";

    imagePrompt = `You are an expert medical MCQ question generator. The image shown is a ${typeLabel} with ${structures.length} numbered red arrow(s) pointing to specific anatomical or pathological structures.

Structures indicated by the arrows:
${structureList}

Study material context (background only — do NOT copy questions from it):
${contextText.slice(0, 2000)}

Generate EXACTLY 1 multiple-choice question about the structure(s) indicated by the arrow(s).
The question MUST reference a specific arrow number (e.g., "The structure indicated by Arrow 1…", "What does Arrow 1 point to?", "Arrow 1 demonstrates which finding?").
Test: structure identity, function, or pathological significance.

Output ONLY a valid JSON array containing exactly 1 object with:
- "question_text": string (MUST cite the arrow number)
- "options": { "A": "…", "B": "…", "C": "…", "D": "…" }
- "correct_answer": "A" | "B" | "C" | "D"
- "rationale": detailed medical explanation`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
            { type: "text", text: imagePrompt },
          ],
        },
      ],
    });

    const rawOutput = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = rawOutput.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const q = parsed[0] as RawQuestion;
    if (
      !q.question_text ||
      !q.options?.A ||
      !q.options?.B ||
      !q.options?.C ||
      !q.options?.D ||
      !["A", "B", "C", "D"].includes(q.correct_answer)
    ) return null;

    return { ...q, imageData: dataUrl };
  } catch {
    return null;
  }
}

generateQuestionsRouter.post(
  "/generate-questions",
  requireAuth,
  upload.array("files", 20),
  async (req, res) => {
    const jobId = (req.body as Record<string, string>).jobId as string | undefined;

    try {
      const {
        pastedText = "",
        youtubeUrl = "",
        duration,
        numQuestions,
        difficulty,
        useMaterial,
        focusArea = "",
      } = req.body as {
        pastedText?: string;
        youtubeUrl?: string;
        duration: string;
        numQuestions: string;
        difficulty: string;
        useMaterial?: string;
        focusArea?: string;
        jobId?: string;
      };

      const authReqEarly = req as AuthRequest;
      const userIdEarly = authReqEarly.user?.userId;
      if (jobId && userIdEarly !== undefined) {
        emitGenProgress(jobId, userIdEarly, "uploading", 5);
      }

      const durationMin = Math.max(1, parseInt(duration, 10) || 45);
      const numQ = Math.max(1, Math.min(200, parseInt(numQuestions, 10) || 20));
      const mode = (difficulty as DifficultyMode) || "medium";

      const files = (req.files as Express.Multer.File[]) ?? [];
      const extractedTexts: string[] = [];
      const extractionErrors: string[] = [];

      const authReqLocal = req as AuthRequest;
      const userIdLocal = authReqLocal.user?.userId ?? null;

      const imagePool: EmbeddedImage[] = [];
      let youtubeErrorMsg: string | null = null;

      if (useMaterial === "true" && userIdLocal) {
        const savedMaterials = await db
          .select({ textContent: materialsTable.textContent, fileName: materialsTable.fileName })
          .from(materialsTable)
          .where(eq(materialsTable.userId, userIdLocal));

        if (savedMaterials.length === 0) {
          res.status(400).json({ error: "No saved materials found. Please upload files in My Materials first." });
          return;
        }

        for (const mat of savedMaterials) {
          if (mat.textContent.trim()) extractedTexts.push(`--- ${mat.fileName} ---\n${mat.textContent.trim()}`);
        }
      } else {
        const hasAudio = files.some(isAudioFile);
        if (hasAudio && jobId && userIdLocal !== null) {
          emitGenProgress(jobId, userIdLocal, "transcribing", 15);
        }

        type FileResult = { texts: string[]; images: EmbeddedImage[]; error?: string };

        const fileResults = await Promise.all(
          files.map(async (file): Promise<FileResult> => {
            if (isImageFile(file)) {
              return { texts: [], images: [{ buffer: file.buffer, mimeType: file.mimetype || "image/png" }] };
            }
            const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";
            if (ext === "docx") {
              try {
                const { text, images } = await extractDocxContent(file.buffer);
                return { texts: text.trim() ? [text] : [], images };
              } catch (err) {
                return { texts: [], images: [], error: err instanceof Error ? err.message : `Failed to read ${file.originalname}` };
              }
            }
            if (ext === "pptx" || ext === "ppt") {
              try {
                const { text, images } = await extractPptxContent(file.buffer);
                return { texts: text.trim() ? [text] : [], images };
              } catch (err) {
                return { texts: [], images: [], error: err instanceof Error ? err.message : `Failed to read ${file.originalname}` };
              }
            }
            try {
              const text = await extractTextFromFile(file);
              return { texts: text.trim() ? [text] : [], images: [] };
            } catch (err) {
              return { texts: [], images: [], error: err instanceof Error ? err.message : `Failed to read ${file.originalname}` };
            }
          })
        );

        for (const r of fileResults) {
          extractedTexts.push(...r.texts);
          imagePool.push(...r.images);
          if (r.error) extractionErrors.push(r.error);
        }

        if (pastedText.trim()) extractedTexts.push(pastedText.trim());

        if (youtubeUrl.trim()) {
          try {
            const transcript = await fetchYoutubeTranscript(youtubeUrl.trim());
            if (transcript) extractedTexts.push(`--- YouTube transcript ---\n${transcript}`);
          } catch (err) {
            youtubeErrorMsg = err instanceof Error ? err.message : "Could not fetch transcript";
            extractionErrors.push(youtubeErrorMsg);
          }
        }
      }

      /* ── COMBINED IMAGE ANALYSIS (OCR + medical classification) ─────────── */
      // One GPT-4o call per image replaces two sequential API waves.
      const preMedicalCandidates: MedicalImageCandidate[] = [];
      if (imagePool.length > 0) {
        if (jobId && userIdLocal !== null) {
          emitGenProgress(jobId, userIdLocal, "reading", 20);
        }
        const imageAnalyses = await Promise.all(imagePool.map((img) => analyzeImageCombined(img)));
        imageAnalyses.forEach((analysis, idx) => {
          if (analysis.ocrText.trim()) {
            extractedTexts.push(`--- Image text ---\n${analysis.ocrText.trim()}`);
          }
          if (analysis.medical.isMedical) {
            preMedicalCandidates.push({ image: imagePool[idx], analysis: analysis.medical });
          }
        });
      }

      if (extractedTexts.length === 0 && imagePool.length === 0) {
        const onlySourceWasYoutube =
          youtubeUrl.trim().length > 0 &&
          files.length === 0 &&
          !pastedText.trim() &&
          youtubeErrorMsg !== null;

        if (onlySourceWasYoutube) {
          res.status(400).json({ error: youtubeErrorMsg });
          return;
        }

        const detail = extractionErrors.length > 0 ? ` Details: ${extractionErrors.join("; ")}` : "";
        res.status(400).json({ error: `No readable content found. Please upload a PDF, Word document, PowerPoint, image (photos of notes, slides, or handwritten text), audio file, paste text, or provide a YouTube URL.${detail}` });
        return;
      }

      const combinedText = extractedTexts.join("\n\n---\n\n");
      const truncatedText = combinedText.slice(0, 80000);
      const isMedical = detectMedical(truncatedText);

      if (jobId && userIdLocal !== null) {
        emitGenProgress(jobId, userIdLocal, "generating", 30);
      }

      function isValidQuestion(q: RawQuestion): boolean {
        const optA = stripOptionPrefix(q.options?.A ?? "");
        const optB = stripOptionPrefix(q.options?.B ?? "");
        const optC = stripOptionPrefix(q.options?.C ?? "");
        const optD = stripOptionPrefix(q.options?.D ?? "");
        return !!(
          q.question_text &&
          optA.length > 2 &&
          optB.length > 2 &&
          optC.length > 2 &&
          optD.length > 2 &&
          ["A", "B", "C", "D"].includes(q.correct_answer)
        );
      }

      /* ── IMAGE QUESTION QUOTA ──────────────────────────────────────── */
      // Rule: if uploaded materials contain micrographic or radiological images,
      // randomly select EXACTLY 3 of them and generate exactly 3 image questions:
      //   Q1 (Image 1) — Whole-image question (no arrows, overall diagnosis/modality)
      //   Q2 (Image 2) — Arrow-based question (1–2 arrows, ask about indicated structure)
      //   Q3 (Image 3) — Arrow-based question (1–2 arrows, ask about different structure)
      // If fewer than 3 confirmed medical images are found → no image questions.
      let imageQuestionPool: ImageQuestion[] = [];
      if (imagePool.length > 0) {
        const medicalCandidates = preMedicalCandidates; // already computed in combined analysis above

        if (medicalCandidates.length >= 3) {
          const shuffled = shuffleArray(medicalCandidates);
          const [img1, img2, img3] = shuffled.slice(0, 3);

          const [q1, q2, q3] = await Promise.all([
            generateSingleImageQuestion(img1, truncatedText, "whole"),
            generateSingleImageQuestion(img2, truncatedText, "arrow"),
            generateSingleImageQuestion(img3, truncatedText, "arrow"),
          ]);

          imageQuestionPool = [q1, q2, q3].filter(Boolean) as ImageQuestion[];
        }
        // Fewer than 3 confirmed medical images → no image questions generated
      }

      const numTextQ = numQ - imageQuestionPool.length;

      /* ── TEXT QUESTION GENERATION ────────────────────────────────── */
      const MAX_RETRIES = 2;

      let parsedQuestions: RawQuestion[] = [];

      if (numTextQ > 0 && truncatedText.trim()) {
        const focusInstruction = focusArea.trim()
          ? `\n\nFOCUS AREA (student's priority): The student specifically wants most questions to be from this part of the material: "${focusArea.trim()}". Generate the majority of questions (at least 70%) focused on this topic/section. The remaining questions may draw from other parts of the material.`
          : "";

        const batchSize = getBatchSize(mode);
        const chunkSizes: number[] = [];
        let remaining = numTextQ;
        while (remaining > 0) {
          const size = Math.min(remaining, batchSize);
          chunkSizes.push(size);
          remaining -= size;
        }

        async function callAI(chunkCount: number): Promise<RawQuestion[]> {
          const systemPrompt = buildSystemPrompt(mode, chunkCount, isMedical);
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_completion_tokens: getTokenBudget(mode, chunkCount),
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Here is the study material:\n\n${truncatedText}${focusInstruction}\n\nGenerate exactly ${chunkCount} MCQ questions as a JSON array.`,
              },
            ],
          });
          const rawOutput = completion.choices[0]?.message?.content ?? "";
          try {
            const jsonMatch = rawOutput.match(/\[[\s\S]*\]/);
            if (!jsonMatch) return [];
            const parsed = JSON.parse(jsonMatch[0]);
            return Array.isArray(parsed) ? (parsed as RawQuestion[]) : [];
          } catch {
            return [];
          }
        }

        async function fetchChunkWithRetry(chunkCount: number): Promise<RawQuestion[]> {
          const collected: RawQuestion[] = [];
          for (let attempt = 0; attempt <= MAX_RETRIES && collected.length < chunkCount; attempt++) {
            const needed = chunkCount - collected.length;
            const results = await callAI(needed);
            const validResults = results.filter(isValidQuestion);
            collected.push(...validResults);
          }
          return collected.slice(0, chunkCount);
        }

        let batchsDone = 0;
        const totalBatches = chunkSizes.length;
        const batchResults = await Promise.all(
          chunkSizes.map(async (chunkCount) => {
            const result = await fetchChunkWithRetry(chunkCount);
            batchsDone++;
            if (jobId && userIdLocal !== null) {
              const batchPercent = Math.round(30 + (batchsDone / totalBatches) * 55);
              emitGenProgress(jobId, userIdLocal, "generating", Math.min(batchPercent, 85));
            }
            return result;
          })
        );
        parsedQuestions = batchResults.flat().slice(0, numTextQ);

        const shortfall = numTextQ - parsedQuestions.length;
        if (shortfall > 0) {
          const topUp = await callAI(shortfall);
          const validTopUp = topUp.filter(isValidQuestion);
          parsedQuestions = parsedQuestions.concat(validTopUp).slice(0, numTextQ);
        }
      }

      /* ── MERGE & INTERLEAVE IMAGE QUESTIONS ─────────────────────── */
      // Distribute image questions evenly across the question set
      type QuestionWithImage = RawQuestion & { imageData?: string };
      const allQuestions: QuestionWithImage[] = [...parsedQuestions];

      if (imageQuestionPool.length > 0) {
        // Insert image questions at evenly spaced intervals
        const totalFinal = parsedQuestions.length + imageQuestionPool.length;
        const step = Math.max(1, Math.floor(parsedQuestions.length / imageQuestionPool.length));
        let insertOffset = step - 1;
        for (const imgQ of imageQuestionPool) {
          const insertIdx = Math.min(insertOffset, allQuestions.length);
          allQuestions.splice(insertIdx, 0, imgQ);
          insertOffset += step + 1;
        }
        // Trim to numQ
        allQuestions.splice(numQ);
        void totalFinal;
      }

      if (allQuestions.length === 0) {
        res.status(500).json({ error: "AI did not generate any questions. Try with more detailed material." });
        return;
      }

      const difficultyLabel = mapModeToEnum(mode);
      const userId = userIdLocal;

      if (jobId && userId !== null) {
        emitGenProgress(jobId, userId, "saving", 90);
      }


      const [exam] = await db
        .insert(examsTable)
        .values({
          title: `AI Quiz — ${new Date().toLocaleDateString()}`,
          durationMinutes: durationMin,
          difficulty: difficultyLabel,
          mode: mode,
          userId,
        })
        .returning({ id: examsTable.id });

      const examId = exam.id;

      const questionRows = allQuestions
        .filter(
          (q) => {
            const optA = stripOptionPrefix(q.options?.A ?? "");
            const optB = stripOptionPrefix(q.options?.B ?? "");
            const optC = stripOptionPrefix(q.options?.C ?? "");
            const optD = stripOptionPrefix(q.options?.D ?? "");
            return (
              q.question_text &&
              optA.length > 2 &&
              optB.length > 2 &&
              optC.length > 2 &&
              optD.length > 2 &&
              ["A", "B", "C", "D"].includes(q.correct_answer)
            );
          }
        )
        .map((q) => ({
          examId,
          text: stripEmbeddedOptions(q.question_text),
          optionA: stripOptionPrefix(q.options.A),
          optionB: stripOptionPrefix(q.options.B),
          optionC: stripOptionPrefix(q.options.C),
          optionD: stripOptionPrefix(q.options.D),
          correctAnswer: q.correct_answer as "A" | "B" | "C" | "D",
          rationale: q.rationale || "",
          imageData: (q as QuestionWithImage).imageData ?? null,
        }));

      if (questionRows.length === 0) {
        res.status(500).json({ error: "AI questions were in an invalid format. Please try again." });
        return;
      }

      await db.insert(questionsTable).values(questionRows);

      if (userId) {
        const keepLimit = 10;
        const allUserExams = await db
          .select({ id: examsTable.id })
          .from(examsTable)
          .where(eq(examsTable.userId, userId))
          .orderBy(desc(examsTable.createdAt));

        if (allUserExams.length > keepLimit) {
          const toDelete = allUserExams.slice(keepLimit);
          await Promise.all(
            toDelete.map(async (old) => {
              await db.delete(examSessionsTable).where(eq(examSessionsTable.examId, old.id));
              await db.delete(questionsTable).where(eq(questionsTable.examId, old.id));
              await db.delete(examsTable).where(eq(examsTable.id, old.id));
            })
          );
        }
      }

      const allWarnings = [...extractionErrors];
      if (questionRows.length < numQ) {
        allWarnings.push(
          `Only ${questionRows.length} of your ${numQ} requested questions could be generated. ` +
          `This can happen when the study material is short or some AI responses were incomplete.`
        );
      }

      if (jobId && userId !== null) {
        closeGenProgress(jobId, userId);
      }

      res.json({
        examId,
        questionCount: questionRows.length,
        duration: durationMin,
        difficulty: mode,
        ...(allWarnings.length > 0 ? { warnings: allWarnings } : {}),
      });
    } catch (err: unknown) {
      if (jobId) {
        const authReqCatch = req as AuthRequest;
        const userIdCatch = authReqCatch.user?.userId;
        if (userIdCatch !== undefined) closeGenProgress(jobId, userIdCatch);
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Failed to generate questions.", detail: message });
    }
  }
);

export default generateQuestionsRouter;
