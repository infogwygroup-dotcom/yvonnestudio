import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listMoments, type MomentSummary } from "@/lib/moments.functions";

const collectionQuery = queryOptions({
  queryKey: ["moments", "collection"],
  queryFn: () => listMoments(),
});

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "My Ripple Collection — Ripple Moment" },
      {
        name: "description",
        content: "An archive of every Ripple Moment you've created — collectible memories of small kindness.",
      },
      { property: "og:title", content: "My Ripple Collection" },
      {
        property: "og:description",
        content: "An archive of every Ripple Moment you've created.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(collectionQuery),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-8 text-stone-700">
      <p>Couldn't load your collection. {error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found.</div>,
  component: CollectionPage,
});

const rarityStyles: Record<MomentSummary["rarity"], string> = {
  common: "text-stone-500",
  rare: "text-sky-700",
  epic: "text-amber-700",
  legendary: "text-rose-700",
};

function CollectionPage() {
  const { data: moments } = useSuspenseQuery(collectionQuery);

  return (
    <main className="min-h-screen bg-[#f5efe4] text-stone-800">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12 flex flex-col items-center text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-stone-500">
            Volume I · The Archive
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl text-stone-900">
            My Ripple Collection
          </h1>
          <p className="mt-4 max-w-xl text-stone-600 italic">
            Every kindness, kept in print. Each entry is a memory pressed between pages.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className="text-stone-500">
              {moments.length} {moments.length === 1 ? "entry" : "entries"}
            </span>
            <span className="text-stone-300">·</span>
            <Link to="/" className="text-stone-700 underline underline-offset-4 hover:text-stone-900">
              Begin a new Ripple
            </Link>
          </div>
        </header>

        {moments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-400 bg-[#fbf6ec] p-16 text-center">
            <p className="font-serif text-2xl text-stone-700">The archive is empty.</p>
            <p className="mt-3 text-stone-500">
              Your first Ripple Moment will appear here once it's created.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-md bg-stone-900 px-5 py-2.5 text-sm text-[#f5efe4] hover:bg-stone-800"
            >
              Create your first Ripple
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {moments.map((m) => (
              <Link
                key={m.id}
                to="/m/$id"
                params={{ id: m.id }}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-sm bg-[#fbf6ec] shadow-[0_1px_2px_rgba(60,40,20,0.08),0_8px_24px_-12px_rgba(60,40,20,0.25)] ring-1 ring-stone-200/70 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_2px_4px_rgba(60,40,20,0.1),0_16px_32px_-12px_rgba(60,40,20,0.35)]">
                  <div className="aspect-[3/4] overflow-hidden bg-stone-200 flex items-start justify-center">
                    {m.thumb_image_url ? (
                      <img
                        src={m.thumb_image_url}
                        alt={m.tagline}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : m.card_image_url ? (
                      <img
                        src={m.card_image_url}
                        alt={m.tagline}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full bg-stone-300" />
                    )}
                  </div>
                  {(m.rarity === "epic" || m.rarity === "legendary") && (
                    <span
                      className={`absolute top-3 right-3 rounded-full bg-[#fbf6ec]/95 px-2.5 py-1 text-[10px] tracking-[0.25em] uppercase ${rarityStyles[m.rarity]} ring-1 ring-stone-300`}
                    >
                      {m.rarity}
                    </span>
                  )}
                </div>
                <div className="mt-4 px-1">
                  <div className="flex items-baseline justify-between text-[11px] tracking-[0.25em] uppercase text-stone-500">
                    <span>
                      Ripple No. {String(m.ripple_number ?? 0).padStart(6, "0")}
                    </span>
                    <span>
                      {new Date(m.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-lg leading-snug text-stone-900 line-clamp-2">
                    {m.tagline}
                  </p>
                  {(m.genre || m.mood) && (
                    <p className="mt-1.5 text-xs italic text-stone-500">
                      {[m.genre, m.mood].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}