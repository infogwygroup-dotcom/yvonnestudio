import type { MomentView } from "@/lib/moments.functions";

const RARITY_LABEL: Record<MomentView["rarity"], string> = {
  common: "Standard Edition",
  rare: "Limited Edition",
  epic: "Collector's Edition",
  legendary: "Legendary Archive",
};

export function MetadataFooter({ moment }: { moment: MomentView }) {
  const number = moment.ripple_number ? String(moment.ripple_number).padStart(6, "0") : "—";
  const rows: Array<[string, string]> = [
    ["Ripple No.", number],
    ["Directed by", "Ripple Studio"],
    ["Narrative", moment.narrative_device || moment.genre || "—"],
    ["Visual Language", moment.visual_language?.length ? moment.visual_language.join(" · ") : "—"],
    ["Presentation", moment.presentation_format || "Editorial"],
    ["Mood", moment.mood || "—"],
    ["Edition", RARITY_LABEL[moment.rarity]],
    ["Rarity", moment.rarity[0].toUpperCase() + moment.rarity.slice(1)],
  ];
  return (
    <section className="mx-auto mt-20 max-w-2xl border-t border-border/60 pt-10">
      <p className="eyebrow text-center">Ripple Identity</p>
      <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-4 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-3 border-b border-border/40 pb-3">
            <dt className="w-32 shrink-0 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {k}
            </dt>
            <dd className="font-serif italic text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}