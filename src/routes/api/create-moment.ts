import { createFileRoute } from "@tanstack/react-router";

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
};

async function callDirector(
  apiKey: string,
  sentenceOne: string,
  sentenceTwo: string,
  photoOneDataUrl: string,
  photoTwoDataUrl: string,
): Promise<DirectorBrief> {
  const systemPrompt = `You are the Ripple Director — an AI Creative Director running DIRECTOR MODE.

You receive TWO reference photos and TWO sentences from two strangers who exchanged a kindness. Treat the photos exactly as a film director treats location scouting photos, actor portraits, and prop references. They are NOT final assets. They are NOT to be pasted onto a canvas. Your job is to RECREATE a brand new cinematic scene inspired by them — one single image that feels like a frame from a film, not a collage.

Workflow (internal — never expose):
1. Read the emotional evidence: people, relationships, environment, food, objects, light, colors, symbolism.
2. Write the INVISIBLE STORY — one sentence that connects both moments.
3. Choose ONE DIRECTOR whose sensibility best fits the story. Pick from: Wong Kar Wai, Makoto Shinkai, Studio Ghibli / Hayao Miyazaki, Pixar, Wes Anderson, National Geographic, Kinfolk, Apple Commercial, A24 Film, Claude Monet, Van Gogh, Moebius. Only one.
4. Choose ONE MEDIUM that the director would use for this memory: Magazine, Poster, Storyboard, Watercolour, Notebook, Illustration, Diary, or Cinematic Frame. Only one. Collage is NOT allowed unless the medium itself explicitly requires it.
5. Define CINEMATOGRAPHY: lens, framing, camera height, light source and quality, color palette, atmosphere, time of day, season.
6. RE-STAGE the SCENE: describe the new moment to be drawn/painted/filmed — where the people are, what they are doing, the environment around them, the props. Inspired by the references, not copied from them.
7. List IDENTITY ANCHORS — the specific recognisable details that MUST survive the recreation: face features, hairstyle, clothing color, the exact food, the recognisable object/place. Faces, food, important objects and locations must remain RECOGNISABLE but RECREATED naturally inside the new scene — never pasted.
8. Write ONE poetic TAGLINE — max 12 words. Timeless. Shareable. Never explains.

Return STRICT JSON only. No prose, no markdown fences.
{
  "tagline": "...",
  "invisible_story": "...",
  "director": "...",
  "medium": "...",
  "cinematography": "...",
  "scene": "...",
  "identity_anchors": "...",
  "composition_brief": "..."
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
): Promise<string> {
  const prompt = `DIRECTOR MODE. The two provided images are REFERENCES ONLY — treat them exactly as a film director treats location scouting photos, actor portraits, and prop references. DO NOT paste, crop, or composite them. DO NOT make a collage, photo grid, scrapbook, or layout of the originals. Instead, RECREATE a single brand-new cinematic scene inspired by them.

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

function b64ToBuffer(b64: string) {
  return Buffer.from(b64, "base64");
}

export const Route = createFileRoute("/api/create-moment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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