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
        <EnvelopeSection
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

function EnvelopeSection({
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
  // stages: 0 = sealed envelope, 1 = envelope opening, 2 = giver revealed,
  //         3 = ripple travelling, 4 = receiver revealed, 5 = settled / pulled together
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage === 1) {
      // envelope opening sequence ~1.5s before giver card settles
      const t = setTimeout(() => setStage(2), 1500);
      return () => clearTimeout(t);
    }
    if (stage === 2) {
      // pause, then ripple begins travelling
      const t = setTimeout(() => setStage(3), 900);
      return () => clearTimeout(t);
    }
    if (stage === 3) {
      // ripple travels, then receiver emerges
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

  return (
    <section className="mt-32">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <p className="eyebrow">Two moments. One story.</p>
        <h2 className="mt-4 font-serif text-2xl italic sm:text-3xl">
          Where it all began
        </h2>

        {stage === 0 ? (
          <button
            type="button"
            onClick={tap}
            aria-label="Open the envelope"
            className="group mt-10 flex w-full flex-col items-center focus:outline-none"
          >
            <Envelope state="sealed" />
            <span className="mt-8 font-serif text-base italic text-foreground/70">
              Some moments are worth unfolding
            </span>
            <span className="eyebrow mt-3 text-accent">Open their memories</span>
          </button>
        ) : (
          <div className="mt-10 flex w-full flex-col items-center">
            {/* Envelope animates open, then fades as the first card rises out of it */}
            {stage === 1 && (
              <div className="mb-[-40px]">
                <Envelope state="opening" />
              </div>
            )}

            {stage >= 2 && (
              <div
                className={
                  "card-rise " + (stage >= 5 ? "pull-down" : "")
                }
              >
                <OpenedCard
                  role="Giver"
                  sentence={giverSentence}
                  photo={giverPhoto}
                  date={date}
                  tilt={-2}
                />
              </div>
            )}

            {/* Ripple as the connector — 16px of breathing room on either side */}
            {stage >= 3 && (
              <div className="relative my-4 h-[88px] w-full">
                <DownwardRipple persistent={stage >= 5} />
              </div>
            )}

            {stage >= 4 && (
              <div
                className={
                  "card-rise " + (stage >= 5 ? "pull-up" : "")
                }
              >
                <OpenedCard
                  role="Receiver"
                  sentence={receiverSentence}
                  photo={receiverPhoto}
                  date={date}
                  tilt={2}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Envelope({ state }: { state: "sealed" | "opening" }) {
  const opening = state === "opening";
  return (
    <div
      aria-hidden
      className={
        "envelope relative mx-auto w-[280px] " +
        (opening ? "envelope-lift" : "transition-transform duration-500 hover:-translate-y-1")
      }
    >
      {/* Envelope body — cream textured stationery */}
      <div className="envelope-body relative aspect-[7/5] w-full overflow-hidden rounded-[6px] shadow-[0_30px_60px_-30px_oklch(0.2_0.04_40/0.55),0_8px_20px_-10px_oklch(0.2_0.04_40/0.25)] ring-1 ring-[oklch(0.85_0.025_70)]">
        {/* paper grain */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.97_0.015_80)_0%,oklch(0.93_0.022_72)_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply [background-image:radial-gradient(oklch(0.4_0.05_50)_1px,transparent_1px)] [background-size:3px_3px]" />

        {/* handwritten line, like an address */}
        <div className="absolute inset-x-0 bottom-5 px-8 text-left">
          <p className="font-serif text-[11px] italic text-foreground/55">
            Every Ripple begins with two hearts
          </p>
          <p className="font-serif text-[11px] italic text-foreground/55">
            that never met.
          </p>
        </div>

        {/* triangular flap */}
        <div
          className={
            "envelope-flap absolute inset-x-0 top-0 origin-top " +
            (opening ? "envelope-flap-open" : "")
          }
          style={{
            height: "62%",
            background:
              "linear-gradient(180deg, oklch(0.95 0.018 75) 0%, oklch(0.91 0.024 70) 100%)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            boxShadow: "0 2px 2px oklch(0.2 0.04 40 / 0.08)",
          }}
        />

        {/* embossed gold wax seal */}
        <div
          className={
            "wax-seal absolute left-1/2 top-[44%] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full " +
            (opening ? "wax-seal-break" : "wax-seal-glow")
          }
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,oklch(0.72_0.16_38)_0%,oklch(0.52_0.16_32)_55%,oklch(0.38_0.12_28)_100%)] shadow-[0_2px_6px_oklch(0.2_0.04_40/0.4),inset_0_-2px_4px_oklch(0.2_0.04_40/0.35),inset_0_2px_3px_oklch(1_0_0/0.25)]" />
          <div className="absolute inset-0 flex items-center justify-center font-serif text-[15px] italic text-[oklch(0.96_0.02_75)] [text-shadow:0_1px_1px_oklch(0.2_0.04_40/0.5)]">
            R
          </div>
        </div>
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

function OpenedCard({
  role,
  sentence,
  photo,
  date,
  tilt = 0,
}: {
  role: "Giver" | "Receiver";
  sentence: string;
  photo: string;
  date: string;
  tilt?: number;
}) {
  const formatted = new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <article
      className="unseal relative w-full max-w-[260px] rounded-lg bg-card p-3 shadow-[0_18px_40px_-22px_oklch(0.2_0.04_40/0.5)] ring-1 ring-border/60 transition-transform hover:rotate-0"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <span className="sparkle" style={{ top: -6, right: -6 }} />
      <div className="overflow-hidden rounded-md">
        <img
          src={photo}
          alt=""
          className="block aspect-[4/3] w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="eyebrow text-accent">{role}</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {formatted}
        </span>
      </div>
      <p className="type-in mt-2 font-serif text-sm italic leading-snug">
        &ldquo;{sentence}&rdquo;
      </p>
    </article>
  );
}

