// ─────────────────────────────────────────────────────────────────────────────
// Ripple Studio V2 — Creative Catalog
//
// EDIT THIS FILE to expand or tune the V next experience.
// Only used by the /v/next track (v2 viewer + create-moment AI prompt).
// Beta 1.0 (/, /v/beta1) is unaffected.
//
// For every entry:
//   • priority  1 → 5   How strongly the AI should prefer this option.
//                       3 = neutral. 5 = strongly preferred. 1 = rare appearance.
//   • minRarity         The lowest rarity tier this option may appear in.
//                       e.g. "legendary" = unlocks only on Legendary Ripples.
//                       "common" = always eligible.
// ─────────────────────────────────────────────────────────────────────────────

export type Tier = "common" | "rare" | "epic" | "legendary";

export type DirectorEntry = {
  name: string;
  vibe: string;
  priority: number;
  minRarity: Tier;
};

export type NarrativeEntry = {
  label: string;
  priority: number;
  minRarity: Tier;
};

// ── Director Pool ────────────────────────────────────────────────────────────
export const DIRECTORS: DirectorEntry[] = [
  // Original 16 (V2.0 baseline)
  { name: "Wong Kar Wai",                   vibe: "loneliness, memory, distance, rain, neon, reflection, slow motion, warm green, film grain", priority: 3, minRarity: "common" },
  { name: "Makoto Shinkai",                 vibe: "hope, distance, sky, sunset, dreamlike clouds, soft glow, cinematic anime",                  priority: 3, minRarity: "common" },
  { name: "Studio Ghibli",                  vibe: "kindness, meal, family, warmth, nature, hand painted, gentle, storybook",                    priority: 3, minRarity: "common" },
  { name: "Pixar",                          vibe: "unexpected friendship, hope, joy, colourful, expressive, soft 3D",                            priority: 3, minRarity: "common" },
  { name: "Hayao Miyazaki Sketchbook",      vibe: "watercolor, wind, flowers, peaceful, minimal",                                                priority: 3, minRarity: "common" },
  { name: "Wes Anderson",                   vibe: "symmetry, pastel, quirky, playful, storybook framing",                                        priority: 3, minRarity: "common" },
  { name: "Denis Villeneuve",               vibe: "vast, quiet, minimal, solitude, large scale architecture, strong light",                     priority: 3, minRarity: "rare" },
  { name: "Christopher Nolan",              vibe: "time, memory, parallel lives, deep shadows, high contrast",                                   priority: 3, minRarity: "rare" },
  { name: "Edward Hopper Painting",         vibe: "waiting, silence, window, late afternoon, solitude, painting",                                priority: 3, minRarity: "rare" },
  { name: "Vintage Magazine Editorial",     vibe: "fashion, beautiful typography, minimal, paper texture",                                       priority: 3, minRarity: "common" },
  { name: "Japanese Lifestyle Photography", vibe: "calm, everyday, coffee, wood, natural light, film",                                           priority: 3, minRarity: "common" },
  { name: "Documentary Photography",        vibe: "real, street, humanity, authentic, not stylised",                                             priority: 3, minRarity: "common" },
  { name: "Watercolour Journal",            vibe: "travel notebook, hand painted, light ink, soft colours",                                      priority: 3, minRarity: "common" },
  { name: "Clay Illustration",              vibe: "cute, handmade, miniature, craft, warm",                                                      priority: 3, minRarity: "common" },
  { name: "Neo Pop Illustration",           vibe: "bold, graphic, bright, flat, youthful",                                                       priority: 3, minRarity: "common" },
  { name: "Storybook",                      vibe: "children's illustration, gentle, dream, magic",                                               priority: 3, minRarity: "common" },

  // ── New additions (V next expansion) — edit priority/minRarity freely ──
  { name: "Saul Leiter Street Colour",      vibe: "rainy windows, reflections, painterly street photography, muted reds and greens",             priority: 4, minRarity: "rare" },
  { name: "Roger Deakins Cinematography",   vibe: "wide quiet frames, hour-of-the-wolf light, golden silhouettes, painterly natural light",      priority: 3, minRarity: "rare" },
  { name: "Greta Gerwig",                   vibe: "warm coming-of-age, soft sunlight, sisterhood, handwritten letters, tender humour",           priority: 3, minRarity: "common" },
  { name: "Sumi-e Ink Wash",                vibe: "Japanese ink painting, single brushstroke, rice paper, empty space, monochrome calm",         priority: 2, minRarity: "epic" },
  { name: "Risograph Print",                vibe: "two-tone overprint, paper grain, indie zine, fluorescent pink + blue, mis-registration",      priority: 2, minRarity: "epic" },
  { name: "Vintage Polaroid SX-70",         vibe: "instant film, soft focus, faded chemistry, 1970s warm haze, square frame",                    priority: 3, minRarity: "common" },
  { name: "Mid-century Children's Book",    vibe: "Mary Blair palette, gouache, flat textures, naive geometry, warm nostalgia",                  priority: 2, minRarity: "rare" },
  { name: "Andrei Tarkovsky",               vibe: "long contemplative takes, sepia interiors, rain, time as material, slow miracle",             priority: 2, minRarity: "legendary" },
  { name: "Studio Trigger Animation",       vibe: "kinetic anime, saturated colour, bold linework, kinetic emotion",                             priority: 2, minRarity: "epic" },
  { name: "Hayao Miyazaki Skyscape",        vibe: "vast painted skies, flying, wind through grass, cinematic hand-painted clouds",               priority: 3, minRarity: "rare" },
];

// ── Narrative Devices ────────────────────────────────────────────────────────
export const NARRATIVES: NarrativeEntry[] = [
  // Original 15
  { label: "Beginning Again",        priority: 3, minRarity: "common" },
  { label: "The First Step",         priority: 3, minRarity: "common" },
  { label: "A Letter Never Sent",    priority: 3, minRarity: "common" },
  { label: "Parallel Lives",         priority: 3, minRarity: "common" },
  { label: "The Same Sky",           priority: 3, minRarity: "common" },
  { label: "Missed Connection",      priority: 3, minRarity: "common" },
  { label: "One Table Two Worlds",   priority: 3, minRarity: "common" },
  { label: "Echoes",                 priority: 3, minRarity: "common" },
  { label: "Silent Kindness",        priority: 3, minRarity: "common" },
  { label: "Time Capsule",           priority: 3, minRarity: "common" },
  { label: "Crossing Paths",         priority: 3, minRarity: "common" },
  { label: "Homecoming",             priority: 3, minRarity: "common" },
  { label: "Waiting",                priority: 3, minRarity: "common" },
  { label: "An Ordinary Miracle",    priority: 3, minRarity: "common" },
  { label: "Shared Memory",          priority: 3, minRarity: "common" },

  // ── New additions ──
  { label: "Two Strangers, One Sky", priority: 4, minRarity: "common" },
  { label: "The Door Left Open",     priority: 3, minRarity: "common" },
  { label: "Found in Translation",   priority: 3, minRarity: "rare" },
  { label: "A Quiet Promise",        priority: 3, minRarity: "common" },
  { label: "The Long Way Home",      priority: 3, minRarity: "common" },
  { label: "Borrowed Light",         priority: 2, minRarity: "rare" },
  { label: "Inheritance of Small Things", priority: 2, minRarity: "epic" },
  { label: "The Photograph We Never Took", priority: 2, minRarity: "epic" },
  { label: "Footnote of a Stranger", priority: 1, minRarity: "legendary" },

  // ── Legendary narratives — only the rarest Ripples unlock these ──
  { label: "The Unsent Lullaby",          priority: 2, minRarity: "legendary" },
  { label: "A Room Remembered",           priority: 2, minRarity: "legendary" },
  { label: "The Last Warmth of a Season", priority: 2, minRarity: "legendary" },
  { label: "Strangers Borrowing the Same Light", priority: 2, minRarity: "legendary" },
  { label: "The Map We Drew by Mistake",  priority: 2, minRarity: "legendary" },
  { label: "What the Rain Did Not Wash Away", priority: 2, minRarity: "legendary" },
  { label: "The Echo of a Door Closing",  priority: 2, minRarity: "legendary" },
  { label: "A Clock That Stopped for Two People", priority: 3, minRarity: "legendary" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const TIER_RANK: Record<Tier, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

export function directorsForRarity(rarity: Tier): DirectorEntry[] {
  return DIRECTORS.filter((d) => TIER_RANK[d.minRarity] <= TIER_RANK[rarity]);
}

export function narrativesForRarity(rarity: Tier): NarrativeEntry[] {
  return NARRATIVES.filter((n) => TIER_RANK[n.minRarity] <= TIER_RANK[rarity]);
}

/** Priority-weighted deterministic pick — fallback when the AI omits a field. */
export function weightedPick<T extends { priority: number }>(items: T[], seed: number): T {
  if (items.length === 0) throw new Error("weightedPick: empty pool");
  const weights = items.map((it) => Math.max(1, it.priority));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = ((Math.abs(seed) % 1_000_000) / 1_000_000) * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function renderDirectorList(entries: DirectorEntry[]): string {
  return entries
    .map((d) => `   - ${d.name} ${"★".repeat(Math.max(1, Math.min(5, d.priority)))} (${d.vibe})`)
    .join("\n");
}

export function renderNarrativeList(entries: NarrativeEntry[]): string {
  return entries
    .map((n) => `${n.label}${n.priority >= 4 ? " ★" : ""}`)
    .join(" · ");
}

export const DIRECTOR_NAMES = DIRECTORS.map((d) => d.name);
