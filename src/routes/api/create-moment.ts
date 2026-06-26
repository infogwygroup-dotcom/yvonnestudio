import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

type DirectorBrief = {
  tagline: string;
  invisible_story: string;
  style: string;
  composition_brief: string;
};

async function callDirector(
  apiKey: string,
  sentenceOne: string,
  sentenceTwo: string,
  photoOneDataUrl: string,
  photoTwoDataUrl: string,
): Promise<DirectorBrief> {
  const systemPrompt = `You are an AI Creative Director — part Pixar art director, part National Geographic editor, part Studio Ghibli storyboard artist.

You are looking at TWO photos and TWO sentences left by two strangers who exchanged kindness. Your job is NOT to describe images. Your job is to:
1. Read the emotional evidence: people, environment, food, objects, colors, light, symbolism.
2. Write an INVISIBLE STORY — a single sentence narrative that connects both moments (never shown to the user).
3. Choose, internally, the most beautiful visual language to express this memory (magazine spread, polaroid, scrapbook, recipe card, travel diary, watercolor letter, film strip, picture book, etc). Never expose the style name to the user.
4. Write a COMPOSITION BRIEF — concrete art direction for an editorial image that PRESERVES the original photos as the heroes (real faces, real food, real places — never invented). Specify layout, paper texture, palette, typography mood, handwriting/captions, decorative objects, light, framing. No two briefs should be alike.
5. Write ONE poetic emotional TAGLINE — max 12 words. Timeless. Never explains. Never summarizes. Shareable.

Return STRICT JSON only. No prose, no markdown fences.
{
  "tagline": "...",
  "invisible_story": "...",
  "style": "...",
  "composition_brief": "..."
}`;

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
): Promise<string> {
  const prompt = `Compose a single, museum-quality editorial memory card from the TWO provided reference photos.

ABSOLUTE RULES:
- Treat the two provided photos as SACRED emotional evidence. Preserve the real people, real faces, real food, real environments visible in them. Do NOT invent different faces, food, or places.
- You may crop, gently relight, extend backgrounds, lay them onto designed surfaces, add complementary editorial design around them — but the original subjects remain the heroes.
- Output ONE composed image, square aspect ratio, designed not generated. Feel like Kinfolk, National Geographic, Apple editorial, a Japanese lifestyle book. Not like generic AI art.

INVISIBLE STORY (for your understanding, never render the words): ${brief.invisible_story}

ART DIRECTION: ${brief.composition_brief}

If you include text in the image, the ONLY text allowed is this tagline, set with refined editorial typography that fits the composition: "${brief.tagline}". No other words, no captions, no UI, no logos, no watermarks.`;

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

function b64ToBuffer(b64: string) {
  return Buffer.from(b64, "base64");
}

async function uploadFile(
  bucket: string,
  path: string,
  bytes: Buffer,
  contentType: string,
) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);
}

export const Route = createFileRoute("/api/create-moment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });
          }

          const form = await request.formData();
          const photoOne = form.get("photo_one");
          const photoTwo = form.get("photo_two");
          const sentenceOne = String(form.get("sentence_one") ?? "").trim();
          const sentenceTwo = String(form.get("sentence_two") ?? "").trim();

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
          const photoOneType = photoOne.type || "image/jpeg";
          const photoTwoType = photoTwo.type || "image/jpeg";
          const photoOneDataUrl = `data:${photoOneType};base64,${photoOneBytes.toString("base64")}`;
          const photoTwoDataUrl = `data:${photoTwoType};base64,${photoTwoBytes.toString("base64")}`;

          const brief = await callDirector(
            apiKey,
            sentenceOne,
            sentenceTwo,
            photoOneDataUrl,
            photoTwoDataUrl,
          );

          const cardB64 = await composeCard(
            apiKey,
            brief,
            photoOneDataUrl,
            photoTwoDataUrl,
          );
          const cardBytes = b64ToBuffer(cardB64);

          const id = crypto.randomUUID();
          const ext1 = photoOneType.includes("png") ? "png" : "jpg";
          const ext2 = photoTwoType.includes("png") ? "png" : "jpg";
          const photoOnePath = `${id}/photo-one.${ext1}`;
          const photoTwoPath = `${id}/photo-two.${ext2}`;
          const cardPath = `${id}/card.png`;

          await Promise.all([
            uploadFile("moments", photoOnePath, photoOneBytes, photoOneType),
            uploadFile("moments", photoTwoPath, photoTwoBytes, photoTwoType),
            uploadFile("moments", cardPath, cardBytes, "image/png"),
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
              director_notes: {
                invisible_story: brief.invisible_story,
                style: brief.style,
              },
            })
            .select("id")
            .single();

          if (insertError || !inserted) {
            throw new Error(`DB insert failed: ${insertError?.message ?? "unknown"}`);
          }

          return Response.json({ id: inserted.id });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error("[create-moment]", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});