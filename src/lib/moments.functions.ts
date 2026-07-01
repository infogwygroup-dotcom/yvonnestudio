import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({ id: z.string().uuid() });

export type MomentSummary = {
  id: string;
  tagline: string;
  card_image_url: string;
  created_at: string;
  ripple_number: number | null;
  rarity: "common" | "rare" | "epic" | "legendary";
  genre: string;
  mood: string;
  format: string;
};

export const listMoments = createServerFn({ method: "GET" }).handler(
  async (): Promise<MomentSummary[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("moments")
      .select("id, tagline, card_image_path, created_at, ripple_number, rarity, genre, mood, format")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) return [];
    const paths = rows.map((r) => r.card_image_path).filter(Boolean);
    const { data: signed } = await supabaseAdmin.storage
      .from("moments")
      .createSignedUrls(paths, 60 * 60 * 24 * 7);
    const urlFor = (p: string) => signed?.find((s) => s.path === p)?.signedUrl ?? "";
    return rows.map((r) => ({
      id: r.id,
      tagline: r.tagline,
      card_image_url: urlFor(r.card_image_path),
      created_at: r.created_at,
      ripple_number: r.ripple_number ?? null,
      rarity: (r.rarity ?? "common") as MomentSummary["rarity"],
      genre: r.genre ?? "",
      mood: r.mood ?? "",
      format: r.format ?? "",
    }));
  },
);

export type MomentView = {
  id: string;
  tagline: string;
  sentence_one: string;
  sentence_two: string;
  card_image_url: string;
  photo_one_url: string;
  photo_two_url: string;
  still_one_url: string;
  still_two_url: string;
  created_at: string;
  interpretation: string;
  ripple_number: number | null;
  rarity: "common" | "rare" | "epic" | "legendary";
  genre: string;
  mood: string;
  visual_language: string[];
  format: string;
  narrative_device: string;
  presentation_format: string;
  director: string;
  giver_location: string;
  giver_merchant: string;
  giver_meal: string;
  giver_caption: string;
  receiver_location: string;
  receiver_merchant: string;
  receiver_meal: string;
  receiver_caption: string;
};

export const getMoment = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<MomentView | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("moments")
      .select(
        "id, tagline, sentence_one, sentence_two, card_image_path, photo_one_path, photo_two_path, still_one_path, still_two_path, created_at, director_notes, ripple_number, rarity, genre, mood, visual_language, format, narrative_device, presentation_format",
      )
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return null;

    const paths = [
      row.card_image_path,
      row.photo_one_path,
      row.photo_two_path,
      row.still_one_path,
      row.still_two_path,
    ].filter((p): p is string => !!p);
    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from("moments")
      .createSignedUrls(paths, 60 * 60 * 24 * 7);
    if (signedError) throw new Error(signedError.message);

    const urlFor = (p: string) =>
      signed?.find((s) => s.path === p)?.signedUrl ?? "";

    const notes = (row.director_notes ?? {}) as {
      invisible_story?: string;
      director?: string;
      giver_location?: string;
      giver_merchant?: string;
      giver_meal?: string;
      giver_caption?: string;
      receiver_location?: string;
      receiver_merchant?: string;
      receiver_meal?: string;
      receiver_caption?: string;
    };

    return {
      id: row.id,
      tagline: row.tagline,
      sentence_one: row.sentence_one,
      sentence_two: row.sentence_two,
      card_image_url: urlFor(row.card_image_path),
      photo_one_url: urlFor(row.photo_one_path),
      photo_two_url: urlFor(row.photo_two_path),
      still_one_url: row.still_one_path ? urlFor(row.still_one_path) : urlFor(row.photo_one_path),
      still_two_url: row.still_two_path ? urlFor(row.still_two_path) : urlFor(row.photo_two_path),
      created_at: row.created_at,
      interpretation: notes.invisible_story ?? "",
      ripple_number: (row as { ripple_number?: number | null }).ripple_number ?? null,
      rarity: ((row as { rarity?: string }).rarity ?? "common") as MomentView["rarity"],
      genre: (row as { genre?: string | null }).genre ?? "",
      mood: (row as { mood?: string | null }).mood ?? "",
      visual_language: ((row as { visual_language?: string[] | null }).visual_language ?? []) as string[],
      format: (row as { format?: string | null }).format ?? "",
      narrative_device: (row as { narrative_device?: string | null }).narrative_device ?? "",
      presentation_format: (row as { presentation_format?: string | null }).presentation_format ?? "",
      director: notes.director ?? "",
      giver_location: notes.giver_location ?? "",
      giver_merchant: notes.giver_merchant ?? "",
      giver_meal: notes.giver_meal ?? "",
      giver_caption: notes.giver_caption ?? "",
      receiver_location: notes.receiver_location ?? "",
      receiver_merchant: notes.receiver_merchant ?? "",
      receiver_meal: notes.receiver_meal ?? "",
      receiver_caption: notes.receiver_caption ?? "",
    };
  });