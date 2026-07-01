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
  BookChapterLayout,
  PostcardLayout,
  PolaroidLayout,
  ReceiptLayout,
  BookmarkLayout,
  FallbackLayout,
} from "@/components/v2/layouts";

export type LayoutComponent = React.ComponentType<{ moment: MomentView }>;

// Map a presentation_format string → layout component.
// Unknown formats fall through to FallbackLayout (editorial).
const REGISTRY: Record<string, LayoutComponent> = {
  "cinema poster": CinemaPosterLayout,
  "magazine cover": MagazineCoverLayout,
  "book chapter": BookChapterLayout,
  "journal page": JournalLayout,
  "old letter": JournalLayout,
  "travel journal": JournalLayout,
  "notebook": JournalLayout,
  "scrapbook": JournalLayout,
  "memory album": JournalLayout,
  "passport page": JournalLayout,
  "handwritten note": JournalLayout,
  "vinyl record cover": VinylLayout,
  "museum exhibition card": MuseumCardLayout,
  "gallery print": MuseumCardLayout,
  "film strip": FilmStripLayout,
  "movie ticket": TicketLayout,
  "ticket stub": TicketLayout,
  "newspaper front page": NewspaperLayout,
  "storyboard": ContactSheetLayout,
  "comic page": ContactSheetLayout,
  "photo print": ContactSheetLayout,
  "photo strip": ContactSheetLayout,
  "blueprint": BlueprintLayout,
  "postcard": PostcardLayout,
  "polaroid frame": PolaroidLayout,
  "cafe receipt": ReceiptLayout,
  "café receipt": ReceiptLayout,
  "bookmark": BookmarkLayout,
};

export function pickLayout(presentationFormat: string): LayoutComponent {
  const key = (presentationFormat ?? "").trim().toLowerCase();
  return REGISTRY[key] ?? FallbackLayout;
}