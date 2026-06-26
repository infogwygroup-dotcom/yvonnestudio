import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getMoment } from "@/lib/moments.functions";

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
      <div className="mx-auto max-w-3xl px-6 pt-10 pb-24 sm:pt-16">
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

        <figure className="mt-12">
          <div className="overflow-hidden rounded-sm border border-border bg-card shadow-[0_30px_80px_-30px_oklch(0.2_0.04_40/0.35)]">
            <img
              src={moment.card_image_url}
              alt={moment.tagline}
              className="block w-full"
              loading="eager"
            />
          </div>
          <figcaption className="mt-10 text-center">
            <p className="eyebrow">The line that remained</p>
            <p className="mx-auto mt-4 max-w-2xl font-serif text-3xl italic leading-tight sm:text-4xl">
              &ldquo;{moment.tagline}&rdquo;
            </p>
          </figcaption>
        </figure>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Halfsheet
            label="One person wrote"
            sentence={moment.sentence_one}
            photo={moment.photo_one_url}
          />
          <Halfsheet
            label="The other answered"
            sentence={moment.sentence_two}
            photo={moment.photo_two_url}
          />
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
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

function Halfsheet({
  label,
  sentence,
  photo,
}: {
  label: string;
  sentence: string;
  photo: string;
}) {
  return (
    <article className="grid grid-cols-[auto_1fr] gap-4 border-t border-border pt-6">
      <img src={photo} alt="" className="h-20 w-20 rounded-sm object-cover grayscale opacity-90" />
      <div>
        <p className="eyebrow">{label}</p>
        <p className="mt-2 font-serif text-lg italic leading-snug">&ldquo;{sentence}&rdquo;</p>
      </div>
    </article>
  );
}