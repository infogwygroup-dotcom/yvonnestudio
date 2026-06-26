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
  // stages: 0 = folded letter sealed, 1 = unfolding, 2 = first page revealed,
  //         3 = ripple travelling, 4 = second page revealed, 5 = settled
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage === 1) {
      const t = setTimeout(() => setStage(2), 1400);
      return () => clearTimeout(t);
    }
    if (stage === 2) {
      const t = setTimeout(() => setStage(3), 1100);
      return () => clearTimeout(t);
    }
    if (stage === 3) {
      const t = setTimeout(() => setStage(4), 1400);
      return () => clearTimeout(t);
    }
    if (stage === 4) {
      const t = setTimeout(() => setStage(5), 1100);
      return () => clearTimeout(t);
    }
  }, [stage]);

  function tap() {
    if (stage === 0) setStage(1);
  }

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="mt-32">
      {stage === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <p className="eyebrow">Two moments. One story.</p>
          <h2 className="mt-4 font-serif text-2xl italic sm:text-3xl">
            Where it all began
          </h2>

          <button
            type="button"
            onClick={tap}
            aria-label="Unfold the letter"
            className="group mt-12 flex w-full flex-col items-center focus:outline-none"
          >
            <FoldedLetter />
            <span className="mt-8 font-serif text-base italic text-foreground/65">
              Every Ripple begins with two hearts that never met.
            </span>
            <span className="eyebrow mt-4 text-accent">Unfold the letter</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="mx-auto max-w-md text-center">
            <p className="eyebrow">Two moments. One story.</p>
            <h2 className="mt-4 font-serif text-2xl italic sm:text-3xl">
              Where it all began
            </h2>
          </div>

          {stage === 1 && (
            <div className="mx-auto mt-10">
              <FoldedLetter opening />
            </div>
          )}

          {stage >= 2 && (
            <div
              className={
                "page-unfold mt-20 " + (stage >= 5 ? "page-settle-down" : "")
              }
            >
              <JournalPage
                index={1}
                role="The Giver"
                sentence={giverSentence}
                photo={giverPhoto}
                date={formattedDate}
                align="image-left"
              />
            </div>
          )}

          {stage >= 3 && (
            <div className="relative mx-auto my-8 h-[120px] w-full max-w-md">
              <DownwardRipple persistent={stage >= 5} />
            </div>
          )}

          {stage >= 4 && (
            <div
              className={
                "page-unfold " + (stage >= 5 ? "page-settle-up" : "")
              }
            >
              <JournalPage
                index={2}
                role="The Receiver"
                sentence={receiverSentence}
                photo={receiverPhoto}
                date={formattedDate}
                align="image-right"
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function FoldedLetter({ opening = false }: { opening?: boolean }) {
  return (
    <div
      aria-hidden
      className={
        "relative mx-auto w-[320px] " +
        (opening
          ? "letter-lift"
          : "transition-transform duration-700 hover:-translate-y-[3px]")
      }
    >
      {/* slim folded letter — long horizontal stationery */}
      <div
        className={
          "letter-paper relative aspect-[16/5] w-full overflow-hidden " +
          (opening ? "letter-paper-open" : "")
        }
      >
        {/* cotton paper base + fibre noise */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.965_0.018_82)_0%,oklch(0.94_0.022_78)_100%)]" />
        <div className="absolute inset-0 opacity-[0.10] mix-blend-multiply [background-image:radial-gradient(oklch(0.45_0.04_55)_0.6px,transparent_0.6px),radial-gradient(oklch(0.45_0.04_55)_0.4px,transparent_0.4px)] [background-size:5px_5px,7px_7px] [background-position:0_0,2px_3px]" />
        {/* aged edges — soft vignette, no border */}
        <div className="absolute inset-0 [background:radial-gradient(120%_180%_at_50%_50%,transparent_60%,oklch(0.78_0.04_60/0.35)_100%)]" />
        {/* horizontal fold crease through middle */}
        <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-[oklch(0.75_0.03_60/0.45)]" />
        <div className="absolute inset-x-6 top-[calc(50%-1px)] h-px bg-[oklch(1_0_0/0.4)]" />

        {/* faint handwritten lines suggesting writing inside */}
        <div className="absolute left-8 right-16 top-[18%] space-y-[7px]">
          <span className="block h-[2px] w-full bg-[oklch(0.55_0.04_50/0.18)]" />
          <span className="block h-[2px] w-[88%] bg-[oklch(0.55_0.04_50/0.18)]" />
          <span className="block h-[2px] w-[72%] bg-[oklch(0.55_0.04_50/0.18)]" />
        </div>

        {/* small, off-center, imperfect hand-pressed wax dot */}
        <div
          className={
            "absolute right-[18%] top-[58%] h-6 w-6 -translate-y-1/2 " +
            (opening ? "wax-dot-break" : "")
          }
          style={{
            background:
              "radial-gradient(circle at 38% 32%, oklch(0.6 0.14 32) 0%, oklch(0.42 0.13 28) 60%, oklch(0.3 0.09 25) 100%)",
            borderRadius: "48% 52% 46% 54% / 52% 44% 56% 48%",
            transform: "rotate(-8deg)",
            boxShadow:
              "0 1px 2px oklch(0.2 0.04 40 / 0.35), inset 0 -1px 2px oklch(0.2 0.04 40 / 0.35), inset 0 1px 1px oklch(1 0 0 / 0.2)",
          }}
        />
      </div>
    </div>
  );
}

function DownwardRipple({ persistent = false }: { persistent?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full">
      <span className="ripple-ring-down" />
      <span className="ripple-ring-down" style={{ animationDelay: "0.6s" }} />
      {!persistent && <span className="ripple-ring-down" style={{ animationDelay: "1.2s" }} />}
      <span className="ripple-drop" />
      <span className="ripple-drop" style={{ animationDelay: "0.4s" }} />
      <span className="ripple-drop" style={{ animationDelay: "0.9s" }} />
    </div>
  );
}

function JournalPage({
  index,
  role,
  sentence,
  photo,
  date,
  align,
}: {
  index: number;
  role: string;
  sentence: string;
  photo: string;
  date: string;
  align: "image-left" | "image-right";
}) {
  const imageFirst = align === "image-left";
  const folio = String(index).padStart(2, "0");
  return (
    <article className="grid grid-cols-1 items-center gap-10 sm:grid-cols-12 sm:gap-14">
      <div
        className={
          "sm:col-span-7 " +
          (imageFirst ? "sm:order-1" : "sm:order-2")
        }
      >
        <img
          src={photo}
          alt=""
          className="block w-full object-cover"
          style={{ aspectRatio: "4 / 5" }}
          loading="lazy"
        />
      </div>
      <div
        className={
          "sm:col-span-5 " +
          (imageFirst ? "sm:order-2 sm:pl-2" : "sm:order-1 sm:pr-2")
        }
      >
        <div className="flex items-baseline gap-4">
          <span className="font-serif text-xs italic text-muted-foreground">
            — {folio} —
          </span>
          <span className="eyebrow">{role}</span>
        </div>
        <p className="type-in mt-6 font-serif text-2xl italic leading-[1.35] text-foreground/90 sm:text-[1.7rem]">
          &ldquo;{sentence}&rdquo;
        </p>
        <p className="mt-8 font-serif text-xs italic tracking-wide text-muted-foreground">
          {date}
        </p>
      </div>
    </article>
  );
}

