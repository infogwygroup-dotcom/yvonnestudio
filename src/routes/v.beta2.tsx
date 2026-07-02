import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { postCreateMoment } from "@/lib/moment-ticket";
import { useRef, useState } from "react";

export const Route = createFileRoute("/v/beta2")({
  head: () => ({
    meta: [
      { title: "Ripple Studio · Beta 2.0" },
      {
        name: "description",
        content:
          "Beta 2.0 introduces the Infinite Stories Engine — 26 director voices, 24 narrative devices, and 20 presentation formats for each Ripple memory.",
      },
      { property: "og:title", content: "Ripple Studio · Beta 2.0" },
      {
        property: "og:description",
        content: "The Infinite Stories Engine — 26 directors and 20 presentation formats reimagine every kindness.",
      },
      { property: "og:url", content: "https://yvonnestudio.lovable.app/v/beta2" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://yvonnestudio.lovable.app/v/beta2" }],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="paper flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Something went wrong</p>
      <p className="mt-4 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "Please try again."}
      </p>
      <button
        onClick={() => reset?.()}
        className="mt-6 btn-journal px-6 py-2 text-xs uppercase tracking-[0.18em]"
      >
        Retry
      </button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="paper flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Not found</p>
      <p className="mt-4 text-sm text-muted-foreground">This page does not exist.</p>
    </div>
  ),
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
      setError("Please add both photos and both sentences.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("photo_one", files.one);
      fd.append("photo_two", files.two);
      fd.append("sentence_one", sentences.one.trim());
      fd.append("sentence_two", sentences.two.trim());
      const res = await postCreateMoment(fd);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed (${res.status})`);
      }
      const { id } = (await res.json()) as { id: string };
      navigate({ to: "/v2/m/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (submitting) return <ComposingScreen />;

  return (
    <main className="paper min-h-screen relative">
      <VersionSwitcher current="beta2" />
      <div className="mx-auto max-w-3xl px-6 pt-20 pb-28 sm:pt-28">
        <header className="text-center">
          <p className="eyebrow">VOL. 01 · EVERYDAY STORIES</p>
          <h1 className="mt-7 font-serif text-[1.75rem] leading-[1.12] text-balance sm:text-6xl sm:leading-[0.98]">
            Every story begins
            <span className="block italic font-normal text-accent">with one small moment.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground sm:max-w-md sm:text-lg">
            One photo. One feeling. One story waiting to be told.
          </p>
        </header>

        <BrandPromise />

        <div className="mt-10 h-px w-full bg-border sm:mt-12" />

        <form onSubmit={onSubmit} className="mt-12 grid gap-14 sm:mt-14 sm:gap-20">
          <SlotField
            label="THE FIRST MOMENT"
            slot="one"
            uploadLabel="Place your first memory"
            helperText="A dinner you won’t forget. A place that still feels like home. Someone who smiled."
            placeholder="“It was only two words, but I kept them.”"
            preview={previews.one}
            sentence={sentences.one}
            onFile={(f) => setSlotFile("one", f)}
            onSentence={(v) => setSentences((s) => ({ ...s, one: v }))}
          />

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="eyebrow">and then</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <SlotField
            label="THE SECOND MOMENT"
            slot="two"
            uploadLabel="Place your second memory"
            helperText="A rainy street. A tiny moment that mattered. The other side of the same story."
            placeholder="“What would you want someone to remember?”"
            preview={previews.two}
            sentence={sentences.two}
            onFile={(f) => setSlotFile("two", f)}
            onSentence={(v) => setSentences((s) => ({ ...s, two: v }))}
          />

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <button
            type="submit"
            className="group btn-journal mx-auto mt-4 inline-flex items-center gap-3 px-10 py-4 text-sm font-medium uppercase tracking-[0.18em]"
          >
            Begin Your Story
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <p className="text-center text-xs text-muted-foreground/80">
            We don’t ask for your name. The memory is the point.
          </p>
        </form>

        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <div className="h-px w-16 bg-border" />
          <Link
            to="/collection"
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Open the Archive →
          </Link>
        </div>
      </div>
    </main>
  );
}

function BrandPromise() {
  return (
    <section className="mt-10 text-center">
      <h2 className="mx-auto max-w-md font-serif text-[1.7rem] leading-[1.18] text-balance sm:text-[2.25rem] sm:leading-[1.2]">
        Every moment you share
        <br />
        becomes a story only
        <br />
        Ripple Studio could tell.
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:mt-7 sm:text-base">
        No two stories are ever directed the same way.
      </p>
      <p className="mt-5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70 sm:mt-6">
        Story · Director · Artwork · Memory
      </p>
    </section>
  );
}

function SlotField({
  label,
  slot,
  uploadLabel,
  helperText,
  placeholder,
  preview,
  sentence,
  onFile,
  onSentence,
}: {
  label: string;
  slot: Slot;
  uploadLabel: string;
  helperText: string;
  placeholder: string;
  preview: string | null;
  sentence: string;
  onFile: (f: File | null) => void;
  onSentence: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <section className="grid gap-8 sm:grid-cols-[1fr_1.2fr] sm:gap-10">
      <div>
        <p className="eyebrow">{label}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 relative block aspect-[4/5] w-full overflow-hidden journal-card upload-card hover:border-accent/60 sm:mt-4 sm:aspect-square"
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-muted-foreground sm:gap-3">
              <EmptyPhotoIllustration className="h-12 w-12 opacity-60 sm:h-11 sm:w-11" />
              <span className="text-xs uppercase tracking-[0.18em]">{uploadLabel}</span>
              <p className="max-w-[24ch] text-center text-xs leading-relaxed text-muted-foreground/65 sm:max-w-[18ch] sm:text-[11px]">
                {helperText}
              </p>
            </div>
          )}
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
      <div className="flex flex-col">
        <p className="eyebrow">What stayed with you?</p>
        <textarea
          value={sentence}
          onChange={(e) => onSentence(e.target.value)}
          placeholder={placeholder}
          maxLength={240}
          rows={5}
          className="mt-5 flex-1 resize-none border-0 border-b border-border/80 bg-transparent pb-3 font-serif text-[1.25rem] leading-relaxed italic text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none sm:mt-4 sm:text-[1.35rem]"
        />
        <p className="mt-2 text-right text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          {sentence.length} / 240
        </p>
      </div>
    </section>
  );
}

function EmptyPhotoIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="10"
        y="14"
        width="36"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="15"
        y="21"
        width="26"
        height="18"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M40 18c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5 3.5-1.5 3.5-3.5S42 18 40 18z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M40 25v6M37 27c-1.5-1.5-3-1-4 0M43 27c1.5-1.5 3-1 4 0"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ComposingScreen() {
  return (
    <main className="paper flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">One story, almost ready</p>
        <h2 className="mt-6 font-serif text-4xl leading-tight">
          Your two moments are becoming one memory…
        </h2>
        <div className="mx-auto mt-10 h-px w-24 bg-border" />
        <p className="mt-10 text-sm italic text-muted-foreground">
          Finding the light that connects them. Listening to the silence between the words.
          <br />
          This usually takes 30&ndash;60 seconds.
        </p>
        <div className="mt-10 flex justify-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:400ms]" />
        </div>
      </div>
    </main>
  );
}

function VersionSwitcher({ current: _current }: { current: "beta1" | "beta2" | "next" | "v3" }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-4 sm:pt-6">
      <div className="pointer-events-auto rounded-full border border-border/70 bg-background/80 px-3.5 py-1 text-[10px] uppercase tracking-[0.18em] shadow-sm backdrop-blur text-foreground">
        Beta 2.0
      </div>
    </div>
  );
}
