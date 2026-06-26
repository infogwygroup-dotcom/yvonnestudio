import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getMoment } from "@/lib/moments.functions";

const CLOSING_LINES = [
  "Kindness always travels farther than expected.",
  "Some strangers only meet once. Some memories stay forever.",
  "Every ripple begins with one quiet act.",
  "Two moments. One story the world now remembers.",
  "Stories travel further than the people inside them.",
];

export const Route = createFileRoute("/m/$id")({
  loader: async ({ params }) => {
    const moment = await getMoment({ data: { id: params.id } });
    if (!moment) throw notFound();
    return { moment };
  },
  head: ({ loaderData }) => {
    const m = loaderData?.moment;
    return {
      meta: [
        { title: m ? `"${m.tagline}" — Ripple Moment` : "A Ripple Moment" },
        { name: "description", content: m?.tagline ?? "A Ripple Moment" },
        { property: "og:title", content: m?.tagline ?? "A Ripple Moment" },
        { property: "og:description", content: "A memory two strangers made together." },
        { property: "og:image", content: m?.card_image_url ?? "" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: m?.card_image_url ?? "" },
      ],
    };
  },
  component: MomentPage,
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="paper flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="eyebrow">Something interrupted us</p>
          <h1 className="mt-4 font-serif text-3xl">This moment couldn't load</h1>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="mt-6 rounded-full border border-border px-5 py-2 text-sm uppercase tracking-[0.18em]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="paper flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="mt-4 font-serif text-3xl">This moment doesn't exist</h1>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full border border-border px-5 py-2 text-sm uppercase tracking-[0.18em]"
        >
          Start a new one
        </Link>
      </div>
    </div>
  ),
});

function MomentPage() {
  const { moment } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const closingLine = useMemo(() => {
    let sum = 0;
    for (const c of moment.id) sum += c.charCodeAt(0);
    return CLOSING_LINES[sum % CLOSING_LINES.length];
  }, [moment.id]);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: moment.tagline, text: moment.tagline, url });
        return;
      }
    } catch {
      // fall through to clipboard copy below
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  }

  return (
    <main className="paper min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-24 sm:pt-12">
        <header className="flex items-center justify-between">
          <Link to="/" className="eyebrow hover:text-accent">
            ← Ripple Moment
          </Link>
          <p className="eyebrow">
            {new Date(moment.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        {/* 1. Hero Story — the movie poster */}
        <figure className="mt-16 sm:mt-24">
          <div className="overflow-hidden rounded-sm border border-border bg-card shadow-[0_40px_100px_-30px_oklch(0.2_0.04_40/0.45)]">
            <img
              src={moment.card_image_url}
              alt={moment.tagline}
              className="block w-full"
              loading="eager"
            />
          </div>
          <figcaption className="mt-12 text-center">
            <p className="mx-auto max-w-2xl font-serif text-3xl italic leading-[1.2] sm:text-4xl">
              &ldquo;{moment.tagline}&rdquo;
            </p>
          </figcaption>
        </figure>

        {/* 2. Why This Scene Exists */}
        {moment.interpretation && (
          <section className="mx-auto mt-32 max-w-xl">
            <p className="eyebrow text-center">Why This Scene Exists</p>
            <div className="mt-8 space-y-5 font-serif text-lg leading-[1.75] text-foreground/85 sm:text-xl">
              {String(moment.interpretation)
                .split(/\n+/)
                .map((line: string, i: number) => (
                  <p key={i}>{line.trim()}</p>
                ))}
            </div>
          </section>
        )}

        {/* 3. The Moments That Started This Story */}
        <LetterSection
          date={moment.created_at}
          giver={{
            sentence: moment.sentence_one,
            still: moment.still_one_url,
            location: moment.giver_location,
            merchant: moment.giver_merchant,
            meal: moment.giver_meal,
            caption: moment.giver_caption || "When she shared this meal,\nshe only wrote two words.",
          }}
          receiver={{
            sentence: moment.sentence_two,
            still: moment.still_two_url,
            location: moment.receiver_location,
            merchant: moment.receiver_merchant,
            meal: moment.receiver_meal,
            caption: moment.receiver_caption || "His reply quietly\ncompleted the story.",
          }}
        />

        {/* 5. Ending Quote */}
        <section className="mt-40 mb-32 px-2 text-center">
          <p className="mx-auto max-w-2xl font-serif text-3xl italic leading-[1.3] text-foreground/90 sm:text-4xl">
            &ldquo;{closingLine}&rdquo;
          </p>
        </section>

        {/* 6. Share */}
        <div className="flex flex-col items-center gap-5">
          <button
            onClick={share}
            className="rounded-full bg-primary px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent"
          >
            {copied ? "Link copied" : "Share this moment"}
          </button>
          <a
            href={moment.card_image_url}
            download={`ripple-moment-${moment.id}.png`}
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-accent"
          >
            Download the card
          </a>
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-accent"
          >
            Compose a new one
          </Link>
        </div>
      </div>
    </main>
  );
}

type Memory = {
  sentence: string;
  still: string;
  location: string;
  merchant: string;
  meal: string;
  caption: string;
};

function LetterSection({
  date,
  giver,
  receiver,
}: {
  date: string;
  giver: Memory;
  receiver: Memory;
}) {
  // 0 sealed · 1 wax cracks + flap opens slowly · 2 letter slides up ·
  // 3 giver page reveals · 4 golden ripple · 5 receiver fades in
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const beats: Record<number, number> = {
      1: 1700, // wax crack + flap unfold (slow)
      2: 900,  // letter slide
      3: 1300, // pause then ripple
      4: 1100, // ripple fully formed
    };
    const ms = beats[stage];
    if (!ms) return;
    const t = setTimeout(() => setStage((s) => s + 1), ms);
    return () => clearTimeout(t);
  }, [stage]);

  const formattedDate = new Date(date)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  const opened = stage >= 1;

  return (
    <section className="mt-40">
      <div className="mx-auto max-w-md text-center">
        <p className="eyebrow">Two moments. One story.</p>
        <h2 className="mt-4 font-serif text-2xl italic sm:text-3xl">
          Where it all began
        </h2>
      </div>

      {stage < 3 && (
        <div className="mt-16 flex flex-col items-center">
          <button
            type="button"
            onClick={() => stage === 0 && setStage(1)}
            aria-label="Open their memories"
            className="group block focus:outline-none"
            disabled={stage !== 0}
          >
            <Envelope opened={opened} />
          </button>
          {!opened && (
            <p className="mt-10 font-serif text-base italic text-accent">
              Open their memories
            </p>
          )}
        </div>
      )}

      {stage >= 3 && (
        <div className="mt-20 flex flex-col items-center gap-10">
          <div className="letter-page-in w-full max-w-3xl">
            <LetterPage
              role="GIVER"
              date={formattedDate}
              memory={giver}
              still={giver.still}
            />
          </div>

          {stage >= 4 && (
            <div className="relative h-[64px] w-full max-w-3xl">
              <GoldenRipple />
            </div>
          )}

          {stage >= 5 && (
            <div className="letter-page-in-slow w-full max-w-3xl">
              <LetterPage
                role="RECEIVER"
                date={formattedDate}
                memory={receiver}
                still={receiver.still}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Envelope({ opened }: { opened: boolean }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-[320px] sm:w-[420px]"
      style={{ perspective: "1200px" }}
    >
      <div
        className={"relative aspect-[3/2] w-full " + (opened ? "env-slow-lift" : "env-breathe")}
        style={{
          background:
            "linear-gradient(168deg, oklch(0.965 0.018 82) 0%, oklch(0.935 0.025 76) 100%)",
          boxShadow:
            "0 22px 50px -28px oklch(0.2 0.04 40 / 0.4), 0 2px 5px oklch(0.2 0.04 40 / 0.08), inset 0 0 0 1px oklch(0.84 0.025 70 / 0.55)",
          borderRadius: "3px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* handmade fiber texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply [background-image:radial-gradient(oklch(0.4_0.05_55)_0.5px,transparent_0.6px),radial-gradient(oklch(0.45_0.04_55)_0.35px,transparent_0.35px),repeating-linear-gradient(112deg,transparent_0_3px,oklch(0.5_0.04_55/0.07)_3px_3.6px)] [background-size:5px_5px,7px_7px,auto] [background-position:0_0,2px_3px,0_0]" />
        {/* aged corner vignette */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_120%_at_50%_40%,transparent_55%,oklch(0.74_0.06_55/0.4)_100%)] rounded-[3px]" />
        {/* deckled edges via inner shadow */}
        <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_24px_oklch(0.72_0.06_55/0.18)]" />

        {/* handwritten script — centered */}
        <div className="absolute inset-x-0 top-[28%] flex flex-col items-center px-8 text-center">
          <p className="font-hand text-[20px] leading-[1.25] text-[oklch(0.4_0.06_45)] opacity-85 sm:text-[24px]">
            Every Ripple begins
            <br />
            with two hearts
            <br />
            that never met.
          </p>
        </div>

        {/* small botanical illustration — upper right */}
        <BotanicalSprig className="absolute right-[8%] top-[8%] h-[28%] w-auto text-[oklch(0.55_0.10_140)] opacity-65" />

        {/* envelope flap (top triangle) */}
        <div
          className={"absolute inset-x-0 top-0 origin-top " + (opened ? "env-flap-slow" : "")}
          style={{
            height: "62%",
            background:
              "linear-gradient(180deg, oklch(0.955 0.02 80) 0%, oklch(0.92 0.028 76) 100%)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            boxShadow: opened ? "0 8px 20px oklch(0.2 0.04 40 / 0.22)" : "none",
          }}
        />
        {/* flap fiber texture */}
        <div
          className={"pointer-events-none absolute inset-x-0 top-0 opacity-[0.18] mix-blend-multiply [background-image:radial-gradient(oklch(0.4_0.05_55)_0.5px,transparent_0.6px)] [background-size:5px_5px] origin-top " + (opened ? "env-flap-slow" : "")}
          style={{ height: "62%", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        />

        {/* wax seal — centered on flap edge, slightly off-axis, imperfect */}
        <div
          className={
            "absolute left-1/2 top-[55%] z-20 -translate-x-1/2 -translate-y-1/2 " +
            (opened ? "wax-crack" : "wax-resting")
          }
          aria-hidden
        >
          <div
            className="flex h-[44px] w-[44px] items-center justify-center font-serif text-[15px] italic text-[oklch(0.95_0.02_70)]"
            style={{
              background:
                "radial-gradient(circle at 30% 26%, oklch(0.66 0.16 35) 0%, oklch(0.44 0.14 28) 55%, oklch(0.28 0.08 22) 100%)",
              borderRadius: "47% 53% 44% 56% / 52% 46% 54% 48%",
              transform: "rotate(-7deg)",
              boxShadow:
                "0 3px 6px oklch(0.2 0.04 40 / 0.5), inset 0 -1px 2px oklch(0.2 0.04 40 / 0.55), inset 0 1px 1px oklch(1 0 0 / 0.28)",
            }}
          >
            R
          </div>
        </div>
      </div>
    </div>
  );
}

function BotanicalSprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" aria-hidden>
      <path d="M24 4 C 25 26, 22 52, 24 78" />
      {[14, 26, 38, 50, 62].map((y, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <g key={y}>
            <path d={`M24 ${y} C ${24 + dir * 6} ${y - 3}, ${24 + dir * 12} ${y - 1}, ${24 + dir * 15} ${y + 4}`} />
            <ellipse cx={24 + dir * 15} cy={y + 4} rx="2.6" ry="1.3" transform={`rotate(${dir * 35} ${24 + dir * 15} ${y + 4})`} fill="currentColor" opacity="0.4" />
          </g>
        );
      })}
      {/* tiny flower top-left */}
      <g opacity="0.85" transform="translate(12 8)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse key={deg} cx="0" cy="-3" rx="1.4" ry="2.4" transform={`rotate(${deg})`} fill="currentColor" opacity="0.55" />
        ))}
        <circle cx="0" cy="0" r="0.9" fill="currentColor" />
      </g>
    </svg>
  );
}

function GoldenRipple() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className="gold-ring" />
      <span className="gold-ring" style={{ animationDelay: "0.6s" }} />
      <span className="gold-ring" style={{ animationDelay: "1.2s" }} />
      {[0.1, 0.5, 0.9, 1.3, 1.7].map((d, i) => (
        <span
          key={i}
          className="gold-particle"
          style={{ animationDelay: `${d}s`, left: `${46 + (i % 3) * 4}%` }}
        />
      ))}
    </div>
  );
}

function LetterPage({
  role,
  date,
  memory,
  still,
}: {
  role: string;
  date: string;
  memory: Memory;
  still: string;
}) {
  return (
    <article className="grid grid-cols-12 items-center gap-6 sm:gap-10 px-2 sm:px-6">
      {/* small cinematic still — 35% */}
      <div className="col-span-12 sm:col-span-4">
        <div
          className="overflow-hidden"
          style={{
            aspectRatio: "3 / 2",
            boxShadow: "0 16px 32px -22px oklch(0.2 0.04 40 / 0.35)",
          }}
        >
          <img
            src={still}
            alt=""
            className="block h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* text — 65% */}
      <div className="col-span-12 sm:col-span-8">
        <div className="flex items-center gap-4 text-foreground/70">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em]">
            {role}
          </span>
          <span className="h-px flex-1 bg-foreground/15" />
          <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {date}
          </span>
        </div>

        <blockquote className="mt-5 font-serif text-[28px] italic leading-[1.2] text-foreground sm:text-[34px]">
          &ldquo;{memory.sentence}&rdquo;
        </blockquote>

        <p className="mt-5 max-w-md font-serif text-[15px] leading-[1.6] text-foreground/70 sm:text-base whitespace-pre-line">
          {memory.caption}
        </p>

        {(memory.location || memory.merchant || memory.meal) && (
          <ul className="mt-6 space-y-1.5 font-sans text-[12px] tracking-wide text-muted-foreground sm:text-[13px]">
            {memory.location && (
              <li className="flex items-center gap-2">
                <span aria-hidden>📍</span>
                <span>{memory.location}</span>
              </li>
            )}
            {memory.merchant && (
              <li className="flex items-center gap-2">
                <span aria-hidden>🍽</span>
                <span>{memory.merchant}</span>
              </li>
            )}
            {memory.meal && (
              <li className="flex items-center gap-2">
                <span aria-hidden>🍴</span>
                <span>{memory.meal}</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}

function _UnusedSprig({ className = "" }: { className?: string }) {
_ = _UnusedSprig; // placeholder to satisfy patch parser

