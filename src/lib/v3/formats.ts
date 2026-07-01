// ─────────────────────────────────────────────────────────────────────────────
// Ripple Studio V3 — Presentation Format Library (additive)
//
// Ten new "real-world collectible" formats. Layered ON TOP of every V2 format.
// Ripple Studio picks one automatically based on rarity, story, mood.
//
// Everything else — Director Engine, Story Engine, Rarity Engine, image
// generation, prompts — is unchanged. This file only expands the pool of
// physical mediums Ripple Studio may render into.
// ─────────────────────────────────────────────────────────────────────────────

import type { Tier } from "@/lib/v2/catalog";

export type V3FormatEntry = {
  label: string;      // canonical name used across API + registry
  hint: string;       // one-line description surfaced in the AI prompt
  minRarity: Tier;
};

export const V3_FORMATS: V3FormatEntry[] = [
  { label: "Postcard",             hint: "vintage handwritten postcard, front artwork + back with stamp, postmark, to/from",   minRarity: "common" },
  { label: "Fridge Magnet",        hint: "glossy rounded magnet on a real refrigerator, tucked between grocery lists + notes", minRarity: "common" },
  { label: "Café Receipt",         hint: "thermal café receipt where the items are emotions, not food",                        minRarity: "common" },
  { label: "Library Borrow Card",  hint: "aged library borrowing card with stamps and collection ID — 'borrowed from life'",   minRarity: "rare" },
  { label: "Passport Stamp",       hint: "memory passport page with an emotional-immigration stamp, destination + date",       minRarity: "rare" },
  { label: "Contact Sheet",        hint: "photographer's contact sheet, red grease-pencil circles, one selected hero frame",   minRarity: "rare" },
  { label: "Film Negative",        hint: "developed 35mm negatives on a light table, Kodak numbering + light leaks",           minRarity: "epic" },
  { label: "Cassette Tape",        hint: "handwritten mixtape label, Side A / Side B tracklist, recording date",               minRarity: "epic" },
  { label: "Matchbox",             hint: "vintage matchbox — illustrated outside, symbolic quote inside — 'one small spark'",  minRarity: "epic" },
  { label: "Museum Archive Tag",   hint: "museum storage archive tag: accession no., condition, curator note (not gallery)",   minRarity: "legendary" },
];

const TIER_RANK: Record<Tier, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

/** V3 format list eligible for a given rarity tier. */
export function v3FormatsForRarity(rarity: Tier): V3FormatEntry[] {
  return V3_FORMATS.filter((f) => TIER_RANK[f.minRarity] <= TIER_RANK[rarity]);
}

/** Rarity → labels, merged with the V2 pool. Used by the API when version=v3. */
export function mergedPresentationPool(
  rarity: Tier,
  v2PoolByRarity: Record<Tier, string[]>,
): string[] {
  const v3 = v3FormatsForRarity(rarity).map((f) => f.label);
  // De-dup while preserving order (v2 first, then v3 additions).
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of [...v2PoolByRarity[rarity], ...v3]) {
    const k = label.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(label);
  }
  return out;
}

/** Human-readable line for the AI system prompt. */
export function renderV3FormatHints(rarity: Tier): string {
  return v3FormatsForRarity(rarity)
    .map((f) => `   · ${f.label} — ${f.hint}`)
    .join("\n");
}

export const V3_FORMAT_LABELS = V3_FORMATS.map((f) => f.label);