import type { MomentView } from "@/lib/moments.functions";
import { CollectionHeader, MetadataFooter } from "@/components/v2/MetadataFooter";

type Props = { moment: MomentView };

function PageShell({ children, moment, tone = "" }: { children: React.ReactNode; moment: MomentView; tone?: string }) {
  return (
    <main className={"paper min-h-screen px-4 pb-20 pt-12 sm:px-8 " + tone}>
      <CollectionHeader moment={moment} />
      <div className="mx-auto max-w-5xl">{children}</div>
      <MetadataFooter moment={moment} />
    </main>
  );
}

function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("en-US", opts ?? { month: "long", day: "numeric", year: "numeric" });
}

/* ============================================================ */
/* 1. POSTCARD — Front + Back                                    */
/* ============================================================ */
export function PostcardLayout({ moment }: Props) {
  const number = moment.ripple_number ? String(moment.ripple_number).padStart(4, "0") : "0000";
  const postmark = fmtDate(moment.created_at, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Postcard · Do Not Bend</p>
      <div className="mx-auto mt-8 grid max-w-5xl gap-10 lg:grid-cols-2">
        {/* FRONT */}
        <div className="rotate-[-0.6deg] rounded-[3px] bg-[#f4ead6] p-3 shadow-[0_18px_40px_-20px_rgba(60,40,20,0.35)] ring-1 ring-black/10">
          <div className="relative aspect-[3/2] w-full overflow-hidden">
            <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.15))]" />
          </div>
          <p className="mt-3 text-center font-serif italic text-[15px] leading-snug text-stone-800">
            {moment.tagline}
          </p>
          <p className="mt-1 text-center text-[9px] uppercase tracking-[0.32em] text-stone-500">
            Greetings · Ripple Studio · N° {number}
          </p>
        </div>
        {/* BACK */}
        <div className="rotate-[0.4deg] rounded-[3px] bg-[#efe4cb] p-6 shadow-[0_18px_40px_-20px_rgba(60,40,20,0.35)] ring-1 ring-black/10">
          <div className="flex items-start justify-between gap-4 border-b border-stone-500/40 pb-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.32em] text-stone-500">Ripple Studio Post</p>
              <p className="mt-1 font-serif text-xl text-stone-800">Correspondence</p>
            </div>
            {/* Stamp */}
            <div className="relative h-20 w-16 shrink-0 rounded-[2px] border-2 border-dashed border-stone-500/50 bg-[#c96b4e] p-1 text-white shadow-inner">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-[1px] border border-white/40">
                <span className="font-serif text-[10px] leading-none italic">Ripple</span>
                <span className="mt-0.5 text-[7px] uppercase tracking-[0.2em]">Studio</span>
                <span className="mt-1 text-[7px] tracking-widest">∞ ¢</span>
              </div>
              {/* Postmark rings */}
              <div className="pointer-events-none absolute -left-6 -top-1 h-14 w-14 rounded-full border border-stone-700/40" />
              <div className="pointer-events-none absolute -left-4 top-1 rotate-[-14deg] text-[7px] uppercase tracking-[0.2em] text-stone-700/60">
                {postmark}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-[1.1fr_0.9fr] gap-6">
            <div className="border-r border-stone-500/30 pr-4">
              <p className="font-serif italic text-[15px] leading-relaxed text-stone-700">
                {moment.sentence_one}
              </p>
              <p className="mt-4 font-serif italic text-[15px] leading-relaxed text-stone-700">
                — and later, they wrote back:
              </p>
              <p className="mt-2 font-serif italic text-[15px] leading-relaxed text-stone-700">
                {moment.sentence_two}
              </p>
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
              <p>To</p>
              <p className="mt-1 border-b border-stone-500/40 pb-2 font-serif text-[14px] normal-case tracking-normal text-stone-800">
                Whoever finds this
              </p>
              <p className="mt-4">From</p>
              <p className="mt-1 border-b border-stone-500/40 pb-2 font-serif text-[14px] normal-case tracking-normal text-stone-800">
                Two strangers · {fmtDate(moment.created_at, { year: "numeric" })}
              </p>
              <p className="mt-4">City / State</p>
              <p className="mt-1 border-b border-stone-500/40 pb-2 font-serif text-[13px] normal-case tracking-normal text-stone-700">
                {moment.giver_location || "somewhere quiet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 2. FRIDGE MAGNET — on a real fridge                           */
/* ============================================================ */
export function FridgeMagnetLayout({ moment }: Props) {
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Kept on the fridge · A small everyday keepsake</p>
      <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-[10px] bg-gradient-to-b from-[#e8e5df] via-[#f2f0ea] to-[#dedad2] p-8 shadow-[inset_0_2px_6px_rgba(255,255,255,0.6),inset_0_-4px_10px_rgba(0,0,0,0.08),0_20px_40px_-24px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
        {/* Fridge surface hairlines */}
        <div className="relative min-h-[520px] rounded-[6px] bg-[linear-gradient(180deg,#f5f3ee_0%,#eae7df_100%)] p-6 shadow-inner">
          {/* Grocery list — top-left */}
          <div className="absolute left-4 top-4 w-40 rotate-[-4deg] bg-yellow-100/90 p-3 text-[11px] font-mono text-stone-700 shadow-md ring-1 ring-yellow-900/10">
            <p className="mb-1 border-b border-stone-500/40 pb-0.5 font-semibold uppercase tracking-wider">Groceries</p>
            <p>milk</p>
            <p>bread</p>
            <p>tomatoes</p>
            <p className="line-through">flowers</p>
            <p>coffee ☕</p>
          </div>
          {/* Child drawing — top-right */}
          <div className="absolute right-4 top-6 w-36 rotate-[5deg] bg-white p-2 shadow-md ring-1 ring-black/10">
            <div className="flex h-20 items-end justify-center bg-sky-50 p-2 text-[24px]">
              🌞🏠🌳
            </div>
            <p className="mt-1 text-center font-serif text-[10px] italic text-stone-500">By Lily, age 6</p>
          </div>
          {/* Ticket stub — bottom-left */}
          <div className="absolute bottom-6 left-6 w-44 rotate-[-2deg] rounded-sm bg-[#efe6d3] p-2 text-[10px] uppercase tracking-widest text-stone-600 shadow-md ring-1 ring-black/10">
            <p className="text-stone-800">Train · Platform 3</p>
            <p className="mt-0.5">Seat 14B</p>
          </div>
          {/* Sticky note — bottom-right */}
          <div className="absolute bottom-8 right-8 w-32 rotate-[3deg] bg-pink-200 p-3 font-serif text-[12px] italic text-stone-700 shadow-md">
            "Don't forget to call mum ♡"
          </div>

          {/* THE MAGNET — hero */}
          <div className="relative left-1/2 top-1/2 w-64 -translate-x-1/2 -translate-y-1/2">
            <div className="relative overflow-hidden rounded-[14px] bg-white p-2 shadow-[0_16px_28px_-10px_rgba(0,0,0,0.35),0_2px_0_rgba(255,255,255,0.9)_inset] ring-1 ring-black/10">
              <div className="aspect-square w-full overflow-hidden rounded-[8px]">
                <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 px-1 pb-1 text-center font-serif text-[12px] italic leading-tight text-stone-700">
                {moment.tagline}
              </p>
              {/* Glossy highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-[14px] bg-[linear-gradient(135deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_35%,rgba(255,255,255,0)_65%,rgba(255,255,255,0.2)_100%)]" />
            </div>
            {/* Magnet drop shadow to fridge */}
            <div className="pointer-events-none absolute inset-x-4 -bottom-2 h-4 rounded-full bg-black/25 blur-md" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 3. LIBRARY BORROW CARD                                        */
/* ============================================================ */
export function LibraryCardLayout({ moment }: Props) {
  const borrow = fmtDate(moment.created_at, { month: "short", day: "2-digit", year: "numeric" });
  const returnBy = fmtDate(new Date(new Date(moment.created_at).getTime() + 14 * 86400000).toISOString(), { month: "short", day: "2-digit", year: "numeric" });
  const acc = moment.ripple_number ? String(moment.ripple_number).padStart(5, "0") : "00000";
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Ripple Public Library · Circulation Card</p>
      <div className="mx-auto mt-8 grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-sm bg-[#f3ecd9] p-4 shadow-lg ring-1 ring-black/10 rotate-[-0.4deg]">
          <div className="aspect-[3/4] w-full overflow-hidden bg-black/5">
            <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover sepia-[0.15]" />
          </div>
          <p className="mt-3 text-center font-serif italic text-stone-700">{moment.tagline}</p>
        </div>
        <div className="rounded-sm bg-[#f6efdc] p-5 shadow-lg ring-1 ring-black/10 rotate-[0.3deg]">
          <div className="border-b-2 border-stone-800/70 pb-2">
            <p className="font-serif text-[13px] uppercase tracking-[0.3em] text-stone-800">Ripple Public Library</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">Est. MMXXV · Circulation Desk</p>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_1fr] gap-4 text-[11px] uppercase tracking-[0.18em] text-stone-500">
            <div>
              <p>Accession No.</p>
              <p className="mt-0.5 font-mono text-[16px] normal-case tracking-widest text-stone-800">RS-{acc}</p>
            </div>
            <div>
              <p>Collection</p>
              <p className="mt-0.5 font-serif text-[14px] normal-case tracking-normal italic text-stone-800">
                {moment.narrative_device || "Everyday Stories"}
              </p>
            </div>
          </div>
          <table className="mt-4 w-full border-collapse text-[12px] text-stone-700">
            <thead>
              <tr className="border-y border-stone-500/50 text-[10px] uppercase tracking-[0.2em] text-stone-500">
                <th className="py-1 text-left">Date Borrowed</th>
                <th className="py-1 text-left">Borrower</th>
                <th className="py-1 text-left">Date Due</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-dashed border-stone-500/40">
                <td className="py-1">{borrow}</td>
                <td className="py-1 font-serif italic normal-case tracking-normal">a stranger</td>
                <td className="py-1">{returnBy}</td>
              </tr>
              <tr className="border-b border-dashed border-stone-500/40">
                <td className="py-1 text-stone-400">— — —</td>
                <td className="py-1 text-stone-400">— — —</td>
                <td className="py-1 text-stone-400">— — —</td>
              </tr>
              <tr className="border-b border-dashed border-stone-500/40">
                <td className="py-1 text-stone-400">— — —</td>
                <td className="py-1 text-stone-400">— — —</td>
                <td className="py-1 text-stone-400">— — —</td>
              </tr>
            </tbody>
          </table>
          {/* Stamps */}
          <div className="relative mt-6 h-24">
            <div className="absolute left-2 top-0 rotate-[-6deg] rounded-sm border-2 border-red-800/70 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-red-800/80">
              Returned
            </div>
            <div className="absolute left-24 top-6 rotate-[4deg] rounded-full border-2 border-emerald-800/70 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-emerald-800/80">
              Ripple Studio · {fmtDate(moment.created_at, { year: "numeric" })}
            </div>
          </div>
          <p className="mt-4 border-t border-stone-500/40 pt-3 font-serif italic text-[13px] text-stone-700">
            "This memory was borrowed from life."
          </p>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 4. PASSPORT STAMP                                             */
/* ============================================================ */
export function PassportLayout({ moment }: Props) {
  const dateStamp = fmtDate(moment.created_at, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const destination = (moment.giver_location || moment.receiver_location || "Interior · The Self").toUpperCase();
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Memory Passport · Emotional Immigration</p>
      <div className="mx-auto mt-8 max-w-3xl rounded-[3px] bg-[#e8e2cf] p-8 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        <div className="flex items-baseline justify-between border-b border-stone-500/40 pb-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.32em] text-stone-500">Passport</p>
            <p className="font-serif text-xl italic text-stone-800">of a private life</p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-stone-600">
            NO. RS-{moment.ripple_number ?? "—"}
          </p>
        </div>
        <div className="mt-6 grid grid-cols-[1fr_1.4fr] gap-8">
          <div className="rounded-sm bg-white/60 p-2 ring-1 ring-black/10">
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
            </div>
            <p className="mt-2 text-center font-serif italic text-[13px] text-stone-700">{moment.tagline}</p>
          </div>
          <div className="relative">
            <dl className="space-y-3 text-[11px] uppercase tracking-[0.2em] text-stone-500">
              <div>
                <dt>Journey title</dt>
                <dd className="mt-0.5 font-serif text-[16px] normal-case tracking-normal italic text-stone-800">
                  {moment.narrative_device || "Beginning Again"}
                </dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd className="mt-0.5 font-mono text-[14px] normal-case tracking-widest text-stone-800">{destination}</dd>
              </div>
              <div>
                <dt>Date of Passage</dt>
                <dd className="mt-0.5 font-mono text-[14px] normal-case tracking-widest text-stone-800">{dateStamp}</dd>
              </div>
            </dl>
            {/* Immigration stamp */}
            <div className="pointer-events-none absolute -right-2 bottom-0 rotate-[-8deg]">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-blue-800/70 text-blue-800/80">
                <div className="absolute inset-2 rounded-full border border-blue-800/50" />
                <div className="text-center font-mono text-[9px] uppercase leading-tight tracking-widest">
                  <p>Admitted</p>
                  <p className="mt-1 text-[10px]">{dateStamp}</p>
                  <p className="mt-1">★ Ripple ★</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 border-t border-stone-500/40 pt-4 text-center font-serif italic text-stone-700">
          Some borders are only ever crossed once.
        </p>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 5. CONTACT SHEET (professional, red grease-pencil)            */
/* ============================================================ */
export function ContactSheetProLayout({ moment }: Props) {
  const frames = Array.from({ length: 12 }, (_, i) => i + 1);
  const hero = 7; // selected frame
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Contact Sheet · Roll 037 · Frame {hero} selected</p>
      <div className="mx-auto mt-8 max-w-4xl rounded-sm bg-neutral-900 p-4 shadow-2xl">
        <div className="grid grid-cols-4 gap-2">
          {frames.map((n) => {
            const isHero = n === hero;
            return (
              <div key={n} className="relative">
                <div className={"aspect-square w-full overflow-hidden bg-black " + (isHero ? "ring-2 ring-red-500" : "opacity-90")}>
                  <img
                    src={moment.card_image_url}
                    alt=""
                    className={"h-full w-full object-cover " + (isHero ? "" : "opacity-70 saturate-50 blur-[0.5px]")}
                    style={isHero ? undefined : { objectPosition: `${(n * 17) % 100}% ${(n * 29) % 100}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between px-0.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400">
                  <span>{String(n).padStart(2, "0")}A</span>
                  <span className="text-red-500/90">{isHero ? "◉" : "○"}</span>
                </div>
                {isHero && (
                  <>
                    {/* Grease-pencil circle */}
                    <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-2">
                      <ellipse cx="50" cy="50" rx="46" ry="44" fill="none" stroke="rgba(255,60,60,0.85)" strokeWidth="2.4" strokeDasharray="6 3" />
                      <ellipse cx="50" cy="50" rx="44" ry="42" fill="none" stroke="rgba(255,60,60,0.6)" strokeWidth="1.6" />
                    </svg>
                    <div className="pointer-events-none absolute -right-3 -top-3 rotate-[12deg] font-serif text-[13px] italic text-red-400">
                      YES →
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 border-t border-neutral-700 pt-3 text-[10px] uppercase tracking-[0.24em] text-neutral-400">
          Ripple Studio · TX-{moment.ripple_number ?? "000"} · Selected: frame {String(hero).padStart(2, "0")}A ·
          <span className="ml-2 font-serif italic normal-case tracking-normal text-neutral-200">"{moment.tagline}"</span>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 6. FILM NEGATIVE                                              */
/* ============================================================ */
export function FilmNegativeLayout({ moment }: Props) {
  const frames = [0, 1, 2, 3];
  return (
    <PageShell moment={moment} tone="bg-neutral-950 text-neutral-100">
      <p className="text-center text-[10px] uppercase tracking-[0.32em] text-neutral-400">
        Kodak Portra 400 · developed · Roll RS-{moment.ripple_number ?? "—"}
      </p>
      <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-sm bg-neutral-900 p-4 shadow-2xl">
        <div className="relative overflow-hidden rounded-sm bg-[#4a3a20] p-2">
          {/* Sprockets top */}
          <div className="flex justify-between px-2 pb-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-1.5 w-2 rounded-sm bg-black/60" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {frames.map((i) => (
              <div key={i} className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                <img
                  src={moment.card_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    filter: "invert(1) sepia(0.7) hue-rotate(160deg) saturate(1.4) contrast(1.1)",
                    objectPosition: `${i * 25}% center`,
                  }}
                />
                {/* Light leak */}
                {i === 1 && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,120,60,0.55),transparent_55%)]" />
                )}
                <div className="absolute bottom-1 left-1 font-mono text-[8px] tracking-widest text-orange-300/80">
                  KODAK 400TX · {String(23 + i).padStart(2, "0")}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 pt-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="h-1.5 w-2 rounded-sm bg-black/60" />
            ))}
          </div>
        </div>
        <p className="mt-6 text-center font-serif italic text-neutral-300">"{moment.tagline}"</p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-[0.22em] text-neutral-500">
          Recovered from an unlabelled roll · {fmtDate(moment.created_at)}
        </p>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 7. CASSETTE TAPE                                              */
/* ============================================================ */
export function CassetteLayout({ moment }: Props) {
  const tracksA = ["1. First Look", "2. Small Kindness", "3. The Long Pause"];
  const tracksB = ["1. Reply, Later", "2. Same Sky", "3. Kept"];
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Mixtape · From one stranger to another · Play loud</p>
      <div className="mx-auto mt-8 max-w-3xl rotate-[-0.4deg] rounded-[4px] bg-[#f0e7d1] p-6 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
        {/* Cassette body */}
        <div className="relative overflow-hidden rounded-[6px] bg-[#e6d9b8] p-4 shadow-inner ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b border-stone-500/40 pb-2">
            <p className="font-mono text-[11px] uppercase tracking-widest text-stone-700">Ripple · C-60</p>
            <p className="font-mono text-[11px] uppercase tracking-widest text-stone-700">
              Rec. {fmtDate(moment.created_at, { month: "2-digit", day: "2-digit", year: "2-digit" })}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-6">
            <div>
              <p className="font-serif text-lg italic text-stone-800">Side A</p>
              <ul className="mt-2 space-y-1 font-serif text-[13px] italic text-stone-700">
                {tracksA.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-serif text-lg italic text-stone-800">Side B</p>
              <ul className="mt-2 space-y-1 font-serif text-[13px] italic text-stone-700">
                {tracksB.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          {/* Reels */}
          <div className="mt-6 flex items-center justify-center gap-16">
            <div className="relative h-16 w-16 rounded-full bg-neutral-800 shadow-inner">
              <div className="absolute inset-2 rounded-full border-2 border-neutral-500" />
              <div className="absolute inset-6 rounded-full bg-neutral-700" />
            </div>
            <div className="h-8 flex-1 max-w-[140px] rounded-sm bg-neutral-800 shadow-inner" />
            <div className="relative h-16 w-16 rounded-full bg-neutral-800 shadow-inner">
              <div className="absolute inset-2 rounded-full border-2 border-neutral-500" />
              <div className="absolute inset-6 rounded-full bg-neutral-700" />
            </div>
          </div>
        </div>
        {/* Album art card + tagline */}
        <div className="mt-6 grid grid-cols-[1fr_1.4fr] gap-4">
          <div className="aspect-square w-full overflow-hidden rounded-sm bg-black shadow ring-1 ring-black/20">
            <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-serif text-[22px] italic leading-tight text-stone-800">{moment.tagline}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-stone-500">
              Home recording · dedicated to whoever is listening
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 8. MATCHBOX — outside + inside                                */
/* ============================================================ */
export function MatchboxLayout({ moment }: Props) {
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Matchbook · Ripple &amp; Co. · One tiny spark</p>
      <div className="mx-auto mt-8 grid max-w-4xl gap-8 lg:grid-cols-2">
        {/* Outside */}
        <div className="rotate-[-1deg] rounded-[3px] bg-[#a83a2b] p-2 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/20">
          <div className="rounded-sm border-2 border-[#f3e0b3] p-3 text-center text-[#f3e0b3]">
            <p className="font-serif text-[10px] uppercase tracking-[0.32em] opacity-80">Ripple &amp; Co.</p>
            <div className="mt-3 aspect-square w-full overflow-hidden rounded-sm border border-[#f3e0b3]/60 bg-black/30">
              <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" style={{ filter: "saturate(0.85) contrast(1.05)" }} />
            </div>
            <p className="mt-3 font-serif text-xl italic leading-tight">{moment.tagline}</p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.32em] opacity-80">Safety Matches · 32 count</p>
            {/* Striker strip */}
            <div className="mx-auto mt-3 h-3 w-3/4 rounded-sm bg-[#4a2a1a] shadow-inner" />
          </div>
        </div>
        {/* Inside */}
        <div className="rotate-[0.8deg] rounded-[3px] bg-[#f0e2c2] p-6 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/10">
          <p className="text-[9px] uppercase tracking-[0.32em] text-stone-500">Inside the box</p>
          {/* Matches */}
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-[#a83a2b]" />
                <div className="h-16 w-[3px] bg-[#e6cfa2]" />
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-stone-500/40 pt-4">
            <p className="font-serif text-[17px] italic leading-relaxed text-stone-800">
              "One tiny spark changed everything."
            </p>
            <p className="mt-3 font-serif text-[13px] leading-relaxed text-stone-700">
              {moment.interpretation}
            </p>
          </div>
          <p className="mt-6 text-right text-[9px] uppercase tracking-[0.28em] text-stone-500">
            Struck on {fmtDate(moment.created_at)} · No. {moment.ripple_number ?? "—"}
          </p>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 9. MUSEUM ARCHIVE TAG (storage, not gallery)                  */
/* ============================================================ */
export function ArchiveTagLayout({ moment }: Props) {
  const acc = moment.ripple_number ? String(moment.ripple_number).padStart(6, "0") : "000000";
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Museum Storage · Not on display · Archive access only</p>
      <div className="mx-auto mt-8 grid max-w-5xl gap-10 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Wrapped artefact */}
        <div className="relative overflow-hidden rounded-sm bg-neutral-100 p-6 shadow-inner ring-1 ring-black/10">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-white ring-1 ring-black/10">
            <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
            {/* Acid-free tissue overlay */}
            <div className="pointer-events-none absolute inset-0 bg-white/25 mix-blend-screen" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,transparent_40%,transparent_60%,rgba(255,255,255,0.35)_100%)]" />
          </div>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.28em] text-stone-500">
            Wrapped in acid-free tissue · handle with cotton gloves
          </p>
        </div>
        {/* Tag on string */}
        <div className="relative">
          <div className="mx-auto h-8 w-px bg-stone-500/50" />
          <div className="mx-auto -mt-1 h-3 w-3 rounded-full border border-stone-600/60 bg-white" />
          <div className="mx-auto mt-2 max-w-sm rotate-[-1.2deg] rounded-sm bg-[#f7f0dd] p-5 shadow-[0_16px_28px_-16px_rgba(0,0,0,0.35)] ring-1 ring-black/15">
            <p className="text-center text-[10px] uppercase tracking-[0.32em] text-stone-500">
              Ripple Studio Archive
            </p>
            <p className="mt-1 text-center font-serif text-[13px] italic text-stone-800">
              Object Record
            </p>
            <dl className="mt-4 space-y-2 text-[11px] uppercase tracking-[0.2em] text-stone-500">
              {[
                ["Accession", `RS-${acc}`],
                ["Object", moment.narrative_device || "Ripple Moment"],
                ["Collection", "Everyday Kindnesses"],
                ["Origin", moment.giver_location || "unrecorded"],
                ["Condition", "Fragile · light-sensitive"],
                ["Acquired", fmtDate(moment.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-stone-500/40 pb-1">
                  <dt>{k}</dt>
                  <dd className="max-w-[60%] text-right font-serif text-[12px] normal-case tracking-normal italic text-stone-800">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-stone-500/40 pt-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">Curator's note</p>
              <p className="mt-1 font-serif text-[12px] italic leading-relaxed text-stone-700">
                "{moment.tagline}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* ============================================================ */
/* 10. CAFÉ RECEIPT                                              */
/* ============================================================ */
export function CafeReceiptLayout({ moment }: Props) {
  const time = new Date(moment.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const items: Array<[string, string]> = [
    ["Hope", "1"],
    ["Kindness", "1"],
    ["A quiet minute", "2"],
    ["Regret", "0"],
    ["Small talk", "1"],
  ];
  return (
    <PageShell moment={moment}>
      <p className="eyebrow text-center">Café Ripple · Table 07 · Thank you, come again</p>
      <div className="mx-auto mt-8 max-w-4xl grid gap-10 lg:grid-cols-[1fr_0.8fr] items-start">
        <div className="rotate-[-0.3deg] overflow-hidden rounded-sm bg-white p-2 shadow-lg ring-1 ring-black/10">
          <div className="aspect-[4/3] w-full overflow-hidden bg-black">
            <img src={moment.card_image_url} alt={moment.tagline} className="h-full w-full object-cover" />
          </div>
          <p className="mt-2 text-center font-serif italic text-stone-600">{moment.tagline}</p>
        </div>
        {/* Receipt paper */}
        <div className="relative mx-auto w-full max-w-[280px] rotate-[1deg]">
          <div
            className="bg-[#faf7ee] p-5 font-mono text-[12px] leading-relaxed text-stone-800 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)] ring-1 ring-black/10"
            style={{
              WebkitMaskImage:
                "linear-gradient(#000,#000), radial-gradient(circle 4px at 6px 0, transparent 3px, #000 3.2px)",
            }}
          >
            <p className="text-center text-[13px] font-bold uppercase tracking-widest">Café Ripple</p>
            <p className="text-center text-[10px] uppercase tracking-widest text-stone-500">
              {moment.giver_location || "corner of somewhere"}
            </p>
            <p className="mt-1 text-center text-[10px] text-stone-500">
              {fmtDate(moment.created_at, { day: "2-digit", month: "2-digit", year: "numeric" })} · {time}
            </p>
            <div className="my-3 border-t border-dashed border-stone-500/60" />
            <p className="text-[10px] uppercase tracking-widest text-stone-500">Table 07 · Server: R.S.</p>
            <div className="my-2 border-t border-dashed border-stone-500/60" />
            <table className="w-full">
              <tbody>
                {items.map(([label, qty]) => (
                  <tr key={label}>
                    <td className="py-0.5">{label}</td>
                    <td className="py-0.5 text-right">{".".repeat(6)}</td>
                    <td className="py-0.5 pl-2 text-right tabular-nums">{qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="my-2 border-t border-dashed border-stone-500/60" />
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span>PRICELESS</span>
            </div>
            <div className="my-3 border-t border-dashed border-stone-500/60" />
            <p className="text-center text-[11px] italic">"{moment.tagline}"</p>
            <p className="mt-2 text-center text-[9px] uppercase tracking-widest text-stone-500">
              Ripple No. {moment.ripple_number ?? "—"} · Keep this
            </p>
            {/* Barcode */}
            <div className="mt-3 flex justify-center gap-[2px]">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-stone-800"
                  style={{ width: i % 3 === 0 ? 2 : 1, height: 32 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}