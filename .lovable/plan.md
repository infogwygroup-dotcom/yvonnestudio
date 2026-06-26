# Beta 2.0 — Infinite Stories Engine

Beta 1.0 stays frozen at `/` and `/v/beta1`. All Beta 2.0 work lives on the `/v/next` track plus a new viewer route so existing Ripples are untouched.

## Scope guardrails

- Do NOT touch the upload flow, AI story pipeline, or Director image prompt in `src/routes/api/create-moment.ts`. Image generation stays exactly as-is.
- Everything new happens AFTER the artwork is generated: extra metadata fields + a new dynamic viewer.

## What ships

1. **New creative metadata layers** chosen by AI alongside the existing Director:
   - `narrative_device` (replaces "Genre" in display — e.g. "Beginning Again", "A Letter Never Sent")
   - `visual_language[]` (expanded vocabulary, multi-tag)
   - `presentation_format` (e.g. Cinema Poster, Magazine Cover, Vinyl, Journal, Museum Card, Film Strip, Ticket, Blueprint, Comic, Storybook, Newspaper, Travel Journal)
   - `format_tier` derived from rarity — Legendary unlocks the most experimental formats (long scroll, fold-out, museum exhibit, vinyl).

2. **Dynamic Presentation Engine** — a new viewer at `/v2/m/$id` that picks a layout component per `presentation_format`. Each layout is its own composition (typography, frame, margins, ornaments), not a filter on a shared template. Initial set:
   - CinemaPosterLayout (hero + title + credits + laurels)
   - MagazineCoverLayout (masthead + coverlines + issue no.)
   - JournalLayout (handwritten notes, tape, paper)
   - VinylLayout (square sleeve + tracklist)
   - MuseumCardLayout (artwork + plaque + collection ID)
   - FilmStripLayout (vertical frames)
   - TicketLayout (tear-off + seat/screening)
   - StorybookLayout (illustrated page + chapter)
   - NewspaperLayout (front-page columns)
   - ContactSheetLayout (4-panel)
   - Fallback: existing editorial layout
   Router maps unknown formats → fallback.

3. **Rarity → Format pool**: Common picks from 4 grounded formats; Rare adds 3; Epic adds 4 more; Legendary unlocks the experimental set (long scroll, fold-out journal, vinyl, museum exhibition).

4. **Metadata footer block** (shared across layouts): Ripple No. · Directed by · Narrative · Visual Language · Presentation · Mood · Edition · Rarity.

5. **`/v/next` landing** flips its CTA so submissions from `/v/next` route to `/v2/m/$id`. Beta 1 still uses `/m/$id`.

## Technical sketch

```
src/
  routes/
    v2.m.$id.tsx              new viewer, route-id /v2/m/$id
    v.next.tsx                navigate → /v2/m/$id after POST
  components/v2/
    PresentationRouter.tsx    switch on presentation_format
    layouts/
      CinemaPoster.tsx
      MagazineCover.tsx
      Journal.tsx
      Vinyl.tsx
      MuseumCard.tsx
      FilmStrip.tsx
      Ticket.tsx
      Storybook.tsx
      Newspaper.tsx
      ContactSheet.tsx
      Fallback.tsx
    MetadataFooter.tsx
  lib/
    presentation.ts           rarity → allowed formats, format catalog
    moments.functions.ts      extend MomentView with narrative_device,
                              presentation_format; read from director_notes
```

Backend changes are additive only:
- Migration adds columns `narrative_device text`, `presentation_format text` on `public.moments` (nullable; old rows keep working). Existing `genre`, `mood`, `visual_language`, `rarity`, `ripple_number`, `format` stay.
- `create-moment.ts` Screenwriter/Director step gets two extra fields in its JSON schema (`narrative_device`, `presentation_format`) and a rarity-gated allowed list for `presentation_format`. Image prompt is unchanged. If the model omits them, we fall back to deterministic picks from the catalog seeded by `ripple_number`.
- `listMoments` / `getMoment` return the new fields. Beta 1 viewer ignores them; Beta 2 viewer uses them.

## Out of scope (saved for later)

- No animation overhaul on Beta 1.
- No collection-page redesign yet (badges will show new Narrative label only after we confirm v2 viewer).
- No new image styles or director additions.
