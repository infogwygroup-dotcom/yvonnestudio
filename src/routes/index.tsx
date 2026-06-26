import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Capture a Ripple — Small moments become stories" },
      {
        name: "description",
        content:
          "Every ripple begins with one small moment. Capture a photo, a feeling — and let Ripple Studio direct it into a story.",
      },
      { property: "og:title", content: "Capture a Ripple" },
      {
        property: "og:description",
        content: "Small moments become stories.",
      },
    ],
  }),
  component: HomePage,
});

type Slot = "one" | "two";

function HomePage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<Record<Slot, File | null>>({ one: null, two: null });
  const [previews, setPreviews] = useState<Record<Slot, string | null>>({ one: null, two: null });
  const [sentences, setSentences] = useState<Record<Slot, string>>({ one: "", two: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setSlotFile(slot: Slot, file: File | null) {
    setFiles((f) => ({ ...f, [slot]: file }));
    setPreviews((p) => {
      if (p[slot]) URL.revokeObjectURL(p[slot]!);
      return { ...p, [slot]: file ? URL.createObjectURL(file) : null };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!files.one || !files.two || !sentences.one.trim() || !sentences.two.trim()) {
      setError("Both moments need a photo and a feeling before we can begin.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("photo_one", files.one);
      fd.append("photo_two", files.two);
      fd.append("sentence_one", sentences.one.trim());
      fd.append("sentence_two", sentences.two.trim());
      const res = await fetch("/api/create-moment", { method: "POST", body: fd });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed (${res.status})`);
      }
      const { id } = (await res.json()) as { id: string };
      navigate({ to: "/m/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (submitting) return <StudioComposingScreen />;

  return (
    <main className="paper min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-28 sm:pt-24">
        <header className="text-center">
          <p className="eyebrow">✶ Ripple Studio · Vol. 01</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1] sm:text-7xl">
            Capture a
            <span className="italic font-normal text-accent"> Ripple</span>
          </h1>
          <p className="mx-auto mt-7 max-w-md font-serif text-lg italic text-muted-foreground sm:text-xl">
            Every ripple begins with one small moment.
            <br />
            Small moments become stories.
          </p>
        </header>

        <JourneyMap />

        <form onSubmit={onSubmit} className="mt-12 grid gap-16">
          <JourneyStep
            index="i."
            title="Show us your moment"
            blurb="This can be anything. A meal. A sunset. Your table. Your walk home. A smile. A tiny detail that mattered today."
            slot="one"
            preview={previews.one}
            sentence={sentences.one}
            placeholder="Today reminded me of home."
            onFile={(f) => setSlotFile("one", f)}
            onSentence={(v) => setSentences((s) => ({ ...s, one: v }))}
          />

          <Divider label="and then a ripple returns" />

          <JourneyStep
            index="ii."
            title="And the moment it touched"
            blurb="Another photo, another sentence — the small reply that came back to you. The other half of this ripple."
            slot="two"
            preview={previews.two}
            sentence={sentences.two}
            placeholder="It tasted like a quiet thank-you."
            onFile={(f) => setSlotFile("two", f)}
            onSentence={(v) => setSentences((s) => ({ ...s, two: v }))}
          />

          {error && (
            <p className="text-center font-serif text-base italic text-destructive">
              {error}
            </p>
          )}

          <div className="mt-2 flex flex-col items-center gap-5">
            <button
              type="submit"
              className="group relative inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 font-serif text-base text-primary-foreground transition glow-pulse hover:bg-[oklch(0.22_0.04_35)]"
            >
              <span className="text-accent-foreground/80">✶</span>
              Let Ripple Studio Direct This Moment
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <p className="max-w-xs text-center font-serif text-sm italic text-muted-foreground">
              No accounts. No filters. Only the feeling, kept.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

const JOURNEY = [
  { n: "i", label: "A memory" },
  { n: "ii", label: "A feeling" },
  { n: "iii", label: "A ripple back" },
  { n: "iv", label: "Ripple Studio directs" },
];

function JourneyMap() {
  return (
    <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center">
      {JOURNEY.map((s, i) => (
        <div key={s.n} className="flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-sm italic text-accent">{s.n}.</span>
            <span className="eyebrow">{s.label}</span>
          </div>
          {i < JOURNEY.length - 1 && (
            <span className="hidden h-px w-10 bg-border sm:block" />
          )}
        </div>
      ))}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="h-px flex-1 bg-border" />
      <span className="font-serif text-sm italic text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function JourneyStep({
  index,
  title,
  blurb,
  slot,
  preview,
  sentence,
  placeholder,
  onFile,
  onSentence,
}: {
  index: string;
  title: string;
  blurb: string;
  slot: Slot;
  preview: string | null;
  sentence: string;
  placeholder: string;
  onFile: (f: File | null) => void;
  onSentence: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  return (
    <section className="step-rise grid gap-10">
      <header className="text-center">
        <p className="font-serif text-sm italic text-accent">— chapter {index} —</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          {blurb}
        </p>
      </header>

      <div className="grid gap-10 sm:grid-cols-[1.05fr_1fr] sm:gap-12">
        {/* Premium photo frame */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-card p-3 shadow-[0_18px_50px_-22px_oklch(0.28_0.04_35/0.45),0_2px_6px_-2px_oklch(0.28_0.04_35/0.2)] ring-1 ring-[oklch(0.88_0.02_70/0.7)] transition hover:shadow-[0_28px_70px_-22px_oklch(0.28_0.04_35/0.55)]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 30% 0%, oklch(1 0 0 / 0.55), transparent 60%), radial-gradient(ellipse at 70% 100%, oklch(0.92 0.02 70 / 0.5), transparent 65%)",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[3px] bg-[oklch(0.94_0.018_75)]">
              {preview ? (
                <img
                  key={preview}
                  src={preview}
                  alt=""
                  className="film-develop h-full w-full object-cover"
                />
              ) : (
                <EmptyFrameIllustration />
              )}
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-hand text-base text-muted-foreground">
              {preview ? "tap to change" : "tap to place a photo"}
            </span>
          </button>
          <input
            ref={inputRef}
            id={`photo_${slot}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Journal page */}
        <div className="paper-sway flex flex-col">
          <p className="font-hand text-xl text-muted-foreground">
            What stayed with you?
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            One sentence is enough. Your words don't need to be perfect — Ripple Studio
            will hear the feeling underneath.
          </p>

          <div
            className="relative mt-5 flex-1 rounded-sm bg-[linear-gradient(to_bottom,transparent_0,transparent_calc(2.25rem_-_1px),oklch(0.86_0.02_70/0.55)_calc(2.25rem_-_1px),oklch(0.86_0.02_70/0.55)_2.25rem,transparent_2.25rem)] bg-[length:100%_2.25rem] p-1"
          >
            <textarea
              value={sentence}
              onChange={(e) => onSentence(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={focused ? "" : placeholder}
              maxLength={240}
              rows={4}
              className="block h-full min-h-[9rem] w-full resize-none bg-transparent font-serif text-2xl italic leading-9 text-foreground placeholder:text-muted-foreground/55 focus:outline-none"
              style={{ lineHeight: "2.25rem" }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-hand text-base text-accent/80">
              {sentence.trim() ? "— kept" : "— begin anywhere"}
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {sentence.length} / 240
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyFrameIllustration() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center">
      <svg
        viewBox="0 0 120 120"
        className="h-20 w-20 text-accent/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 36 h76 a6 6 0 0 1 6 6 v44 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 v-44 a6 6 0 0 1 6 -6 z" />
        <path d="M48 36 l4 -8 h16 l4 8" />
        <circle cx="60" cy="64" r="14" />
        <circle cx="60" cy="64" r="5" />
        <path d="M26 84 q14 -16 28 -6 q14 12 38 -6" opacity="0.4" />
      </svg>
      <div className="font-hand text-xl leading-snug text-muted-foreground">
        a quiet dinner.
        <br />
        morning light.
        <br />
        your favourite corner.
      </div>
    </div>
  );
}

const STUDIO_PHASES = [
  "Reading your photographs",
  "Finding the emotion behind your words",
  "Imagining the scene",
  "Writing the screenplay",
  "Directing the moment",
  "Composing your Ripple",
];

const STUDIO_WHISPERS = [
  "Finding the emotion behind your words…",
  "Looking for the invisible connection…",
  "Every story begins somewhere…",
  "Writing the ending before the beginning…",
  "Turning kindness into cinema…",
  "Ripple Studio is directing this moment…",
  "Almost ready…",
];

function StudioComposingScreen() {
  const [phase, setPhase] = useState(0);
  const [whisper, setWhisper] = useState(0);

  useEffect(() => {
    const a = setInterval(
      () => setPhase((p) => Math.min(p + 1, STUDIO_PHASES.length - 1)),
      900,
    );
    const b = setInterval(() => setWhisper((w) => (w + 1) % STUDIO_WHISPERS.length), 2600);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  return (
    <main className="paper flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="eyebrow">✶ Ripple Studio</p>
        <h2 className="studio-shimmer mt-6 font-serif text-3xl leading-tight sm:text-4xl">
          Ripple Studio is crafting your story…
        </h2>

        <div className="mx-auto mt-10 h-px w-20 bg-border" />

        <ol className="mx-auto mt-10 grid gap-3 text-left">
          {STUDIO_PHASES.map((p, i) => {
            const state = i < phase ? "done" : i === phase ? "live" : "future";
            return (
              <li
                key={p}
                className="flex items-center gap-4 font-serif text-base transition-colors"
              >
                <span
                  className={
                    "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] " +
                    (state === "done"
                      ? "border-accent bg-accent text-accent-foreground"
                      : state === "live"
                        ? "border-accent text-accent"
                        : "border-border text-muted-foreground")
                  }
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span
                  className={
                    state === "future"
                      ? "italic text-muted-foreground/60"
                      : state === "live"
                        ? "italic text-foreground"
                        : "text-muted-foreground line-through decoration-border"
                  }
                >
                  {p}
                </span>
                {state === "live" && (
                  <span className="ml-auto flex gap-1">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-accent" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:180ms]" />
                    <span className="h-1 w-1 animate-pulse rounded-full bg-accent [animation-delay:360ms]" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <div className="relative mt-10 h-6 overflow-hidden">
          <p
            key={whisper}
            className="phase-in font-hand text-xl text-muted-foreground"
          >
            {STUDIO_WHISPERS[whisper]}
          </p>
        </div>

        <p className="mt-8 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          usually 30 – 60 seconds
        </p>
      </div>
    </main>
  );
}