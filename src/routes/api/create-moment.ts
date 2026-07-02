import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import {
  DIRECTOR_NAMES,
  directorsForRarity,
  narrativesForRarity,
  renderDirectorList,
  renderNarrativeList,
  weightedPick,
  type Tier,
} from "@/lib/v2/catalog";
import { mergedPresentationPool, renderV3FormatHints } from "@/lib/v3/formats";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

type DirectorBrief = {
  tagline: string;
  invisible_story: string;
  director: string;
  medium: string;
  cinematography: string;
  scene: string;
  identity_anchors: string;
  composition_brief: string;
  genre: string;
  mood: string;
  visual_language: string[];
  format: string;
  narrative_device: string;
  presentation_format: string;
  giver_location: string;
  giver_merchant: string;
  giver_meal: string;
  giver_caption: string;
  giver_still_brief: string;
  receiver_location: string;
  receiver_merchant: string;
  receiver_meal: string;
  receiver_caption: string;
  receiver_still_brief: string;
};

type Rarity = Tier;

// Presentation formats — gated by rarity. Common/Rare stay grounded; Epic/Legendary unlock experimental editions.
const PRESENTATION_BY_RARITY: Record<Rarity, string[]> = {
  common: [
    "Cinema Poster",
    "Journal Page",
    "Magazine Cover",
    "Photo Print",
    "Postcard",
    "Photo Strip",
    "Polaroid Frame",
    "Café Receipt",
    "Ticket Stub",
    "Handwritten Note",
    "Bookmark",
  ],
  rare: ["Cinema Poster", "Magazine Cover", "Journal Page", "Travel Journal", "Notebook", "Old Letter"],
  epic: ["Magazine Cover", "Museum Exhibition Card", "Film Strip", "Movie Ticket", "Newspaper Front Page", "Storyboard", "Book Chapter"],
  legendary: ["Vinyl Record Cover", "Museum Exhibition Card", "Comic Page", "Scrapbook", "Memory Album", "Passport Page", "Blueprint", "Gallery Print"],
};

// Canonical director pool — edit in src/lib/v2/catalog.ts
const DIRECTOR_POOL = DIRECTOR_NAMES;

function normaliseDirectorName(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchPoolDirector(raw: string): string | null {
  const n = normaliseDirectorName(raw);
  if (!n) return null;
  for (const d of DIRECTOR_POOL) {
    const dn = normaliseDirectorName(d);
    if (n === dn || n.includes(dn) || dn.includes(n)) return d;
  }
  return null;
}

function rollRarity(): Rarity {
  const r = Math.random();
  if (r < 0.01) return "legendary";
  if (r < 0.05) return "epic";
  if (r < 0.15) return "rare";
  return "common";
}

function rarityDirective(rarity: Rarity): string {
  switch (rarity) {
    case "legendary":
      return `RARITY: LEGENDARY (≈1% of all Ripples). You have full freedom to ABANDON the default cinematic-frame medium. Ask yourself: "If this story deserved its own medium, what would it become?" Pick ONE alternate FORMAT that genuinely fits the emotion — examples: a vintage cinema poster, an A24-style poster, a movie ticket, a long vertical scroll, an ancient handwritten letter, an old newspaper front page, a vinyl album cover, a book cover, a museum exhibition catalogue card, a passport stamp page, a film storyboard page, a hand-painted watercolor diary page, a black & white documentary print, a 35mm contact sheet, a large-format photographic print, an old postcard, an architectural blueprint, a screenplay cover, a photo strip, a hand-drawn memory map. Set "format" to that exact choice. The user must feel: "I've never seen a Ripple like this before." Creativity over decoration.`;
    case "epic":
      return `RARITY: EPIC (≈4%). Break layout conventions. Pick ONE distinct presentational FORMAT — magazine spread, luxury hardcover book page, vintage travel journal, museum exhibition card, minimal Japanese poster, art gallery wall plate, poetic letter, premium scrapbook page. Set "format" to that choice. The entire presentation should feel different from the default frame.`;
    case "rare":
      return `RARITY: RARE (≈10%). Stay within the cinematic frame, but introduce one unexpected artistic treatment — a striking camera angle, a symbolic composition, exceptional lighting, more emotional staging, or refined typography. Leave "format" as "Cinematic Frame".`;
    default:
      return `RARITY: COMMON. A beautiful standard edition, but the format should still surprise. Choose from: Cinema Poster, Journal Page, Magazine Cover, Photo Print, Postcard, Photo Strip, Polaroid Frame, Café Receipt, Ticket Stub, Handwritten Note, Bookmark. Leave "format" as "Cinematic Frame" and set "presentation_format" to one grounded, collectible format that frames the emotion without overpowering it.`;
  }
}

function presentationDirective(rarity: Rarity, version: "v2" | "v3"): string {
  const pool =
    version === "v3"
      ? mergedPresentationPool(rarity, PRESENTATION_BY_RARITY)
      : PRESENTATION_BY_RARITY[rarity];
  const v3Hint =
    version === "v3"
      ? `\n\nSome of these formats are physical collectibles — think of the memory as a real object someone would keep. Reference for the new editions:\n${renderV3FormatHints(rarity)}\n\nAsk yourself: "What is the most beautiful real-world medium to preserve THIS memory?" Choose the one that best matches the story's emotion, not the most decorative one. The same story should be able to become a different format on another day — avoid picking the most obvious format twice in a row.`
      : "";
  return `PRESENTATION FORMAT — choose ONE collectible edition format for THIS Ripple from this rarity-gated pool: ${pool.join(" · ")}. Set "presentation_format" to that exact label. The presentation IS part of the artwork — pick the one that best frames the emotion, not the most decorative one.${v3Hint}`;
}

async function callDirector(
  apiKey: string,
  sentenceOne: string,
  sentenceTwo: string,
  photoOneDataUrl: string,
  photoTwoDataUrl: string,
  recentDirectors: string[],
  unexploredDirectors: string[],
  rarity: Rarity,
  version: "v2" | "v3" = "v2",
): Promise<DirectorBrief> {
  const recentBlock = recentDirectors.length
    ? `\nRECENTLY USED DIRECTORS (avoid repeating these unless the story absolutely demands it — Ripple Studio must feel like a different film every time):\n- ${recentDirectors.join("\n- ")}\n`
    : "";

  const explorationBlock = unexploredDirectors.length
    ? `\nSTYLE EXPLORATION — UNEXPLORED DIRECTORS (this collector has NEVER received a Ripple in any of these sensibilities; STRONGLY prefer one of them so the collection keeps surprising them, unless a different director is an obviously better emotional fit):\n- ${unexploredDirectors.join("\n- ")}\n`
    : `\nSTYLE EXPLORATION: this collector has already received at least one Ripple from every director in the pool — bias toward the LEAST recently used direction instead.\n`;

  const availableDirectors = directorsForRarity(rarity);
  const availableNarratives = narrativesForRarity(rarity);
  const directorListBlock = renderDirectorList(availableDirectors);
  const narrativeListRendered = renderNarrativeList(availableNarratives);

  const systemPrompt = `You are Ripple Studio — a complete film studio collapsed into one mind. For every memory you become, in order: AI Screenwriter (read the two sentences and two photos and find the true emotion), AI Director (choose the cinematic language), AI Cinematographer (decide lens, light, frame), AI Art Director (decide palette, costume, setting), AI Composer (write the final emotional line). The user never sees these roles.

The two photos are REFERENCES ONLY — location scouting, actor portraits, prop shots. Never paste, crop, or composite them. RECREATE one brand-new cinematic scene inspired by them.

Workflow (internal — never expose to the viewer):
1. Read the emotional evidence and decide: emotional tone, relationship, location, culture, atmosphere, symbols, pacing, keywords.
2. SECRETLY choose ONE cinematic DIRECTION whose sensibility fits this specific story. Pick exactly one from this pool — the choice MUST vary dramatically across Ripples, not gravitate to the same few:
${directorListBlock}
${recentBlock}${explorationBlock}   Selection rule: emotion decides the director, but the collector's archive matters. Among directors that fit the emotion, prefer one from the UNEXPLORED list above, then options marked with more ★ stars (curator priority). Only fall back to a recently-used director when no unexplored option remotely fits the story. Never always choose the same one.
3. Choose ONE MEDIUM the chosen direction would naturally use: Cinematic Frame, Magazine Spread, Movie Poster, Watercolour Page, Sketchbook Page, Storybook Plate, Painting, Editorial Photograph, Film Still, Illustration. Collage is forbidden unless the medium itself is collage.
4. CINEMATOGRAPHER: lens, framing, camera height, light source and quality, palette, atmosphere, time of day, season.
5. ART DIRECTOR: re-stage the SCENE — where the people are, what they are doing, environment, props, costume, colour story. Inspired by the references, not copied.
6. List IDENTITY ANCHORS — specific recognisable details that MUST survive the recreation: face features, hairstyle, clothing colour, the exact dish/object, the recognisable place. They must remain RECOGNISABLE but RECREATED naturally inside the new scene — never pasted.
7. COMPOSER — write the INVISIBLE STORY (1–2 sentences, max 38 words). This is shown to the user as "Why This Scene Exists" and must read like a DIRECTOR'S NOTE — a quiet, poetic observation about the emotion, not an explanation. Do NOT begin with "This story became…", "The AI chose…", "We picked…", "Because…". Do NOT name the director, medium, style, AI, model, or anything generated. Let the reader feel it without being told. Good examples: "Every beginning happens before the world wakes." · "Before every journey there is a silent decision nobody else sees." · "Some kindnesses arrive at the table dressed as ordinary food." Bad: "This story became a rainy café because both memories carried the feeling of waiting."
8. Write ONE poetic TAGLINE — max 12 words. Timeless. Shareable. Never explains.

${rarityDirective(rarity)}

${presentationDirective(rarity, version)}

NARRATIVE DEVICE — choose ONE storytelling angle that explains WHY this scene exists. Pick from (★ = curator-preferred): ${narrativeListRendered}. Set "narrative_device" to that exact label. This replaces generic genre tagging.

9.5. Also generate a GENRE (one of: Coming of Age, Romance, Slice of Life, Quiet Drama, Hope, Homecoming, Friendship, Journey, Family, Healing, Dream, Documentary, Road Movie, Mystery, Urban Poetry, Memory — or another single short label that fits better). Generate one MOOD (one short adjective: Hopeful, Lonely, Warm, Peaceful, Bittersweet, Joyful, Nostalgic, Dreamlike, Reflective, Playful, Melancholic, Quiet, etc.). Generate 3–5 short VISUAL_LANGUAGE tags (e.g. "Warm Film Grain", "Blue Hour", "Rain Reflection", "Golden Hour", "Soft Dust", "Minimal Japanese", "Painterly", "Handmade Paper", "Kodak Portra", "Leica Street", "Magazine Editorial", "Neo Noir", "Dreamlike", "Oil Painting", "Vintage Travel", "Watercolor Journal", "Handwritten Memory" — or invent new ones that fit). These appear in a small archival "Ripple Identity" caption — keep each tag 1–3 words, title case.

9. For EACH of the two people (giver = person A, receiver = person B), extract or gently infer from their photo and sentence:
   - location (one short place phrase, e.g. "Sydney", "Tokyo at dusk", "a small kitchen"). If truly unknown, write a poetic place like "somewhere quiet".
   - merchant (a venue/brand if visible; otherwise a soft poetic placeholder like "a corner table", "her apartment kitchen"). Never invent a real brand name that isn't visible.
   - meal (the dish/object in the photo, or the central object if no food).
   - caption: ONE short editorial line (max 14 words) that frames their gesture. Never quote their sentence back.
   - still_brief: a short cinematic still description (max 40 words) — a single film-still frame INSPIRED by their photo but never copying it. Instead of a selfie → a figure by the window. Instead of food → that dish on a warm wooden table. Instead of a place → that place at golden hour. No people-recognition specifics; just mood, framing, light, palette. Match the chosen DIRECTOR's sensibility.

Return STRICT JSON only. No prose, no markdown fences.
{
  "tagline": "...",
  "invisible_story": "...",
  "director": "...",
  "medium": "...",
  "cinematography": "...",
  "scene": "...",
  "identity_anchors": "...",
  "composition_brief": "...",
  "genre": "...",
  "mood": "...",
  "visual_language": ["...", "..."],
  "format": "...",
  "narrative_device": "...",
  "presentation_format": "...",
  "giver_location": "...",
  "giver_merchant": "...",
  "giver_meal": "...",
  "giver_caption": "...",
  "giver_still_brief": "...",
  "receiver_location": "...",
  "receiver_merchant": "...",
  "receiver_meal": "...",
  "receiver_caption": "...",
  "receiver_still_brief": "..."
}

In "composition_brief", synthesise director + medium + cinematography + scene into a single concrete art-direction paragraph the image model can execute.`;

  const userBlocks = [
    { type: "text" as const, text: `Sentence from person A: "${sentenceOne}"\nSentence from person B: "${sentenceTwo}"\n\nNow read the two photos as emotional evidence and direct the memory.` },
    { type: "image_url" as const, image_url: { url: photoOneDataUrl } },
    { type: "image_url" as const, image_url: { url: photoTwoDataUrl } },
  ];

  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userBlocks },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Director call failed (${res.status}): ${text.slice(0, 400)}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "";
  const cleaned = content.replace(/^```json\s*|\s*```$/g, "").trim();
  const parsed = JSON.parse(cleaned) as DirectorBrief;
  return parsed;
}

async function composeCard(
  apiKey: string,
  brief: DirectorBrief,
  photoOneDataUrl: string,
  photoTwoDataUrl: string,
  rarity: Rarity,
): Promise<string> {
  const formatLine = brief.format && brief.format.trim() && brief.format.toLowerCase() !== "cinematic frame"
    ? `\nFORMAT (this Ripple is a ${rarity.toUpperCase()} edition — render it AS this format, not as a default cinematic still): ${brief.format}. Commit fully to this format's visual language, layout conventions, typography, paper / surface texture, and proportions.`
    : "";
  const prompt = `DIRECTOR MODE. The two provided images are REFERENCES ONLY — treat them exactly as a film director treats location scouting photos, actor portraits, and prop references. DO NOT paste, crop, or composite them. DO NOT make a collage, photo grid, scrapbook, or layout of the originals. Instead, RECREATE a single brand-new cinematic scene inspired by them.${formatLine}

Output ONE image, square aspect ratio. It should feel like a single frame from a film, magazine illustration, painting, or storyboard — not a photo composition.

DIRECTOR (sensibility to channel): ${brief.director}
MEDIUM: ${brief.medium}
CINEMATOGRAPHY: ${brief.cinematography}
SCENE TO RE-STAGE: ${brief.scene}

INVISIBLE STORY (for your understanding, never render the words): ${brief.invisible_story}

IDENTITY TO PRESERVE (must remain recognisable, but naturally RECREATED inside the new scene — never pasted from the references): ${brief.identity_anchors}

FULL ART DIRECTION: ${brief.composition_brief}

Hard rules:
- No collage, no photo grid, no polaroid stack, no torn-paper layout, unless the chosen MEDIUM explicitly is collage.
- Faces, food, key objects and locations from the references must be recognisable, but rendered in the chosen medium and director's visual language — drawn, painted, or re-filmed, not pasted.
- One unified scene, one consistent light source, one coherent visual world.
- If you include any text in the image, the ONLY allowed text is this tagline, integrated with refined typography: "${brief.tagline}". No other words, captions, UI, logos, or watermarks.`;

  const res = await fetch(`${GATEWAY_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: photoOneDataUrl } },
            { type: "image_url", image_url: { url: photoTwoDataUrl } },
          ],
        },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Image compose failed (${res.status}): ${text.slice(0, 400)}`);
  }

  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image compose returned no image data");
  return b64;
}

async function composeStill(
  apiKey: string,
  brief: DirectorBrief,
  stillBrief: string,
): Promise<string> {
  const prompt = `One cinematic still frame. Landscape 3:2. ${brief.director} sensibility, ${brief.medium} medium. ${brief.cinematography}.

SCENE: ${stillBrief}

Rules:
- No text, no captions, no UI, no watermark, no borders, no logos.
- No collage, no split-frame, no polaroid edge — one unified cinematic frame only.
- Quiet, editorial, painterly. Like a single still pulled from a short film.
- Soft natural light, intimate atmosphere, generous negative space.`;

  const res = await fetch(`${GATEWAY_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Still compose failed (${res.status}): ${text.slice(0, 400)}`);
  }

  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("Still compose returned no image data");
  return b64;
}

function b64ToBuffer(b64: string) {
  return Buffer.from(b64, "base64");
}

// Detect real image type from magic bytes. Returns normalised MIME or null.
function detectImageMime(bytes: Buffer): "image/jpeg" | "image/png" | "image/webp" | "image/gif" | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return "image/webp";
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  ) return "image/gif";
  return null;
}

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

function verifyTicket(secret: string, ticket: string, ip: string): boolean {
  const [expStr, sig] = ticket.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = createHmac("sha256", secret).update(`${ip}.${exp}`).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

export const Route = createFileRoute("/api/create-moment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            console.error("[create-moment] Missing LOVABLE_API_KEY");
            return Response.json({ error: "Service unavailable" }, { status: 503 });
          }

          // Require a signed ticket obtained from /api/public/moment-ticket.
          // The ticket endpoint is per-IP rate-limited; this prevents unauthenticated
          // scripts from directly hammering the expensive AI pipeline.
          const ticketSecret = process.env.MOMENT_TICKET_SECRET;
          if (!ticketSecret) {
            console.error("[create-moment] Missing MOMENT_TICKET_SECRET");
            return Response.json({ error: "Service unavailable" }, { status: 503 });
          }
          const ticket = request.headers.get("x-moment-ticket") ?? "";
          const ip = clientIp(request);
          if (!verifyTicket(ticketSecret, ticket, ip)) {
            return Response.json({ error: "Invalid or expired request token." }, { status: 401 });
          }

          const form = await request.formData();
          const photoOne = form.get("photo_one");
          const photoTwo = form.get("photo_two");
          const sentenceOne = String(form.get("sentence_one") ?? "").trim();
          const sentenceTwo = String(form.get("sentence_two") ?? "").trim();
          const version: "v2" | "v3" =
            String(form.get("version") ?? "").toLowerCase() === "v3" ? "v3" : "v2";

          if (!(photoOne instanceof File) || !(photoTwo instanceof File)) {
            return Response.json({ error: "Both photos are required." }, { status: 400 });
          }
          if (!sentenceOne || !sentenceTwo) {
            return Response.json({ error: "Both sentences are required." }, { status: 400 });
          }
          if (sentenceOne.length > 240 || sentenceTwo.length > 240) {
            return Response.json({ error: "Sentences are too long." }, { status: 400 });
          }
          const MAX_BYTES = 8 * 1024 * 1024;
          if (photoOne.size > MAX_BYTES || photoTwo.size > MAX_BYTES) {
            return Response.json({ error: "Photos must be under 8MB each." }, { status: 400 });
          }

          const photoOneBytes = Buffer.from(await photoOne.arrayBuffer());
          const photoTwoBytes = Buffer.from(await photoTwo.arrayBuffer());
          // NEVER trust client-supplied MIME. Verify via magic bytes.
          const photoOneType = detectImageMime(photoOneBytes);
          const photoTwoType = detectImageMime(photoTwoBytes);
          if (!photoOneType || !photoTwoType) {
            return Response.json(
              { error: "Photos must be JPEG, PNG, WebP, or GIF images." },
              { status: 400 },
            );
          }
          const photoOneDataUrl = `data:${photoOneType};base64,${photoOneBytes.toString("base64")}`;
          const photoTwoDataUrl = `data:${photoTwoType};base64,${photoTwoBytes.toString("base64")}`;

          // Pull the most recent director choices to bias the new pick toward variety.
          let recentDirectors: string[] = [];
          let usedDirectorSet = new Set<string>();
          try {
            const { data: recents } = await supabaseAdmin
              .from("moments")
              .select("director_notes")
              .order("created_at", { ascending: false })
              .limit(200);
            recentDirectors = (recents ?? [])
              .map((r) => {
                const notes = (r.director_notes ?? {}) as { director?: string };
                return (notes.director ?? "").trim();
              })
              .filter(Boolean);
            for (const raw of recentDirectors) {
              const matched = matchPoolDirector(raw);
              if (matched) usedDirectorSet.add(matched);
            }
            // Keep only the 8 most recent for the "avoid repeating" hint.
            recentDirectors = recentDirectors.slice(0, 8);
          } catch {
            recentDirectors = [];
            usedDirectorSet = new Set<string>();
          }

          const unexploredDirectors = DIRECTOR_POOL.filter((d) => !usedDirectorSet.has(d));

          const rarity: Rarity = rollRarity();

          const brief = await callDirector(
            apiKey,
            sentenceOne,
            sentenceTwo,
            photoOneDataUrl,
            photoTwoDataUrl,
            recentDirectors,
            unexploredDirectors,
            rarity,
            version,
          );

          // Deterministic fallback if the model omits the new V2 fields.
          let narrativeDevice = (brief.narrative_device ?? "").trim();
          {
            const pool = narrativesForRarity(rarity);
            const matched = pool.find(
              (n) => n.label.toLowerCase() === narrativeDevice.toLowerCase(),
            );
            if (matched) {
              narrativeDevice = matched.label;
            } else {
              const seed = (sentenceOne + sentenceTwo).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
              narrativeDevice = weightedPick(pool, seed).label;
            }
          }
          let presentationFormat = (brief.presentation_format ?? "").trim();
          const allowedPresentations =
            version === "v3"
              ? mergedPresentationPool(rarity, PRESENTATION_BY_RARITY)
              : PRESENTATION_BY_RARITY[rarity];
          const normalised = presentationFormat.toLowerCase();
          const matchedPresentation = allowedPresentations.find(
            (p) => p.toLowerCase() === normalised,
          );
          if (!matchedPresentation) {
            const seed = (brief.tagline + rarity).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
            presentationFormat = allowedPresentations[seed % allowedPresentations.length];
          } else {
            presentationFormat = matchedPresentation;
          }

          const safeStill = (b: string) =>
            composeStill(apiKey, brief, b).catch((e) => {
              console.warn("[create-moment] still fallback:", e instanceof Error ? e.message : e);
              return null;
            });
          const [cardB64, stillOneB64, stillTwoB64] = await Promise.all([
            composeCard(apiKey, brief, photoOneDataUrl, photoTwoDataUrl, rarity),
            safeStill(brief.giver_still_brief),
            safeStill(brief.receiver_still_brief),
          ]);
          const cardBytes = b64ToBuffer(cardB64);
          const stillOneBytes = stillOneB64 ? b64ToBuffer(stillOneB64) : null;
          const stillTwoBytes = stillTwoB64 ? b64ToBuffer(stillTwoB64) : null;

          const id = crypto.randomUUID();
          const ext1 = extForMime(photoOneType);
          const ext2 = extForMime(photoTwoType);
          const photoOnePath = `${id}/photo-one.${ext1}`;
          const photoTwoPath = `${id}/photo-two.${ext2}`;
          const cardPath = `${id}/card.png`;
          const stillOnePath = stillOneBytes ? `${id}/still-one.png` : null;
          const stillTwoPath = stillTwoBytes ? `${id}/still-two.png` : null;

          const uploadFile = async (path: string, bytes: Buffer, contentType: string) => {
            const { error } = await supabaseAdmin.storage
              .from("moments")
              .upload(path, bytes, { contentType, upsert: true });
            if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);
          };

          await Promise.all([
            uploadFile(photoOnePath, photoOneBytes, photoOneType),
            uploadFile(photoTwoPath, photoTwoBytes, photoTwoType),
            uploadFile(cardPath, cardBytes, "image/png"),
            stillOnePath && stillOneBytes
              ? uploadFile(stillOnePath, stillOneBytes, "image/png")
              : Promise.resolve(),
            stillTwoPath && stillTwoBytes
              ? uploadFile(stillTwoPath, stillTwoBytes, "image/png")
              : Promise.resolve(),
          ]);

          const { data: inserted, error: insertError } = await supabaseAdmin
            .from("moments")
            .insert({
              id,
              tagline: brief.tagline,
              sentence_one: sentenceOne,
              sentence_two: sentenceTwo,
              photo_one_path: photoOnePath,
              photo_two_path: photoTwoPath,
              card_image_path: cardPath,
              still_one_path: stillOnePath,
              still_two_path: stillTwoPath,
              rarity,
              genre: brief.genre,
              mood: brief.mood,
              visual_language: Array.isArray(brief.visual_language) ? brief.visual_language.slice(0, 6) : [],
              format: brief.format || "Cinematic Frame",
              narrative_device: narrativeDevice,
              presentation_format: presentationFormat,
              director_notes: {
                invisible_story: brief.invisible_story,
                director: brief.director,
                medium: brief.medium,
                cinematography: brief.cinematography,
                scene: brief.scene,
                identity_anchors: brief.identity_anchors,
                giver_location: brief.giver_location,
                giver_merchant: brief.giver_merchant,
                giver_meal: brief.giver_meal,
                giver_caption: brief.giver_caption,
                receiver_location: brief.receiver_location,
                receiver_merchant: brief.receiver_merchant,
                receiver_meal: brief.receiver_meal,
                receiver_caption: brief.receiver_caption,
              },
            })
            .select("id")
            .single();

          if (insertError || !inserted) {
            throw new Error(`DB insert failed: ${insertError?.message ?? "unknown"}`);
          }

          return Response.json({ id: inserted.id });
        } catch (err) {
          // Log the full error server-side, return a generic message to the client
          // to avoid leaking DB / storage / upstream API implementation details.
          console.error("[create-moment]", err);
          return Response.json(
            { error: "We couldn't create your Ripple right now. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});