// V3 presentation registry — V2 base + 10 new physical-collectible formats.
// Kept separate from src/lib/presentation.ts so Beta 2.0 (/v2/m/$id) is unaffected.

import type { MomentView } from "@/lib/moments.functions";
import { pickLayout as pickV2Layout } from "@/lib/presentation";
import {
  PostcardLayout,
  FridgeMagnetLayout,
  LibraryCardLayout,
  PassportLayout,
  ContactSheetProLayout,
  FilmNegativeLayout,
  CassetteLayout,
  MatchboxLayout,
  ArchiveTagLayout,
  CafeReceiptLayout,
} from "@/components/v3/layouts";

export type LayoutComponent = React.ComponentType<{ moment: MomentView }>;

const V3_REGISTRY: Record<string, LayoutComponent> = {
  "postcard": PostcardLayout,
  "fridge magnet": FridgeMagnetLayout,
  "café receipt": CafeReceiptLayout,
  "cafe receipt": CafeReceiptLayout,
  "library borrow card": LibraryCardLayout,
  "library card": LibraryCardLayout,
  "passport stamp": PassportLayout,
  "passport page": PassportLayout, // v3 overrides v2's journal fallback
  "contact sheet": ContactSheetProLayout,
  "film negative": FilmNegativeLayout,
  "cassette tape": CassetteLayout,
  "mixtape": CassetteLayout,
  "matchbox": MatchboxLayout,
  "matchbook": MatchboxLayout,
  "museum archive tag": ArchiveTagLayout,
  "archive tag": ArchiveTagLayout,
};

export function pickLayoutV3(presentationFormat: string): LayoutComponent {
  const key = (presentationFormat ?? "").trim().toLowerCase();
  if (V3_REGISTRY[key]) return V3_REGISTRY[key];
  // Fall back to the V2 registry (so every V2 format still works on /v3/m/$id).
  return pickV2Layout(presentationFormat);
}