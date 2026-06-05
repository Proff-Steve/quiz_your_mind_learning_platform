# ExamAI — Learning Platform

## Overview

An AI-powered interactive online examination system. Students upload study materials (PDF, PPT, images, text, audio, YouTube links) to generate MCQs. The platform simulates a real exam environment with timer, question navigator, flagging, autosave, review page, results display, and detailed answer explanations.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (`artifacts/learning-platform`)
- **API framework**: Express 5 (`artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **State**: React Context + Hooks
- **Routing**: Wouter

## Frontend Structure (`artifacts/learning-platform/src/`)

```
src/
├── App.tsx                   # Root app — router + providers
├── index.css                 # Global theme (academic palette)
├── main.tsx                  # Vite entry
├── components/
│   ├── layout/
│   │   ├── Layout.tsx        # Global layout wrapper
│   │   ├── Navbar.tsx        # Top navigation bar
│   │   └── index.ts
│   └── ui/                   # shadcn/ui primitives
├── contexts/
│   └── ThemeContext.tsx      # Light/dark/system theme provider
├── hooks/
│   ├── useLocalStorage.ts    # Persistent local state
│   ├── useTimer.ts           # Countdown timer (for exam)
│   └── useExamState.ts       # Exam navigation/answers/flags
├── pages/
│   └── not-found.tsx         # 404 page
└── types/
    └── index.ts              # Shared TypeScript types
```

## Design Tokens — Academic Palette

| Token        | Light                            | Dark                          |
|--------------|----------------------------------|-------------------------------|
| Background   | Warm Ivory `hsl(40 30% 97%)`    | Deep Navy `hsl(222 38% 9%)`   |
| Foreground   | Dark Navy `hsl(220 30% 14%)`    | Light Grey `hsl(220 20% 88%)` |
| Primary      | Deep Navy `hsl(220 70% 30%)`    | Bright Blue `hsl(220 70% 55%)`|
| Accent       | Warm Gold `hsl(43 85% 52%)`     | Same gold                     |
| Sidebar      | Slate-Blue `hsl(220 35% 18%)`   | Darkest Navy `hsl(222 40% 7%)`|
| Success      | Muted Teal `hsl(168 55% 38%)`   | `hsl(168 55% 45%)`            |
| Destructive  | Muted Rose `hsl(355 65% 50%)`   | `hsl(355 65% 55%)`            |

## Database Schema (`lib/db/src/schema/index.ts`)

Four tables are defined using Drizzle ORM and live in the Replit PostgreSQL database:

| Table | Key Columns |
|-------|-------------|
| `users` | id, name, student_id (unique), level (enum), institution, password_hash, subscription_status (enum: free/active/expired), account_balance (numeric), plan_type, plan_start_date, plan_end_date, last_deducted_date, paystack_customer_code, paystack_subscription_code, timestamps |
| `exams` | id, title, duration_minutes, difficulty (enum: easy/medium/hard), mode (varchar, stores full mode incl. usmle/uccsms), user_id, study_material_ref, created_at |
| `questions` | id, exam_id (FK→exams), text, option_a–d, correct_answer, rationale, created_at |
| `attempts` | id, user_id (FK→users), exam_id (FK→exams), score (numeric), created_at |
| `notices` | id, title (varchar 255), content (text), created_at |

Enums: `subscription_status`, `difficulty`, `level` (100–500).
Foreign keys use `ON DELETE CASCADE`.

## AI Question Generation Engine

Integrated via Replit AI Integrations (OpenAI, no user API key required).

**Route:** `POST /api/generate-questions` (requires auth)

**Flow:**
1. Frontend (`TestPortal.tsx`) sends a `multipart/form-data` request with:
   - `files[]` — uploaded PDFs (extracted via `pdf-parse`), images, audio
   - `pastedText` — text pasted directly by the student
   - `duration`, `numQuestions`, `difficulty` (easy/medium/hard/usmle/uccsms)
2. Server extracts text from all inputs; detects if material is medical/health-related
3. A mode-specific system prompt is built per the specification:
   - **Easy**: Negative/Exception-Based, Absolute Terms, Clinical Logic, etc.
   - **Medium**: Roman numeral combos, SATA, K-type, Assertion-Reason, EMQ, etc.
   - **Hard**: Matrix hybrids, Hidden Assumption, Boundary Traps, Cognitive Bias Exploits, etc.
   - **USMLE**: Best-Fit single-best-answer, clinical vignette style
   - **UCCSMS**: 60% clinical, 30% long stems for 400–600 level students
4. OpenAI (gpt-5.2) generates a JSON array: `{question_text, options: {A,B,C,D}, correct_answer, rationale}`
5. A new exam record is created in the `exams` table; questions bulk-inserted into `questions` table
6. `examId` is returned to the frontend and stored in `localStorage` as `qym_quiz_config.examId`
7. `ExamArea.tsx` reads `examId` from `localStorage` (dynamic, not hardcoded)

**Libraries added to `@workspace/api-server`:** `multer`, `pdf-parse`, `openai`, `sharp`, `@workspace/integrations-openai-ai-server`

## Medical Image Processing Pipeline

The system only uses micrographic (histology/pathology) and radiological (X-ray, CT, MRI, ultrasound) images that are **explicitly present** in uploaded materials. No external images or prior knowledge outside the uploaded content is used.

**Flow (per image in the uploaded DOCX/PPTX/direct image file):**

1. **Classification** (`analyzeMedicalImage`): GPT-4o vision inspects each extracted image and returns a JSON response indicating:
   - `isMedical`: whether the image is histology/pathology or radiology
   - `imageType`: one of `histology`, `pathology`, `radiology_xray`, `radiology_ct`, `radiology_mri`, `radiology_ultrasound`, or `not_medical`
   - `existingAnnotations`: bounding boxes (as % of image dimensions) of any existing labels, text, or arrows that could give answers away
   - `keyStructures`: up to 4 structures with approximate positions and educational descriptions

2. **Non-medical rejection**: If `isMedical` is false, the image is silently skipped — no questions are generated from it.

3. **Preprocessing** (`preprocessMedicalImage` using `sharp`):
   - **Contrast enhancement**: `sharp.normalize()` stretches the histogram; radiology images get an additional `linear(1.25, -20)` boost
   - **Label/annotation covering**: An SVG overlay with black semi-transparent rectangles is composited over the positions of existing labels/arrows to prevent answer giveaways
   - **Arrow annotation**: A second SVG overlay with numbered red circle-and-arrow markers is composited onto the image, each pointing to a key structure

4. **Question generation** (`generateImageQuestions`): GPT-4o (high-detail) is given the preprocessed image and a prompt that:
   - Identifies the image type (e.g., "histological micrograph", "CT scan")
   - Lists the structures each arrow points to
   - Requires every question to explicitly reference an arrow number (e.g., "The structure indicated by Arrow 1…")
   - Generates targeted MCQs about structure identity, function, or pathological significance

**SVG arrow design:** Each arrow has a red circle label (numbered 1–4) offset from the structure, with a red arrowhead pointing to the target. For structures in the left/top half the label is offset upper-left; for right/bottom half it offsets lower-right, always staying within image bounds.

**Env vars (auto-provisioned):** `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

## Load My Account (Payment Renewal)

Lets existing users top up their expired account via MoMo to reactivate access.

**Page:** `/load-account` — plan selector (GH₵ 12/week, GH₵ 48/month), network dropdown (MTN/Vodafone/AirtelTigo), MoMo phone field, live summary, Continue button that initiates charge and polls for confirmation.

**Routes:**
- `POST /api/paystack/renew-charge` — authenticated; initiates MoMo charge (1200 or 4800 pesewas) using the user's email derived from studentId
- `POST /api/paystack/confirm-renewal` — authenticated; verifies charge via Paystack and resets user's balance, plan, planStartDate, planEndDate, subscriptionStatus to "active"
- `GET /api/paystack/check-charge/:reference` — (existing) polls charge status for both registration and renewal

**Dashboard changes:**
- "Load My Account" button always visible top-right; primary CTA when expired, muted when active
- When `subscriptionStatus === "expired"`: Test Yourself, Practice Past Questions, and Recent Activity sections show lock overlay with blur; Notice Board injects an "Account Expired" system notice
- On successful renewal: `refetch()` updates user context, redirects to `/dashboard` with success toast

## Notice Board

Admins can post announcements visible to all authenticated students on their dashboards.

**Routes:**
- `POST /api/admin/notices` — creates a new notice; requires `x-admin-secret` header matching `ADMIN_SECRET` env var
- `GET /api/notices` — returns notices (newest first, max 20); requires JWT auth

**Admin page:** `/admin/notices` — password-protected form (secret stored in `localStorage`); no user account needed.

**Dashboard:** Notice Board card appears in the top-right column next to the Welcome Card; fetches `GET /api/notices` on mount and shows a scrollable list with notice count badge.

**Secret:** `ADMIN_SECRET` (Replit secret — required for posting notices)

## Chat for Support

A floating chat widget appears in the bottom-right corner of all pages **except** `/exam-area` and `/get-ready` (exam screens). Only shown to logged-in users.

**DB Tables:**
- `support_chats` — one per user; tracks status (open/closed) and lastMessageAt
- `support_messages` — individual messages; senderRole is "user" or "admin"; supports text, images, documents, and voice (stored as base64 data URIs)

**User-facing routes:**
- `GET /api/chat/messages` — returns (or creates) the user's support chat and its messages; requires JWT auth
- `POST /api/chat/message` — sends a message with optional file attachment (multipart/form-data); requires JWT auth

**Admin routes** (all require `x-admin-secret` header):
- `GET /api/admin/chat/conversations` — list all conversations with user info, ordered by last message
- `GET /api/admin/chat/conversations/:chatId/messages` — fetch messages in a conversation
- `POST /api/admin/chat/conversations/:chatId/reply` — admin replies (text or file)
- `PATCH /api/admin/chat/conversations/:chatId/status` — toggle open/closed

**Admin panel:** New "Chat" tab added to `/admin/notices`. Shows a list of all conversations; clicking one opens a full message thread with reply box, voice recording, file attachment, and open/closed status toggle.

**Polling:** Both user widget and admin panel poll for new messages every 6–8 seconds. Unread badge on the floating button shows count of new messages received while the widget is closed.

**File support:** Images (preview), documents (download link), voice/audio recordings (play/pause button). All stored as base64 data URIs in the DB.

## Registration (Free 24-Hour Trial)

Registration is now free. Users register and immediately get 24 hours of full access.

**Flow:**
1. Student fills the registration form (name, student ID, level, institution, country, password) and clicks "Register — Get 24 Hours Free"
2. Frontend POSTs directly to `POST /api/auth/register`
3. Backend creates the user with `subscriptionStatus: active` and `planEndDate` set to 24 hours from now
4. JWT is returned and the student is redirected to `/dashboard`
5. After 24 hours, the balance scheduler marks the account as `expired` — all sections lock except "Activate My Account"

**No payment at registration.** First payment happens when the user clicks "Activate My Account" on the dashboard.

## Paystack Subscription Gate (Post-Trial Activation)

After the 24-hour trial expires, users must activate via Paystack to continue.

**Plans (passed to Paystack on first payment):**
- Ghana users, 7 days (weekly): `PLN_0qbjvklw8g5dbdw` (GHS 12)
- Ghana users, 28 days (monthly): `PLN_ldv3702jkw3eajd` (GHS 48)
- Non-Ghana users, 7 days (weekly): `PLN_w4wcatrkx676tqc` ($4.00)
- Non-Ghana users, 28 days (monthly): `PLN_dgoizxeg0sll10e` ($15.00)

**Activation flow (Ghana — MoMo):**
1. User clicks "Activate My Account" → taken to `/load-account`
2. Selects plan (weekly/monthly), MoMo network, enters phone number
3. Frontend calls `POST /api/paystack/renew-charge` — backend initiates MoMo charge with appropriate plan code
4. User approves MoMo prompt on phone; frontend polls `GET /api/paystack/check-charge/:ref`
5. On success, calls `POST /api/paystack/confirm-renewal` — account set to active for plan duration

**Activation flow (Non-Ghana — Card/Bank):**
1. User clicks "Activate My Account" → taken to `/load-account` (auto-redirects to card form)
2. Selects plan, clicks "Pay" — Paystack inline popup opens
3. On success, calls `POST /api/paystack/confirm-renewal` — account activated

**Secrets required:** `PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`
**Public key is served safely via** `GET /api/config` (never hardcoded in frontend)

## Theory Exams

AI-powered written-answer theory examination system. Accessible via the "Theory Exams" card in the "Start Learning" section of the dashboard.

**Full Flow:**
1. `/theory-portal` — Upload study material (PDF, DOCX, PPTX, text), configure exam (duration, 1–10 questions, difficulty mode), click "Generate Questions"
2. `/theory-get-ready` — Pre-exam summary showing question count, duration, max score, mode, and projected timeframe
3. `/theory-exam-area` — Active exam: textarea per question, sticky countdown timer, Pause/Resume button (timer stops, inputs go read-only), Submit button → goes to summary
4. `/theory-summary` — Review all questions + typed answers before final submission; timer continues; "Go Back To Questions" returns to exam area with answers preserved
5. AI Scoring (`POST /api/theory-exam/score`) — AI semantically scores each answer 0–5 marks; returns per-question grade, correct answer, and feedback
6. `/theory-results` — Score ring showing %, total marks, pass/fail (≥60%), per-question breakdown
7. `/theory-analysis` — Full detailed analysis: question, user answer, correct answer, AI feedback, star marks; "Download PDF" uses browser print

**Difficulty Modes:**
- Easy: Define, List, Describe, Explain, Discuss, Compare action-verb questions
- Medium: Application/analysis questions; assertion-reason, compare/contrast, ranking formats
- Hard: Synthesis & evaluation; multi-concept application; critical thinking
- Clinical Case: One full case scenario at top; all questions relate to the case (diagnosis, management, pathophysiology)
- Real Life Problem Based: One real-world scenario; questions test problem-solving, resource allocation, decision-making

**Anti-cheating:** Copy disabled on question text; paste/copy/cut disabled in answer textareas; inputs go read-only when paused.

**DB Tables:** `theory_exams`, `theory_questions`, `theory_attempts`

**Backend Routes:** `POST /api/generate-theory-questions`, `POST /api/theory-exam/score`

**Storage Keys:** `qym_theory_config`, `qym_theory_answers`, `qym_theory_timer`, `qym_theory_result`

## Make Study Notes

An AI-powered three-pane study notes workspace. Accessible via the "Make Study Notes" card in the "Start Learning" section of the dashboard.

**Page:** `/study-notes`

**Three-pane layout** (powered by `react-resizable-panels`):
- **Left Pane (60%):** Full TipTap rich-text editor with complete toolbar — headings (H1–H3), bold, italic, underline, strikethrough, text align, bullet/ordered lists, blockquote, highlight, link, clear formatting, and Export PDF
- **Top-Right Pane:** File upload zone — drag & drop or click to browse; supports 40+ formats; YouTube URL input field
- **Bottom-Right Pane:** Natural language instructions textarea, Wikipedia enrichment toggle, and "Generate Notes" button

**Supported file formats:**
- Text/Docs: pdf, txt, md, docx, csv, pptx, epub
- Audio: aac, aif, aifc, aiff, amr, au, m4a, mid, mp3, ogg, opus, ra, ram, snd, wav, wma, cda (transcribed via Whisper)
- Video: 3g2, 3gp, avi, mp4, mpeg, mov, webm (audio transcribed via Whisper)
- Images: avif, bmp, gif, ico, jp2, png, webp, tif, tiff, heic, heif, jpeg, jpg, jpe (OCR via GPT-4o vision)
- YouTube links (transcript via youtube-transcript)

**Backend route:** `POST /api/study-notes/generate` (requires auth, multipart/form-data)
- `files[]`: any of the 40+ supported formats
- `youtubeUrl`: optional YouTube link
- `prompt`: natural language instruction
- `enrichWithWikipedia`: boolean — pulls summaries + images from Wikipedia API

**Pipelines:**
1. Text docs extracted via pdf-parse / mammoth / jszip
2. Images described/OCR'd via GPT-4o vision
3. Audio/video transcribed via OpenAI Whisper
4. Wikipedia API queried when toggle is on or no files are uploaded; AI extracts topic keywords first
5. GPT-4o generates structured HTML notes injected directly into TipTap editor
6. Wikipedia references listed at end of notes when Wikipedia is used

**Export:** Toolbar "Export PDF" opens a print-ready window with styled HTML for browser print/save as PDF

**TipTap packages added to `@workspace/learning-platform`:** `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-text-align`, `@tiptap/extension-underline`, `@tiptap/extension-color`, `@tiptap/extension-text-style`, `@tiptap/extension-highlight`, `@tiptap/extension-typography`

## Entertainment / Games

A "Take a Break" section on the dashboard provides access to an entertainment hub with games.

**Dashboard:** "Take a Break" section appears below "Start Learning" with an "Entertainment" button that navigates to `/entertainment`.

**Entertainment Hub (`/entertainment`):** Lists available games — Align It: Three Men's Morris and Chess.

### Align It: Three Men's Morris (`/games/align-it` → `/games/align-it/play`)
- **Setup page:** Select board type (3 Men's with diagonals / Uc Tas without diagonals) and difficulty (Easy / Medium / Hard). UI matches the provided screenshots — teal-to-beige gradient, board icon cards, gauge icons.
- **Player modes:** Single Player (vs computer) or Play with Friends (multiplayer via code).
- **Multiplayer:** Player 1 generates a 6-character code, shares it (copy or Share API), Player 2 enters the code to join. Both players' full names are displayed from their accounts.
- **Game logic:** Standard Three Men's Morris — Phase 1 (place 3 pieces), Phase 2 (slide to adjacent squares). Win by aligning 3 pieces. Computer AI has three difficulty levels. Multiplayer uses polling (every 2s) against the backend session store.

### Chess (`/games/chess` → `/games/chess/play`)
- **Same setup/multiplayer flow** as Align It.
- **Full chess board** rendered with Unicode piece symbols, coordinate labels, wood-style brown/cream color scheme.
- **Legal move highlighting** — green circles on valid destinations; ring highlight on capturable pieces.
- **AI opponent** with Easy/Medium/Hard levels (random, score-weighted, minimax-inspired).
- **Pawn promotion** dialog (Q/R/B/N).
- **Check/stalemate detection**, castling, en passant.

**Backend Game Sessions API (in-memory):**
- `POST /api/games/sessions` — creates a session, returns 6-char code
- `POST /api/games/sessions/join` — joins a session with code; starts game
- `GET /api/games/sessions/:code` — polls current game state
- `POST /api/games/sessions/:code/move` — submits a move (placement or slide for Morris; from/to for Chess)
- Sessions expire after 3 hours and are cleaned up on next session creation.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/learning-platform run dev` — run frontend locally

## Shared Types (`src/types/index.ts`)

- `UploadedFile` — uploaded study material metadata
- `MCQQuestion` — question with options, correct answer, explanation
- `Exam` — collection of questions with duration
- `ExamAttempt` — user session with answers
- `ExamResult` — scored result with per-question breakdown

See the `pnpm-workspace` skill for workspace structure and TypeScript setup.
