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
          giverSentence={moment.sentence_one}
          giverPhoto={moment.photo_one_url}
          receiverSentence={moment.sentence_two}
          receiverPhoto={moment.photo_two_url}
          date={moment.created_at}
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

function LetterSection({
  giverSentence,
  giverPhoto,
  receiverSentence,
  receiverPhoto,
  date,
}: {
  giverSentence: string;
  giverPhoto: string;
  receiverSentence: string;
  receiverPhoto: string;
  date: string;
}) {
  // 0=sealed, 1=wax breaking + flap opening, 2=giver rising,
  // 3=ripple flowing, 4=receiver rising, 5=settled
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage === 1) {
      const t = setTimeout(() => setStage(2), 1100);
      return () => clearTimeout(t);
    }
    if (stage === 2) {
      const t = setTimeout(() => setStage(3), 1200);
      return () => clearTimeout(t);
    }
    if (stage === 3) {
      const t = setTimeout(() => setStage(4), 1100);
      return () => clearTimeout(t);
    }
    if (stage === 4) {
      const t = setTimeout(() => setStage(5), 1300);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const formattedDate = new Date(date)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <section className="mt-32">
      <div className="mx-auto max-w-md text-center">
        <p className="eyebrow">Two moments. One story.</p>
        <h2 className="mt-4 font-serif text-2xl italic sm:text-3xl">
          Where it all began
        </h2>
      </div>

      {stage === 0 && (
        <div className="mt-14 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setStage(1)}
            aria-label="Open their memories"
            className="group block focus:outline-none"
          >
            <Envelope />
          </button>
          <p className="mt-8 font-serif text-base italic text-accent">
            Open their memories
          </p>
          <svg
            className="mt-2 text-accent/70"
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            aria-hidden
          >
            <path d="M1 1l6 7 6-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {stage === 1 && (
        <div className="mt-14 flex justify-center">
          <Envelope opening />
        </div>
      )}

      {stage >= 2 && (
        <div className="mt-12 flex flex-col items-center gap-[24px]">
          <div className={"mem-rise w-full max-w-2xl " + (stage >= 5 ? "mem-settle-down" : "")}>
            <MemoryCard
              role="GIVER"
              date={formattedDate}
              photo={giverPhoto}
              quote={giverSentence}
              caption="When she shared this meal, she wrote only two words."
              sprigSide="right"
            />
          </div>

          {stage >= 3 && (
            <div className="relative h-[60px] w-full max-w-2xl">
              <RippleStream />
            </div>
          )}

          {stage >= 4 && (
            <div className={"mem-rise w-full max-w-2xl " + (stage >= 5 ? "mem-settle-up" : "")}>
              <MemoryCard
                role="RECEIVER"
                date={formattedDate}
                photo={receiverPhoto}
                quote={receiverSentence}
                caption="Her reply completed the story."
                sprigSide="right"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Envelope({ opening = false }: { opening?: boolean }) {
  return (
    <div
      aria-hidden
      className={
        "relative mx-auto w-[340px] sm:w-[420px] " +
        (opening ? "" : "transition-transform duration-500 group-hover:-translate-y-[4px]")
      }
      style={{ perspective: "900px" }}
    >
      {/* envelope body */}
      <div
        className={
          "relative aspect-[16/7] w-full overflow-hidden rounded-[10px] " +
          (opening ? "" : "env-rest")
        }
        style={{
          background:
            "linear-gradient(170deg, oklch(0.965 0.016 82) 0%, oklch(0.945 0.022 78) 100%)",
          boxShadow:
            "0 18px 40px -22px oklch(0.2 0.04 40 / 0.35), 0 2px 4px oklch(0.2 0.04 40 / 0.08), inset 0 0 0 1px oklch(0.86 0.02 70 / 0.6)",
        }}
      >
        {/* paper grain */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply [background-image:radial-gradient(oklch(0.45_0.04_55)_0.5px,transparent_0.5px),radial-gradient(oklch(0.45_0.04_55)_0.35px,transparent_0.35px)] [background-size:4px_4px,6px_6px] [background-position:0_0,2px_3px]" />
        {/* aged vignette */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(140%_140%_at_50%_30%,transparent_55%,oklch(0.78_0.05_55/0.35)_100%)]" />

        {/* handwritten script — top left */}
        <div className="absolute left-[7%] top-[18%] right-[42%]">
          <p className="font-hand text-[22px] leading-[1.15] text-[oklch(0.42_0.06_45)] sm:text-[26px]">
            Every Ripple begins
            <br />
            with two hearts that never met.
          </p>
        </div>

        {/* botanical sprig — right side */}
        <Sprig className="absolute right-[6%] top-[12%] h-[78%] w-auto text-[oklch(0.7_0.08_55)] opacity-80" />

        {/* envelope flap (top triangle) */}
        <div
          className={"absolute inset-x-0 top-0 origin-top " + (opening ? "env-flap-open" : "")}
          style={{
            height: "55%",
            background:
              "linear-gradient(180deg, oklch(0.955 0.018 80) 0%, oklch(0.93 0.024 76) 100%)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            boxShadow: opening ? "0 6px 16px oklch(0.2 0.04 40 / 0.18)" : "none",
          }}
        />

        {/* wax seal — small, centered on flap edge */}
        <div
          className={
            "absolute left-1/2 top-[50%] z-10 -translate-x-1/2 -translate-y-1/2 " +
            (opening ? "env-wax-break" : "")
          }
          aria-hidden
        >
          <div
            className="flex h-[34px] w-[34px] items-center justify-center text-[13px] font-serif italic text-[oklch(0.95_0.02_70)]"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, oklch(0.7 0.16 45) 0%, oklch(0.5 0.16 32) 55%, oklch(0.32 0.11 25) 100%)",
              borderRadius: "48% 52% 46% 54% / 52% 44% 56% 48%",
              transform: "rotate(-6deg)",
              boxShadow:
                "0 2px 3px oklch(0.2 0.04 40 / 0.4), inset 0 -1px 2px oklch(0.2 0.04 40 / 0.4), inset 0 1px 1px oklch(1 0 0 / 0.25)",
            }}
          >
            R
          </div>
        </div>
      </div>
    </div>
  );
}

function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 160"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M30 4 C 32 40, 28 90, 30 156" />
      {Array.from({ length: 7 }).map((_, i) => {
        const y = 18 + i * 18;
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <g key={i}>
            <path d={`M30 ${y} C ${30 + dir * 8} ${y - 4}, ${30 + dir * 18} ${y - 2}, ${30 + dir * 22} ${y + 6}`} />
            <ellipse
              cx={30 + dir * 22}
              cy={y + 6}
              rx="3"
              ry="1.6"
              transform={`rotate(${dir * 35} ${30 + dir * 22} ${y + 6})`}
              fill="currentColor"
              opacity="0.35"
            />
          </g>
        );
      })}
    </svg>
  );
}

function RippleStream() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className="pond-ring" />
      <span className="pond-ring" style={{ animationDelay: "0.7s" }} />
      <span className="pond-ring" style={{ animationDelay: "1.4s" }} />
      <span className="spark-fall" style={{ animationDelay: "0.1s" }} />
      <span className="spark-fall" style={{ animationDelay: "0.6s", left: "46%" }} />
      <span className="spark-fall" style={{ animationDelay: "1.0s", left: "54%" }} />
      <span className="spark-fall" style={{ animationDelay: "1.5s", left: "49%" }} />
    </div>
  );
}

function MemoryCard({
  role,
  date,
  photo,
  quote,
  caption,
  sprigSide = "right",
}: {
  role: string;
  date: string;
  photo: string;
  quote: string;
  caption: string;
  sprigSide?: "left" | "right";
}) {
  return (
    <article
      className="relative grid grid-cols-12 items-stretch gap-0 overflow-hidden rounded-[14px]"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.97 0.014 82) 0%, oklch(0.95 0.02 78) 100%)",
        boxShadow:
          "0 24px 48px -28px oklch(0.2 0.04 40 / 0.3), 0 2px 4px oklch(0.2 0.04 40 / 0.06), inset 0 0 0 1px oklch(0.88 0.02 70 / 0.55)",
      }}
    >
      {/* paper grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-multiply [background-image:radial-gradient(oklch(0.45_0.04_55)_0.5px,transparent_0.5px)] [background-size:5px_5px]" />

      {/* image */}
      <div className="col-span-12 sm:col-span-5">
        <div className="h-full p-4 sm:p-5">
          <div className="h-full overflow-hidden rounded-[6px]">
            <img
              src={photo}
              alt=""
              className="block h-full w-full object-cover"
              style={{ aspectRatio: "5 / 4" }}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* text */}
      <div className="relative col-span-12 flex flex-col justify-center p-6 pt-2 sm:col-span-7 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/70">
            {role}
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {date}
          </span>
        </div>

        <p className="mt-5 font-serif text-[28px] italic leading-[1.15] text-foreground sm:text-[32px]">
          &ldquo;{quote}&rdquo;
        </p>

        <p className="mt-5 font-serif text-[15px] italic leading-[1.55] text-foreground/65">
          {caption}
        </p>

        {/* faded botanical sprig behind right edge */}
        <Sprig
          className={
            "pointer-events-none absolute bottom-3 h-[70%] w-auto text-[oklch(0.72_0.07_55)] opacity-30 " +
            (sprigSide === "right" ? "right-3" : "left-3 scale-x-[-1]")
          }
        />
      </div>
    </article>
  );
}

