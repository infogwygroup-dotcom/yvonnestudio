import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({ id: z.string().uuid() });

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
        "id, tagline, sentence_one, sentence_two, card_image_path, photo_one_path, photo_two_path, still_one_path, still_two_path, created_at, director_notes",
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