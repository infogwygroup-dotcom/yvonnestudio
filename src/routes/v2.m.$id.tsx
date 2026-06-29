import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { getMoment } from "@/lib/moments.functions";
import { pickLayout } from "@/lib/presentation";
import { LetterSection } from "@/routes/m.$id";

export const Route = createFileRoute("/v2/m/$id")({
  loader: async ({ params }) => {
    const moment = await getMoment({ data: { id: params.id } });
    if (!moment) throw notFound();
    return { moment };
  },
  head: ({ loaderData }) => {
    const m = loaderData?.moment;
    return {
      meta: [
        { title: m ? `"${m.tagline}" — Ripple Studio` : "Ripple Studio" },
        { name: "description", content: m?.tagline ?? "A Ripple Moment" },
        { property: "og:title", content: m?.tagline ?? "A Ripple Moment" },
        { property: "og:description", content: "A directed memory by Ripple Studio." },
        { property: "og:image", content: m?.card_image_url ?? "" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: m?.card_image_url ?? "" },
      ],
    };
  },
  component: V2MomentPage,
  errorComponent: ({ reset }) => {
    const router = useRouter();
    return (
      <div className="paper flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="eyebrow">Something interrupted us</p>
          <h1 className="mt-4 font-serif text-3xl">This moment couldn't load</h1>
          <button
            onClick={() => { router.invalidate(); reset(); }}
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
        <Link to="/v/next" className="mt-6 inline-block rounded-full border border-border px-5 py-2 text-sm uppercase tracking-[0.18em]">
          Begin a new one
        </Link>
      </div>
    </div>
  ),
});

function V2MomentPage() {
  const { moment } = Route.useLoaderData();
  const Layout = pickLayout(moment.presentation_format);
  return (
    <>
      <Layout moment={moment} />
      <section className="paper px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <LetterSection
            date={moment.created_at}
            giver={{
              sentence: moment.sentence_one,
              still: moment.photo_one_url,
              location: moment.giver_location,
              merchant: moment.giver_merchant,
              meal: moment.giver_meal,
              caption:
                moment.giver_caption ||
                "When she shared this meal,\nshe only wrote two words.",
            }}
            receiver={{
              sentence: moment.sentence_two,
              still: moment.photo_two_url,
              location: moment.receiver_location,
              merchant: moment.receiver_merchant,
              meal: moment.receiver_meal,
              caption:
                moment.receiver_caption ||
                "His reply quietly\ncompleted the story.",
            }}
          />

          <div className="mt-16 flex flex-col items-center gap-5 text-center">
            <div className="h-px w-16 bg-border" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/v/next"
                className="btn-journal inline-flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em]"
              >
                Create another Ripple
                <span>→</span>
              </Link>
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Open the Archive
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Every Ripple is a one-of-a-kind edition.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}