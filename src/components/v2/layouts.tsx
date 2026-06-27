import type { MomentView } from "@/lib/moments.functions";
import { CollectionHeader, MetadataFooter } from "./MetadataFooter";

type Props = { moment: MomentView };

function PageShell({
  children,
  className = "",
  moment,
}: {
  children: React.ReactNode;
  className?: string;
  moment: MomentView;
}) {
  return (
    <main className={"paper min-h-screen px-4 pb-20 pt-12 sm:px-8 " + className}>
      <CollectionHeader moment={moment} />
      <div className="mx-auto max-w-5xl">{children}</div>
      <MetadataFooter moment={moment} />
    </main>
  );
}

function FormattedDate({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <span>
      {d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
    </span>
  );
}

/* ============================================================ */
/* 1. CINEMA POSTER                                              */
/* ============================================================ */
export function CinemaPosterLayout({ moment }: Props) {
  const year = new Date(moment.created_at).getFullYear();
  const release = new Date(moment.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">A Ripple Studio Picture</p>
      <div className="mx-auto mt-6 max-w-xl">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-black shadow-2xl ring-1 ring-black/20">
          <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-8 text-center text-white">
            <p className="text-[10px] uppercase tracking-[0.32em] opacity-80">{moment.narrative_device || moment.genre}</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight italic sm:text-5xl">{moment.tagline}</h1>
            <p className="mt-5 text-[9px] uppercase tracking-[0.28em] opacity-75">
              An Original Ripple Picture · In Selected Memory · {year}
            </p>
          </div>
          <div className="absolute left-4 top-4 flex flex-col gap-1 text-white/80">
            <span className="rounded-sm border border-white/40 px-2 py-0.5 text-[8px] uppercase tracking-[0.3em]">Official Selection</span>
            <span className="rounded-sm border border-white/40 px-2 py-0.5 text-[8px] uppercase tracking-[0.3em]">Festival Laureate</span>
          </div>
          <div className="absolute right-4 top-4 text-right text-[8px] uppercase tracking-[0.3em] text-white/70">
            <p>Ripple Studio</p>
            <p>presents</p>
          </div>
        </div>
        <div className="mt-6 border-t border-foreground/15 pt-4 text-center">
          <p className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
            Releasing {release}
          </p>
          <p className="mt-3 font-serif text-[11px] leading-relaxed text-foreground/75">
            <span className="uppercase tracking-[0.18em] text-muted-foreground">Featuring </span>
            two strangers · <span className="uppercase tracking-[0.18em] text-muted-foreground">Scene </span>
            {moment.giver_location || "elsewhere"} & {moment.receiver_location || "elsewhere"}
          </p>
          <p className="mx-auto mt-4 max-w-md font-serif italic text-muted-foreground">{moment.interpretation}</p>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 2. MAGAZINE COVER                                             */
/* ============================================================ */
export function MagazineCoverLayout({ moment }: Props) {
  const issue = moment.ripple_number ? String(moment.ripple_number).padStart(3, "0") : "01";
  const coverLines = [
    moment.narrative_device || moment.genre,
    moment.mood ? `On ${moment.mood.toLowerCase()}` : null,
    moment.visual_language?.[0],
  ].filter(Boolean) as string[];
  return (
    <PageShell moment={moment}>
      <div className="mx-auto max-w-2xl bg-card shadow-xl ring-1 ring-black/10">
        <header className="flex items-end justify-between border-b border-foreground/80 px-6 pb-2 pt-6">
          <h1 className="font-serif text-5xl tracking-tight">RIPPLE</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Issue №{issue} · <FormattedDate iso={moment.created_at} />
          </p>
        </header>
        <div className="relative">
          <img src={moment.card_image_url} alt={moment.tagline} className="aspect-[4/5] w-full object-cover" />
          <div className="absolute left-6 top-6 max-w-[60%] space-y-1.5 text-foreground">
            <p className="inline-block bg-background/85 px-2 py-0.5 text-[9px] uppercase tracking-[0.28em]">
              The {moment.narrative_device || moment.genre} Issue
            </p>
            {coverLines.slice(0, 3).map((c) => (
              <p key={c} className="block w-fit bg-background/80 px-2 py-0.5 font-serif text-sm italic">
                {c}
              </p>
            ))}
          </div>
          <div className="absolute bottom-6 right-6 max-w-[60%] text-right">
            <p className="inline-block bg-background/85 px-3 py-2 font-serif text-2xl italic leading-tight">
              {moment.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-6 border-t border-border px-6 py-4 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <div className="flex items-end gap-[2px]" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="block bg-foreground"
                style={{ width: i % 3 === 0 ? 2 : 1, height: 28 + ((i * 7) % 6) }}
              />
            ))}
          </div>
          <div className="text-right font-mono text-[9px] tracking-[0.18em]">
            <p>{moment.mood}</p>
            <p>9 771234 {issue}00 · ${(((moment.ripple_number ?? 1) % 9) + 6).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 3. JOURNAL / OLD LETTER / TRAVEL                              */
/* ============================================================ */
export function JournalLayout({ moment }: Props) {
  return (
    <PageShell moment={moment}>
      <div className="mx-auto max-w-3xl rotate-[-0.4deg] bg-[#f3ead7] p-8 shadow-xl ring-1 ring-amber-900/10 sm:p-12">
        <div className="grid gap-8 sm:grid-cols-[1.1fr_1fr]">
          <div className="relative">
            <div className="absolute -top-3 left-6 h-5 w-20 rotate-[-3deg] bg-amber-200/80 opacity-80" />
            <img src={moment.card_image_url} alt={moment.tagline} className="w-full object-cover shadow-md ring-1 ring-amber-900/15" />
            <p className="mt-3 text-center font-serif text-xs italic text-amber-900/70">
              {moment.giver_location} · {moment.receiver_location}
            </p>
          </div>
          <div>
            <p className="font-serif text-xs italic text-amber-900/60">
              <FormattedDate iso={moment.created_at} />
            </p>
            <h1 className="mt-3 font-serif text-3xl italic leading-snug text-amber-950">
              {moment.tagline}
            </h1>
            <p className="mt-6 font-serif text-base leading-relaxed text-amber-900/85">
              {moment.interpretation}
            </p>
            <p className="mt-8 font-serif text-sm italic text-amber-900/70">— {moment.narrative_device}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 4. VINYL                                                      */
/* ============================================================ */
export function VinylLayout({ moment }: Props) {
  const sideA = (moment.visual_language ?? []).slice(0, 3);
  const sideB = (moment.visual_language ?? []).slice(3, 6);
  const catalog = `RS-${(moment.ripple_number ?? 0).toString().padStart(5, "0")}`;
  return (
    <PageShell moment={moment}>
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 shadow-2xl ring-1 ring-black/30">
          <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 top-0 flex justify-between p-4 text-[9px] uppercase tracking-[0.32em] text-white/80">
            <span>Ripple Records</span>
            <span>{catalog}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-75">Long Play · 33⅓ RPM · {moment.mood}</p>
            <h1 className="mt-1 font-serif text-2xl italic">{moment.tagline}</h1>
          </div>
        </div>
        <div className="flex flex-col justify-between bg-[#f3ecdc] p-6 shadow-lg ring-1 ring-black/10">
          <div>
            <div className="flex items-baseline justify-between border-b border-foreground/30 pb-2">
              <p className="font-serif text-xl tracking-[0.32em]">RIPPLE RECORDS</p>
              <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">{catalog}</p>
            </div>
            <h2 className="mt-4 font-serif text-2xl italic">{moment.narrative_device}</h2>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              An original recording · {new Date(moment.created_at).getFullYear()}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="border-b border-foreground/30 pb-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Side A
                </p>
                <ol className="mt-2 space-y-1 font-serif">
                  {sideA.map((v, i) => (
                    <li key={v} className="flex gap-2">
                      <span className="w-5 text-muted-foreground">A{i + 1}.</span>
                      <span className="italic">{v}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="border-b border-foreground/30 pb-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Side B
                </p>
                <ol className="mt-2 space-y-1 font-serif">
                  {(sideB.length ? sideB : ["Reprise", "Coda"]).map((v, i) => (
                    <li key={v + i} className="flex gap-2">
                      <span className="w-5 text-muted-foreground">B{i + 1}.</span>
                      <span className="italic">{v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          <p className="mt-6 border-t border-foreground/20 pt-4 text-xs italic leading-relaxed text-muted-foreground">
            {moment.interpretation}
          </p>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 5. MUSEUM CARD                                                */
/* ============================================================ */
export function MuseumCardLayout({ moment }: Props) {
  const collectionId = `RS-${(moment.ripple_number ?? 0).toString().padStart(6, "0")}`;
  const year = new Date(moment.created_at).getFullYear();
  return (
    <PageShell moment={moment} className="bg-[#efe9dc]">
      <div className="mx-auto grid max-w-4xl gap-12 sm:grid-cols-[1.4fr_1fr]">
        <figure className="bg-[#f7f2e6] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
          <div className="border border-foreground/15 p-2">
            <img src={moment.card_image_url} alt={moment.tagline} className="w-full object-contain" />
          </div>
        </figure>
        <aside className="self-end">
          <div className="bg-[#f7f2e6] p-6 ring-1 ring-foreground/15">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {collectionId} · GALLERY VII
            </p>
            <h1 className="mt-3 font-serif text-2xl italic leading-snug text-foreground">
              {moment.tagline}
            </h1>
            <p className="mt-1 font-serif text-[12px] italic text-muted-foreground">
              Ripple Studio, {year}
            </p>
            <dl className="mt-5 grid grid-cols-[5.5rem_1fr] gap-y-2 text-[11px]">
              <dt className="uppercase tracking-[0.18em] text-muted-foreground">Medium</dt>
              <dd className="font-serif italic">{moment.visual_language?.slice(0, 3).join(", ") || "Mixed"}</dd>
              <dt className="uppercase tracking-[0.18em] text-muted-foreground">Origin</dt>
              <dd className="font-serif italic">{moment.giver_location || "—"} · {moment.receiver_location || "—"}</dd>
              <dt className="uppercase tracking-[0.18em] text-muted-foreground">Mood</dt>
              <dd className="font-serif italic">{moment.mood}</dd>
              <dt className="uppercase tracking-[0.18em] text-muted-foreground">Acquired</dt>
              <dd className="font-mono text-[10px] tracking-[0.18em]"><FormattedDate iso={moment.created_at} /></dd>
            </dl>
            <div className="my-5 h-px bg-foreground/15" />
            <p className="font-serif text-[13px] leading-relaxed text-foreground/85">
              {moment.interpretation}
            </p>
            <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              From the Permanent Collection
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 6. FILM STRIP                                                 */
/* ============================================================ */
export function FilmStripLayout({ moment }: Props) {
  const frames = [moment.card_image_url, moment.still_one_url, moment.still_two_url].filter(Boolean);
  while (frames.length < 3) frames.push(moment.card_image_url);
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Contact Strip · {moment.narrative_device || moment.mood}</p>
      <div className="mx-auto mt-6 max-w-md bg-neutral-900 p-3 shadow-2xl">
        <div className="flex justify-between px-1 py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-sm bg-neutral-700" />
          ))}
        </div>
        {frames.map((src, i) => (
          <div key={i} className="relative my-1 aspect-[4/3] w-full overflow-hidden bg-black">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <span className="absolute bottom-1 right-2 font-mono text-[9px] tracking-widest text-amber-200/90">
              FRAME {String(i + 1).padStart(2, "0")} · {moment.mood?.toUpperCase()}
            </span>
          </div>
        ))}
        <div className="flex justify-between px-1 py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-2 w-2 rounded-sm bg-neutral-700" />
          ))}
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-sm text-center font-serif italic text-muted-foreground">
        {moment.tagline}
      </p>
    </PageShell>
  );
}

/* ============================================================ */
/* 7. TICKET                                                     */
/* ============================================================ */
export function TicketLayout({ moment }: Props) {
  return (
    <PageShell moment={moment}>
      <div className="mx-auto flex max-w-3xl flex-col overflow-hidden bg-amber-50 shadow-xl ring-1 ring-amber-900/15 sm:flex-row">
        <div className="relative w-full sm:w-2/3">
          <img src={moment.card_image_url} alt={moment.tagline} className="aspect-[4/3] w-full object-cover sm:aspect-auto sm:h-full" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-80">Now Showing</p>
            <h1 className="mt-1 font-serif text-2xl italic">{moment.tagline}</h1>
          </div>
        </div>
        <div
          className="relative w-full border-t-2 border-dashed border-amber-900/30 p-6 sm:w-1/3 sm:border-l-2 sm:border-t-0"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-900/70">Admit One</p>
          <p className="mt-3 font-serif text-lg italic text-amber-950">{moment.narrative_device}</p>
          <dl className="mt-5 space-y-2 text-xs">
            <div className="flex justify-between"><dt className="text-amber-900/60">SEAT</dt><dd className="font-mono">A-{(moment.ripple_number ?? 1) % 99}</dd></div>
            <div className="flex justify-between"><dt className="text-amber-900/60">SCREEN</dt><dd className="font-mono">{moment.mood?.slice(0, 3).toUpperCase()}</dd></div>
            <div className="flex justify-between"><dt className="text-amber-900/60">DATE</dt><dd className="font-mono"><FormattedDate iso={moment.created_at} /></dd></div>
          </dl>
          <p className="mt-6 font-mono text-[9px] tracking-[0.25em] text-amber-900/50">
            RS-{(moment.ripple_number ?? 0).toString().padStart(6, "0")}
          </p>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 8. NEWSPAPER FRONT PAGE                                       */
/* ============================================================ */
export function NewspaperLayout({ moment }: Props) {
  return (
    <PageShell moment={moment}>
      <div className="mx-auto max-w-3xl bg-[#f6f1e6] p-8 shadow-xl ring-1 ring-black/15">
        <header className="border-b-4 border-double border-foreground pb-3 text-center">
          <h1 className="font-serif text-5xl tracking-tight">The Ripple Times</h1>
          <p className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Vol. I</span>
            <span><FormattedDate iso={moment.created_at} /></span>
            <span>One Cent</span>
          </p>
        </header>
        <h2 className="mt-6 text-center font-serif text-3xl italic leading-tight">
          {moment.tagline}
        </h2>
        <p className="mt-2 text-center text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {moment.narrative_device} · Reported from {moment.giver_location || "elsewhere"}
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-[1.2fr_1fr]">
          <img src={moment.card_image_url} alt={moment.tagline} className="w-full object-cover ring-1 ring-black/10" />
          <div className="columns-1 gap-4 font-serif text-[13px] leading-relaxed text-foreground/85">
            <p className="first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-none">
              {moment.interpretation}
            </p>
            <p className="mt-3 italic text-muted-foreground">— filed by Ripple Studio</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 9. CONTACT SHEET / STORYBOARD / COMIC                         */
/* ============================================================ */
export function ContactSheetLayout({ moment }: Props) {
  const cells = [moment.card_image_url, moment.still_one_url, moment.still_two_url, moment.card_image_url];
  const labels = ["Scene 01", "Scene 02", "Scene 03", "Scene 04"];
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Storyboard · {moment.narrative_device}</p>
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 bg-card p-4 shadow-xl ring-1 ring-black/10">
        {cells.map((src, i) => (
          <figure key={i} className="bg-black">
            <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
            <figcaption className="flex items-center justify-between bg-card px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              <span>{labels[i]}</span>
              <span>{moment.mood}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-md text-center font-serif italic text-muted-foreground">
        {moment.tagline}
      </p>
    </PageShell>
  );
}

/* ============================================================ */
/* 10. BLUEPRINT                                                 */
/* ============================================================ */
export function BlueprintLayout({ moment }: Props) {
  return (
    <PageShell moment={moment} className="bg-[#0c2540] text-cyan-100">
      <div className="mx-auto max-w-3xl p-8 ring-1 ring-cyan-200/30 [background:repeating-linear-gradient(0deg,transparent_0,transparent_31px,rgba(186,230,253,0.08)_32px),repeating-linear-gradient(90deg,transparent_0,transparent_31px,rgba(186,230,253,0.08)_32px)]">
        <header className="flex items-end justify-between border-b border-cyan-100/30 pb-3 font-mono text-[10px] uppercase tracking-[0.22em]">
          <span>Ripple Studio · Drawing</span>
          <span>SHEET 01 / 01</span>
        </header>
        <div className="mt-6 grid gap-6 sm:grid-cols-[1.3fr_1fr]">
          <div className="relative border border-cyan-100/40 p-2">
            <img src={moment.card_image_url} alt={moment.tagline} className="w-full object-cover opacity-90 [filter:hue-rotate(180deg)_saturate(0.6)_brightness(0.95)]" />
            <span className="absolute -left-3 top-1/2 -translate-y-1/2 rotate-180 font-mono text-[9px] tracking-[0.28em] text-cyan-100/80" style={{ writingMode: "vertical-rl" }}>↕ 1620 mm</span>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-[0.28em] text-cyan-100/80">↔ 2160 mm</span>
            <span className="absolute -top-3 right-2 -rotate-2 font-serif text-[11px] italic text-cyan-100/85">— soft north light, morning</span>
          </div>
          <div className="font-mono text-xs leading-relaxed">
            <p className="text-cyan-200/70">TITLE</p>
            <p className="mt-1 font-serif text-xl italic">{moment.tagline}</p>
            <p className="mt-4 text-cyan-200/70">NARRATIVE</p>
            <p className="mt-1">{moment.narrative_device}</p>
            <p className="mt-4 text-cyan-200/70">MEASUREMENTS</p>
            <ul className="mt-1 space-y-0.5">
              <li>· Frame · 2160 × 1620 mm</li>
              <li>· Scale · 1 : 24</li>
              <li>· Palette · {(moment.visual_language ?? []).slice(0, 2).join(", ") || "—"}</li>
            </ul>
            <p className="mt-4 text-cyan-200/70">NOTES</p>
            <p className="mt-1 font-serif italic leading-relaxed text-cyan-50/90">{moment.interpretation}</p>
            <p className="mt-4 -rotate-2 font-serif text-[11px] italic text-cyan-100/70">— check pencil weight in upper third</p>
            <div className="mt-6 flex items-end justify-between border-t border-cyan-100/30 pt-3 text-[10px] tracking-[0.22em] text-cyan-100/70">
              <span>DRAWN BY HAND</span>
              <span>REV. 01</span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* FALLBACK — editorial                                          */
/* ============================================================ */
export function FallbackLayout({ moment }: Props) {
  return (
    <PageShell moment={moment}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{moment.narrative_device || moment.genre}</p>
        <h1 className="mt-4 font-serif text-4xl italic leading-tight sm:text-5xl">
          {moment.tagline}
        </h1>
        <img
          src={moment.card_image_url}
          alt={moment.tagline}
          className="mx-auto mt-10 w-full max-w-xl object-cover shadow-xl ring-1 ring-black/10"
        />
        <p className="mx-auto mt-8 max-w-lg font-serif italic leading-relaxed text-muted-foreground">
          {moment.interpretation}
        </p>
      </div>
    </PageShell>
  );
}