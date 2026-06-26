import type { MomentView } from "@/lib/moments.functions";
import {
  CinemaPosterLayout,
  MagazineCoverLayout,
  JournalLayout,
  VinylLayout,
  MuseumCardLayout,
  FilmStripLayout,
  TicketLayout,
  NewspaperLayout,
  ContactSheetLayout,
  BlueprintLayout,
  FallbackLayout,
} from "@/components/v2/layouts";

export type LayoutComponent = React.ComponentType<{ moment: MomentView }>;

// Map a presentation_format string → layout component.
// Unknown formats fall through to FallbackLayout (editorial).
const REGISTRY: Record<string, LayoutComponent> = {
  "cinema poster": CinemaPosterLayout,
  "magazine cover": MagazineCoverLayout,
  "book chapter": MagazineCoverLayout,
  "journal page": JournalLayout,
  "old letter": JournalLayout,
  "travel journal": JournalLayout,
  "notebook": JournalLayout,
  "scrapbook": JournalLayout,
  "memory album": JournalLayout,
  "passport page": JournalLayout,
  "vinyl record cover": VinylLayout,
  "museum exhibition card": MuseumCardLayout,
  "gallery print": MuseumCardLayout,
  "film strip": FilmStripLayout,
  "movie ticket": TicketLayout,
  "newspaper front page": NewspaperLayout,
  "storyboard": ContactSheetLayout,
  "comic page": ContactSheetLayout,
  "photo print": ContactSheetLayout,
  "blueprint": BlueprintLayout,
};

export function pickLayout(presentationFormat: string): LayoutComponent {
  const key = (presentationFormat ?? "").trim().toLowerCase();
  return REGISTRY[key] ?? FallbackLayout;
}