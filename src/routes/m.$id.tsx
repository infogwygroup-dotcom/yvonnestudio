import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
            still: moment.photo_one_url,
            location: moment.giver_location,
            merchant: moment.giver_merchant,
            meal: moment.giver_meal,
            caption: moment.giver_caption || "When she shared this meal,\nshe only wrote two words.",
          }}
          receiver={{
            sentence: moment.sentence_two,
            still: moment.photo_two_url,
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
      1: 1800, // wax melts warmly · envelope drifts upward
      2: 200,  // tiny breath before letters arrive
      3: 1200, // pause, then ripple
      4: 1300, // ripple fully formed
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
        <div className="relative mt-16 flex h-[200px] flex-col items-center sm:h-[240px]">
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
            <p className="mt-10 font-serif text-base italic text-accent animate-pulse">
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
              <WaterRipple />
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
  const sealRef = useRef<HTMLDivElement | null>(null);
  const handleSealMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = sealRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    // clamp to inside the seal so the catchlight stays believable
    const mx = Math.max(10, Math.min(85, x));
    const my = Math.max(8, Math.min(80, y));
    el.style.setProperty("--mx", `${mx}%`);
    el.style.setProperty("--my", `${my}%`);
    el.style.setProperty("--light", "1");
  };
  const handleSealLeave = () => {
    const el = sealRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "30%");
    el.style.setProperty("--my", "22%");
    el.style.setProperty("--light", "0");
  };
  return (
    <div
      aria-hidden
      className={"envelope-interactive relative mx-auto w-[340px] sm:w-[480px] " + (opened ? "env-dissolve" : "")}
      style={{ perspective: "1200px" }}
    >
      <div
        className={"relative aspect-[2.6/1] w-full " + (opened ? "" : "env-breathe")}
        style={{
          background:
            "linear-gradient(168deg, oklch(0.97 0.02 84) 0%, oklch(0.93 0.03 76) 60%, oklch(0.905 0.035 72) 100%)",
          boxShadow:
            "0 30px 60px -28px oklch(0.18 0.04 40 / 0.5), 0 4px 8px oklch(0.2 0.04 40 / 0.12), inset 0 0 0 1px oklch(0.82 0.03 70 / 0.55), inset 0 0 60px oklch(0.6 0.06 55 / 0.06)",
          borderRadius: "4px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* handmade fiber texture — denser cotton paper grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply [background-image:radial-gradient(oklch(0.38_0.05_55)_0.55px,transparent_0.7px),radial-gradient(oklch(0.46_0.04_55)_0.32px,transparent_0.4px),radial-gradient(oklch(0.5_0.03_55)_0.25px,transparent_0.3px)] [background-size:4px_4px,6px_6px,9px_9px] [background-position:0_0,2px_3px,1px_4px]" />
        {/* laid lines — subtle horizontal weave of handmade paper */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-multiply [background-image:repeating-linear-gradient(0deg,transparent_0_2px,oklch(0.35_0.04_55/0.5)_2px_2.3px),repeating-linear-gradient(90deg,transparent_0_18px,oklch(0.35_0.04_55/0.3)_18px_18.4px)]" />
        {/* soft cotton fiber streaks */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply [background-image:repeating-linear-gradient(108deg,transparent_0_3px,oklch(0.48_0.04_55/0.18)_3px_3.6px),repeating-linear-gradient(-72deg,transparent_0_5px,oklch(0.5_0.03_55/0.12)_5px_5.7px)]" />
        {/* aged warm vignette */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(130%_120%_at_50%_45%,transparent_50%,oklch(0.7_0.07_55/0.45)_100%)] rounded-[4px]" />
        {/* tea stain blush — top right */}
        <div className="pointer-events-none absolute -top-[8%] right-[6%] h-[55%] w-[28%] rounded-full opacity-30 mix-blend-multiply" style={{ background: "radial-gradient(circle, oklch(0.7 0.08 55 / 0.6) 0%, transparent 70%)" }} />
        {/* second tea stain — lower left, asymmetric aging */}
        <div className="pointer-events-none absolute bottom-[2%] left-[18%] h-[36%] w-[22%] rounded-full opacity-20 mix-blend-multiply" style={{ background: "radial-gradient(circle, oklch(0.66 0.09 50 / 0.55) 0%, transparent 70%)" }} />
        {/* deckled edges via inner shadow */}
        <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_28px_oklch(0.66_0.07_55/0.28),inset_0_0_2px_oklch(0.6_0.06_55/0.5)] rounded-[4px]" />

        {/* corner postmark — tiny vintage round stamp, lower-right corner */}
        <div
          className="pointer-events-none absolute right-[4%] top-[58%] z-[5] flex h-[34px] w-[34px] items-center justify-center rounded-full opacity-70 sm:h-[40px] sm:w-[40px]"
          style={{
            transform: "rotate(-14deg)",
            border: "1px solid oklch(0.42 0.10 30 / 0.55)",
            color: "oklch(0.42 0.10 30 / 0.7)",
            boxShadow: "inset 0 0 0 3px oklch(0.97 0.02 84 / 0), inset 0 0 0 4px oklch(0.42 0.10 30 / 0.25)",
          }}
        >
          <div className="text-center font-serif" style={{ fontSize: "6px", letterSpacing: "0.1em", lineHeight: 1.1 }}>
            <div style={{ fontStyle: "italic", fontSize: "9px" }}>R · M</div>
            <div className="mt-[1px]">RIPPLE</div>
            <div>MOMENT</div>
          </div>
        </div>

        {/* horizontal ruled line under handwritten text — like an address line */}
        <div
          className="pointer-events-none absolute left-[8%] right-[36%] opacity-25"
          style={{
            top: "88%",
            height: "1px",
            background: "repeating-linear-gradient(90deg, oklch(0.42 0.06 50 / 0.5) 0 4px, transparent 4px 7px)",
          }}
        />

        {/* handwritten script — fully visible from the start, below the flap (flap ends 38%) */}
        <div className="absolute left-[8%] right-[34%] top-[50%]">
          <p className="font-hand text-[15px] leading-[1.35] text-[oklch(0.36_0.08_42)] opacity-95 sm:text-[19px]" style={{ transform: "rotate(-1.5deg)", transformOrigin: "left top" }}>
            Every Ripple begins
            <br />
            with two hearts
            <br />
            that never met.
          </p>
        </div>

        {/* botanical illustration — right side, gracefully arching down */}
        <BotanicalSprig className="absolute right-[8%] top-[44%] h-[52%] w-auto text-[oklch(0.46_0.10_140)] opacity-60" />

        {/* envelope flap (shallow trapezoid at top — shortened so script/sprig stay clear) */}
        <div
          className="absolute inset-x-0 top-0 origin-top"
          style={{
            height: "38%",
            background:
              "linear-gradient(180deg, oklch(0.96 0.022 82) 0%, oklch(0.92 0.03 76) 70%, oklch(0.88 0.035 72) 100%)",
            clipPath: "polygon(0 0, 100% 0, 62% 100%, 38% 100%)",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            boxShadow: opened
              ? "0 12px 28px oklch(0.2 0.04 40 / 0.28), inset 0 -1px 2px oklch(0.6 0.06 55 / 0.25)"
              : "inset 0 -1px 2px oklch(0.6 0.06 55 / 0.18)",
          }}
        />
        {/* flap fiber texture */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 opacity-[0.22] mix-blend-multiply [background-image:radial-gradient(oklch(0.38_0.05_55)_0.5px,transparent_0.6px),repeating-linear-gradient(108deg,transparent_0_3px,oklch(0.48_0.04_55/0.18)_3px_3.6px)] [background-size:4px_4px,auto] origin-top"
          style={{ height: "38%", clipPath: "polygon(0 0, 100% 0, 62% 100%, 38% 100%)" }}
        />
        {/* flap crease shadow at base */}
        <div
          className="pointer-events-none absolute inset-x-0 opacity-50"
          style={{
            top: "calc(38% - 1px)",
            height: "2px",
            background: "linear-gradient(180deg, oklch(0.55 0.06 55 / 0.35), transparent)",
            clipPath: "polygon(38% 0, 62% 0, 62% 100%, 38% 100%)",
          }}
        />
        {/* side flap shadows — left/right folds give the envelope depth */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[18%] opacity-[0.16] mix-blend-multiply"
          style={{ background: "linear-gradient(90deg, oklch(0.55 0.06 55 / 0.45), transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[18%] opacity-[0.16] mix-blend-multiply"
          style={{ background: "linear-gradient(270deg, oklch(0.55 0.06 55 / 0.45), transparent)" }}
        />

        {/* warm golden dust — gentle motes rising like sunlit pollen */}
        {opened && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
            {Array.from({ length: 14 }).map((_, i) => {
              const left = 18 + (i * 67) % 64;
              const delay = (i * 90) % 800;
              const drift = (i % 2 === 0 ? -1 : 1) * (6 + (i % 4) * 4);
              const size = 3 + (i % 3);
              return (
                <span
                  key={i}
                  className="warm-mote"
                  style={{
                    left: `${left}%`,
                    bottom: "30%",
                    width: `${size}px`,
                    height: `${size}px`,
                    ['--drift' as never]: `${drift}px`,
                    animationDelay: `${delay}ms`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* wax seal — sits on the flap point, doesn't overlap script/sprig */}
        <div
          ref={sealRef}
          onPointerMove={handleSealMove}
          onPointerLeave={handleSealLeave}
          className={
            "absolute left-1/2 top-[38%] z-20 -translate-x-1/2 -translate-y-1/2 " +
            (opened ? "wax-melt" : "wax-resting")
          }
          aria-hidden
        >
          <WaxSeal />
        </div>

        {/* soft glow that blooms outward as the envelope dissolves */}
        {opened && (
          <div
            className="env-bloom pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.96 0.08 60 / 0.55) 0%, oklch(0.92 0.06 55 / 0.2) 40%, transparent 70%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

function WaxSeal() {
  return (
    <div
      className="relative h-[44px] w-[44px] sm:h-[52px] sm:w-[52px]"
      style={{ transform: "rotate(-9deg)" }}
    >
      {/* drip blobs underneath — irregular molten edge with shading */}
      <span
        className="absolute -bottom-[5px] left-[4px] h-[13px] w-[14px] opacity-95"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, oklch(0.72 0.16 32) 0%, oklch(0.46 0.18 28) 38%, oklch(0.22 0.08 22) 100%)",
          borderRadius: "58% 42% 62% 38% / 60% 50% 50% 40%",
          boxShadow:
            "0 2px 3px oklch(0.12 0.04 28 / 0.55), inset 0 1px 1px oklch(1 0 0 / 0.22), inset 0 -1px 2px oklch(0.14 0.04 28 / 0.6)",
        }}
      />
      <span
        className="absolute -top-[4px] right-[2px] h-[9px] w-[10px] opacity-90"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, oklch(0.70 0.16 32) 0%, oklch(0.44 0.18 28) 40%, oklch(0.22 0.08 22) 100%)",
          borderRadius: "52% 48% 40% 60% / 50% 60% 40% 50%",
          boxShadow:
            "0 1px 2px oklch(0.12 0.04 28 / 0.5), inset 0 1px 1px oklch(1 0 0 / 0.2), inset 0 -1px 2px oklch(0.14 0.04 28 / 0.55)",
        }}
      />
      <span
        className="absolute bottom-[1px] -right-[1px] h-[10px] w-[8px] opacity-80"
        style={{
          background:
            "radial-gradient(circle at 32% 30%, oklch(0.66 0.15 30) 0%, oklch(0.42 0.17 26) 40%, oklch(0.20 0.07 22) 100%)",
          borderRadius: "60% 40% 50% 50% / 55% 45% 55% 45%",
          boxShadow: "0 1px 2px oklch(0.12 0.04 28 / 0.5), inset 0 -1px 2px oklch(0.14 0.04 28 / 0.5)",
        }}
      />
      {/* main wax body */}
      <div
        className="wax-body relative flex h-full w-full items-center justify-center font-serif text-[16px] italic sm:text-[20px]"
        style={{
          background:
            "radial-gradient(circle at 28% 22%, oklch(0.74 0.16 34) 0%, oklch(0.56 0.18 30) 22%, oklch(0.40 0.18 28) 48%, oklch(0.26 0.11 24) 78%, oklch(0.15 0.06 22) 100%)",
          borderRadius: "46% 54% 44% 56% / 52% 46% 54% 48%",
          boxShadow:
            "0 5px 12px oklch(0.14 0.04 40 / 0.55), 0 2px 4px oklch(0.16 0.05 40 / 0.45), 0 1px 0 oklch(1 0 0 / 0.12), inset 0 -3.5px 5px oklch(0.12 0.04 40 / 0.62), inset 0 2.5px 3px oklch(1 0 0 / 0.32), inset 0 0 12px oklch(0.20 0.07 22 / 0.55), inset 0 0 0 0.6px oklch(0.10 0.03 22 / 0.5)",
          color: "oklch(0.26 0.08 25)",
          textShadow:
            "0 1px 0 oklch(1 0 0 / 0.28), 0 -1px 0 oklch(0.14 0.04 40 / 0.55), inset 0 -1px 0 oklch(0.12 0.04 40 / 0.6)",
        }}
      >
        {/* deep ambient occlusion around the edge */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, transparent 48%, oklch(0.12 0.04 22 / 0.45) 92%)",
          }}
        />
        {/* warm rim light from lower-right (counter-light) */}
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-70 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 78% 82%, oklch(0.78 0.14 38 / 0.55) 0%, transparent 32%)",
          }}
        />
        {/* speckled wax grain */}
        <span
          className="pointer-events-none absolute inset-0 opacity-55 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(circle at 70% 80%, oklch(0.14 0.04 40 / 0.75) 0%, transparent 32%), radial-gradient(circle at 18% 72%, oklch(0.92 0.02 60 / 0.35) 0%, transparent 22%), radial-gradient(circle at 82% 28%, oklch(0.9 0.04 30 / 0.25) 0%, transparent 22%)",
            borderRadius: "inherit",
          }}
        />
        {/* fine wax pitting texture */}
        <span
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0.12 0.04 22) 0.4px, transparent 0.6px), radial-gradient(oklch(0.18 0.05 22) 0.3px, transparent 0.5px)",
            backgroundSize: "3px 3px, 5px 5px",
            backgroundPosition: "0 0, 1px 2px",
            borderRadius: "inherit",
          }}
        />
        {/* micro crater pits — pressed wax imperfections */}
        <span
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            background:
              "radial-gradient(circle at 22% 38%, oklch(0.12 0.04 22 / 0.55) 0 0.6px, transparent 1.2px), radial-gradient(circle at 64% 30%, oklch(0.10 0.03 22 / 0.5) 0 0.5px, transparent 1.1px), radial-gradient(circle at 38% 72%, oklch(0.12 0.04 22 / 0.5) 0 0.5px, transparent 1.1px), radial-gradient(circle at 76% 60%, oklch(0.94 0.03 60 / 0.45) 0 0.4px, transparent 0.9px)",
            borderRadius: "inherit",
          }}
        />
        {/* embossed inner ring + outer rope border */}
        <span
          className="pointer-events-none absolute inset-[3px] rounded-[inherit]"
          style={{
            boxShadow:
              "inset 0 1.5px 1.5px oklch(0.14 0.04 40 / 0.55), inset 0 -1.5px 1.5px oklch(1 0 0 / 0.24), inset 0 0 0 0.5px oklch(0.18 0.05 25 / 0.5), inset 0 0 6px oklch(0.10 0.03 22 / 0.35)",
          }}
        />
        {/* dotted rope ring around monogram */}
        <span
          className="pointer-events-none absolute inset-[5px] rounded-[inherit] opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle, oklch(0.16 0.04 22 / 0.7) 0.6px, transparent 0.9px)",
            backgroundSize: "4px 4px",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 58%, black 60%, black 78%, transparent 80%)",
            maskImage:
              "radial-gradient(circle, transparent 58%, black 60%, black 78%, transparent 80%)",
          }}
        />
        <span
          className="relative"
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            letterSpacing: "0.02em",
            filter: "drop-shadow(0 0.5px 0 oklch(1 0 0 / 0.25)) drop-shadow(0 -0.5px 0 oklch(0.14 0.04 40 / 0.55))",
          }}
        >
          R
        </span>
        {/* animated specular highlight — drifts as if light shifts across the seal */}
        <span
          className="wax-specular pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen"
          style={{
            background:
              "radial-gradient(ellipse 40% 30% at 30% 22%, oklch(1 0 0 / 0.55) 0%, oklch(0.96 0.02 60 / 0.18) 35%, transparent 70%)",
          }}
        />
        {/* anisotropic streak — subtle wax sheen line */}
        <span
          className="wax-streak pointer-events-none absolute inset-0 rounded-[inherit] opacity-40 mix-blend-overlay"
          style={{
            background:
              "linear-gradient(118deg, transparent 38%, oklch(1 0 0 / 0.5) 50%, transparent 62%)",
          }}
        />
      </div>
      {/* primary highlight gloss — small bright catchlight */}
      <span
        className="pointer-events-none absolute left-[20%] top-[14%] h-[22%] w-[26%] rounded-full opacity-80 blur-[0.6px]"
        style={{ background: "radial-gradient(ellipse, oklch(1 0 0 / 0.85) 0%, oklch(1 0 0 / 0.25) 45%, transparent 75%)" }}
      />
      {/* secondary catchlight — tiny specular pinpoint */}
      <span
        className="pointer-events-none absolute left-[28%] top-[20%] h-[6%] w-[7%] rounded-full opacity-90"
        style={{ background: "oklch(1 0 0 / 0.95)", filter: "blur(0.3px)" }}
      />
      {/* tiny wax bubbles for realism */}
      <span className="pointer-events-none absolute right-[28%] top-[58%] h-[3px] w-[3px] rounded-full" style={{ background: "oklch(0.16 0.05 22)", opacity: 0.7 }} />
      <span className="pointer-events-none absolute left-[36%] bottom-[22%] h-[2px] w-[2px] rounded-full" style={{ background: "oklch(0.16 0.05 22)", opacity: 0.6 }} />
      <span className="pointer-events-none absolute right-[40%] bottom-[34%] h-[1.5px] w-[1.5px] rounded-full" style={{ background: "oklch(0.92 0.04 60)", opacity: 0.55 }} />
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

function WaterRipple() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* glossy water droplet centre */}
      <span className="water-drop" />
      <span className="water-ring" />
      <span className="water-ring" style={{ animationDelay: "0.7s" }} />
      <span className="water-ring" style={{ animationDelay: "1.4s" }} />
      {[0.1, 0.4, 0.7, 1.0, 1.3, 1.6, 2.0].map((d, i) => (
        <span
          key={i}
          className="water-splash"
          style={{ animationDelay: `${d}s`, left: `${40 + (i % 5) * 5}%` }}
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
    <article
      className="relative mx-auto w-full overflow-hidden rounded-[2px]"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.97 0.012 85) 0%, oklch(0.955 0.014 80) 100%)",
        boxShadow:
          "0 1px 0 oklch(0.86 0.02 75) inset, 0 30px 50px -34px oklch(0.25 0.05 40 / 0.35), 0 2px 0 oklch(0.88 0.02 75)",
      }}
    >
      {/* book spine shadow on the right edge to suggest an open page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-4"
        style={{
          background:
            "linear-gradient(270deg, oklch(0.78 0.03 65 / 0.35), transparent)",
        }}
      />

      <div className="grid grid-cols-12 items-center gap-3 px-4 py-5 sm:gap-6 sm:px-7 sm:py-7">
        {/* small landscape still — torn paper edge */}
        <div className="col-span-5">
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "4 / 3",
              boxShadow:
                "0 10px 22px -16px oklch(0.2 0.04 40 / 0.45)",
              clipPath:
                "polygon(1% 2%, 99% 0%, 100% 98%, 2% 100%, 0% 50%)",
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

        {/* text — 7/12 */}
        <div className="col-span-7 pr-1 sm:pr-3">
          <div className="flex items-center justify-between gap-3 text-foreground/70">
            <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.3em] text-accent sm:text-[10px]">
              {role}
            </span>
            <span className="font-sans text-[9px] uppercase tracking-[0.28em] text-muted-foreground sm:text-[10px]">
              {date}
            </span>
          </div>

          <blockquote className="mt-2 font-serif text-[18px] italic leading-[1.2] text-foreground sm:mt-3 sm:text-[26px]">
            &ldquo;{memory.sentence}&rdquo;
          </blockquote>

          <div className="mt-2 h-px w-10 bg-foreground/20 sm:mt-3 sm:w-14" />

          <p className="mt-2 font-serif text-[11px] leading-[1.55] text-foreground/70 sm:mt-3 sm:text-[13px] whitespace-pre-line">
            {memory.caption}
          </p>

          {(memory.location || memory.merchant || memory.meal) && (
            <ul className="mt-3 space-y-1 font-sans text-[10px] tracking-wide text-muted-foreground sm:mt-4 sm:text-[11px]">
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
      </div>
    </article>
  );
}


