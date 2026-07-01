import { useState } from "react";
import type { MomentView } from "@/lib/moments.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

const RARITY_LABEL: Record<MomentView["rarity"], string> = {
  common: "Standard Edition",
  rare: "Limited Edition",
  epic: "Collector's Edition",
  legendary: "Legendary Archive",
};

const RARITY_NOTES: Record<MomentView["rarity"], { chance: string; poem: string }> = {
  common: {
    chance: "85%",
    poem: "The everyday ripple — a quiet story told well, printed in every edition.",
  },
  rare: {
    chance: "10%",
    poem: "A harder light, a stranger angle — a story that only a few editions hold.",
  },
  epic: {
    chance: "4%",
    poem: "A collector's dream — the director, the mood, and the moment all align.",
  },
  legendary: {
    chance: "1%",
    poem: "A once-in-a-collection miracle — the kind of story that belongs in an archive.",
  },
};

export function CollectionHeader({ moment }: { moment: MomentView }) {
  const number = moment.ripple_number
    ? String(moment.ripple_number).padStart(6, "0")
    : "000000";
  const year = new Date(moment.created_at).getFullYear();
  const edition = moment.ripple_number ?? "—";
  return (
    <header className="mx-auto mb-10 max-w-5xl border-b border-foreground/15 pb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
        <span className="font-serif text-[13px] tracking-[0.22em] text-foreground">
          Ripple Collection
        </span>
        <span>Edition {edition}</span>
        <span>Archive {year}</span>
        <span className="font-mono tracking-[0.18em]">RS-{number}</span>
      </div>
    </header>
  );
}

export function MetadataFooter({ moment }: { moment: MomentView }) {
  const [open, setOpen] = useState(false);
  const number = moment.ripple_number ? String(moment.ripple_number).padStart(6, "0") : "—";
  const rows: Array<[string, string, { clickable?: boolean } | undefined]> = [
    ["Ripple No.", number, undefined],
    ["Narrative", moment.narrative_device || moment.genre || "—", undefined],
    ["Visual Language", moment.visual_language?.length ? moment.visual_language.join(" · ") : "—", undefined],
    ["Presentation", moment.presentation_format || "Editorial", undefined],
    ["Mood", moment.mood || "—", undefined],
    ["Edition", RARITY_LABEL[moment.rarity], { clickable: true }],
    ["Rarity", moment.rarity[0].toUpperCase() + moment.rarity.slice(1), { clickable: true }],
  ];

  return (
    <section className="mx-auto mt-20 max-w-2xl border-t border-border/60 pt-10">
      <p className="eyebrow text-center">Ripple Identity</p>
      <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-4 text-sm sm:grid-cols-2">
        {rows.map(([k, v, opts]) => (
          <div key={k} className="flex items-baseline gap-3 border-b border-border/40 pb-3">
            <dt className="w-32 shrink-0 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {k}
            </dt>
            <dd className="font-serif italic text-foreground">
              {opts?.clickable ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="group inline-flex items-center gap-1.5 underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground/80"
                >
                  {v}
                  <HelpCircle className="h-3.5 w-3.5 opacity-40 transition-opacity group-hover:opacity-70" />
                </button>
              ) : (
                v
              )}
            </dd>
          </div>
        ))}
      </dl>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border border-border/80 bg-[#fbf6ec] text-foreground shadow-[0_24px_60px_-20px_rgba(60,40,20,0.45)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-2xl italic tracking-tight">
              Ripple Identity
            </DialogTitle>
            <DialogDescription className="text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Edition & Rarity
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-5">
            <p className="text-center text-sm leading-relaxed text-foreground/80">
              Every Ripple Moment is minted with a rarity tier. The AI director
              chooses the visual language, narrative device, and presentation
              format based on the emotional weight of the two memories.
            </p>

            <div className="grid gap-3">
              {(
                ["common", "rare", "epic", "legendary"] as MomentView["rarity"][]
              ).map((tier) => {
                const current = moment.rarity === tier;
                return (
                  <div
                    key={tier}
                    className={`rounded-sm border p-3 transition-colors ${
                      current
                        ? "border-foreground/40 bg-[#f3ead7]"
                        : "border-border/60 bg-transparent"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-serif text-[15px] italic">
                        {RARITY_LABEL[tier]}
                      </p>
                      <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                        {RARITY_NOTES[tier].chance}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/70">
                      {RARITY_NOTES[tier].poem}
                    </p>
                    {current && (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                        This Ripple is {tier}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
