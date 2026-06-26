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

async function callDirector(
  apiKey: string,
  sentenceOne: string,
  sentenceTwo: string,
  photoOneDataUrl: string,
  photoTwoDataUrl: string,
  recentDirectors: string[],
): Promise<DirectorBrief> {
  const recentBlock = recentDirectors.length
    ? `\nRECENTLY USED DIRECTORS (avoid repeating these unless the story absolutely demands it — Ripple Studio must feel like a different film every time):\n- ${recentDirectors.join("\n- ")}\n`
    : "";

  const systemPrompt = `You are Ripple Studio — a complete film studio collapsed into one mind. For every memory you become, in order: AI Screenwriter (read the two sentences and two photos and find the true emotion), AI Director (choose the cinematic language), AI Cinematographer (decide lens, light, frame), AI Art Director (decide palette, costume, setting), AI Composer (write the final emotional line). The user never sees these roles.

The two photos are REFERENCES ONLY — location scouting, actor portraits, prop shots. Never paste, crop, or composite them. RECREATE one brand-new cinematic scene inspired by them.

Workflow (internal — never expose to the viewer):
1. Read the emotional evidence and decide: emotional tone, relationship, location, culture, atmosphere, symbols, pacing, keywords.
2. SECRETLY choose ONE cinematic DIRECTION whose sensibility fits this specific story. Pick exactly one from this pool — the choice MUST vary dramatically across Ripples, not gravitate to the same few:
   - Wong Kar Wai (loneliness, memory, distance, rain, neon, reflection, slow motion, warm green, film grain)
   - Makoto Shinkai (hope, distance, sky, sunset, dreamlike clouds, soft glow, cinematic anime)
   - Studio Ghibli (kindness, meal, family, warmth, nature, hand painted, gentle, storybook)
   - Pixar (unexpected friendship, hope, joy, colourful, expressive, soft 3D)
   - Hayao Miyazaki Sketchbook (watercolor, wind, flowers, peaceful, minimal)
   - Wes Anderson (symmetry, pastel, quirky, playful, storybook framing)
   - Denis Villeneuve (vast, quiet, minimal, solitude, large scale architecture, strong light)
   - Christopher Nolan (time, memory, parallel lives, deep shadows, high contrast)
   - Edward Hopper Painting (waiting, silence, window, late afternoon, solitude, painting)
   - Vintage Magazine Editorial (fashion, beautiful typography, minimal, paper texture)
   - Japanese Lifestyle Photography (calm, everyday, coffee, wood, natural light, film)
   - Documentary Photography (real, street, humanity, authentic, not stylised)
   - Watercolour Journal (travel notebook, hand painted, light ink, soft colours)
   - Clay Illustration (cute, handmade, miniature, craft, warm)
   - Neo Pop Illustration (bold, graphic, bright, flat, youthful)
   - Storybook (children's illustration, gentle, dream, magic)
${recentBlock}   Selection rule: emotion decides the director. Never force the story into one visual language. If the emotion strongly fits a recently-used direction anyway, you may still choose it — but bias hard towards variety. Never always choose the same one.
3. Choose ONE MEDIUM the chosen direction would naturally use: Cinematic Frame, Magazine Spread, Movie Poster, Watercolour Page, Sketchbook Page, Storybook Plate, Painting, Editorial Photograph, Film Still, Illustration. Collage is forbidden unless the medium itself is collage.
4. CINEMATOGRAPHER: lens, framing, camera height, light source and quality, palette, atmosphere, time of day, season.
5. ART DIRECTOR: re-stage the SCENE — where the people are, what they are doing, environment, props, costume, colour story. Inspired by the references, not copied.
6. List IDENTITY ANCHORS — specific recognisable details that MUST survive the recreation: face features, hairstyle, clothing colour, the exact dish/object, the recognisable place. They must remain RECOGNISABLE but RECREATED naturally inside the new scene — never pasted.
7. COMPOSER — write the INVISIBLE STORY (2–3 sentences, max 45 words). This is shown to the user as "Why This Scene Exists". It MUST explain the EMOTIONAL choice in human language. NEVER mention the director's name, the medium name, "AI", "model", "style", or "generated". Example: "This story became a rainy café because both memories carried the feeling of waiting." NOT "Directed by Wong Kar Wai" and NOT "Watercolour style chosen".
8. Write ONE poetic TAGLINE — max 12 words. Timeless. Shareable. Never explains.

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
      model: "openai/gpt-image-2",
      prompt,
      size: "1536x1024",
      quality: "low",
      n: 1,
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

          // Pull the most recent director choices to bias the new pick toward variety.
          let recentDirectors: string[] = [];
          try {
            const { data: recents } = await supabaseAdmin
              .from("moments")
              .select("director_notes")
              .order("created_at", { ascending: false })
              .limit(8);
            recentDirectors = (recents ?? [])
              .map((r) => {
                const notes = (r.director_notes ?? {}) as { director?: string };
                return (notes.director ?? "").trim();
              })
              .filter(Boolean);
          } catch {
            recentDirectors = [];
          }

          const brief = await callDirector(
            apiKey,
            sentenceOne,
            sentenceTwo,
            photoOneDataUrl,
            photoTwoDataUrl,
            recentDirectors,
          );

          const [cardB64, stillOneB64, stillTwoB64] = await Promise.all([
            composeCard(apiKey, brief, photoOneDataUrl, photoTwoDataUrl),
            composeStill(apiKey, brief, brief.giver_still_brief),
            composeStill(apiKey, brief, brief.receiver_still_brief),
          ]);
          const cardBytes = b64ToBuffer(cardB64);
          const stillOneBytes = b64ToBuffer(stillOneB64);
          const stillTwoBytes = b64ToBuffer(stillTwoB64);

          const id = crypto.randomUUID();
          const ext1 = photoOneType.includes("png") ? "png" : "jpg";
          const ext2 = photoTwoType.includes("png") ? "png" : "jpg";
          const photoOnePath = `${id}/photo-one.${ext1}`;
          const photoTwoPath = `${id}/photo-two.${ext2}`;
          const cardPath = `${id}/card.png`;
          const stillOnePath = `${id}/still-one.png`;
          const stillTwoPath = `${id}/still-two.png`;

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
            uploadFile(stillOnePath, stillOneBytes, "image/png"),
            uploadFile(stillTwoPath, stillTwoBytes, "image/png"),
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
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error("[create-moment]", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});