import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ripple Moment — Turn a small kindness into a memory" },
      {
        name: "description",
        content:
          "Two strangers. Two photos. Two sentences. Ripple Moment turns a small act of kindness into a memory worth keeping.",
      },
      { property: "og:title", content: "Ripple Moment" },
      {
        property: "og:description",
        content: "Turn a small kindness into a memory worth keeping.",
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

  if (submitting) return <ComposingScreen />;

  return (
    <main className="paper min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-14 pb-24 sm:pt-24">
        <header className="text-center">
          <p className="eyebrow">Vol. 01 · A small kindness</p>
          <h1 className="mt-6 text-5xl leading-[0.95] sm:text-7xl">
            Ripple
            <span className="italic font-normal text-accent"> Moment</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Two strangers. Two photos. Two sentences.
            <br />
            Kept forever as one memory.
          </p>
        </header>

        <div className="mt-14 h-px w-full bg-border" />

        <form onSubmit={onSubmit} className="mt-14 grid gap-12">
          <SlotField
            label="The first hand"
            slot="one"
            placeholder="A line about what you gave, or what you saw…"
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
            label="The other hand"
            slot="two"
            placeholder="A line about what you received, or what you felt…"
            preview={previews.two}
            sentence={sentences.two}
            onFile={(f) => setSlotFile("two", f)}
            onSentence={(v) => setSentences((s) => ({ ...s, two: v }))}
          />

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <button
            type="submit"
            className="group mx-auto mt-6 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent"
          >
            Compose the memory
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>

          <p className="text-center text-xs text-muted-foreground">
            We don't ask for your name. The memory is the point.
          </p>
        </form>
      </div>
    </main>
  );
}

function SlotField({
  label,
  slot,
  placeholder,
  preview,
  sentence,
  onFile,
  onSentence,
}: {
  label: string;
  slot: Slot;
  placeholder: string;
  preview: string | null;
  sentence: string;
  onFile: (f: File | null) => void;
  onSentence: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <section className="grid gap-6 sm:grid-cols-[1fr_1.2fr] sm:gap-10">
      <div>
        <p className="eyebrow">{label}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 relative block aspect-square w-full overflow-hidden rounded-sm border border-border bg-card transition hover:border-accent"
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <span className="font-serif text-4xl italic">+</span>
              <span className="text-xs uppercase tracking-[0.18em]">Add a photo</span>
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
        <p className="eyebrow">A single sentence</p>
        <textarea
          value={sentence}
          onChange={(e) => onSentence(e.target.value)}
          placeholder={placeholder}
          maxLength={240}
          rows={5}
          className="mt-3 flex-1 resize-none border-0 border-b border-border bg-transparent pb-3 font-serif text-2xl leading-snug italic text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none"
        />
        <p className="mt-2 text-right text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {sentence.length} / 240
        </p>
      </div>
    </section>
  );
}

function ComposingScreen() {
  return (
    <main className="paper flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">Now composing</p>
        <h2 className="mt-6 font-serif text-4xl leading-tight">
          The director is reading your two photos…
        </h2>
        <div className="mx-auto mt-10 h-px w-24 bg-border" />
        <p className="mt-10 text-sm italic text-muted-foreground">
          Choosing the visual language. Writing the invisible story. Composing the page.
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