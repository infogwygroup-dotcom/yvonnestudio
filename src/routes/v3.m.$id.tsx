import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { getMoment } from "@/lib/moments.functions";
import { pickLayoutV3 } from "@/lib/presentation.v3";
import { LetterSection } from "@/routes/m.$id";

export const Route = createFileRoute("/v3/m/$id")({
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
        { property: "og:description", content: "A collectible memory by Ripple Studio." },
        { property: "og:image", content: m?.card_image_url ?? "" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: m?.card_image_url ?? "" },
      ],
    };
  },
  component: V3MomentPage,
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
        <Link to="/v/v3" className="mt-6 inline-block rounded-full border border-border px-5 py-2 text-sm uppercase tracking-[0.18em]">
          Begin a new one
        </Link>
      </div>
    </div>
  ),
});

function V3MomentPage() {
  const { moment } = Route.useLoaderData();
  const Layout = pickLayoutV3(moment.presentation_format);
  return (
    <>
      <Layout moment={moment} />
      <section className="paper px-6 pb-32">
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
        </div>
      </section>

      <section className="paper px-6 pb-24">
        <div className="mx-auto max-w-4xl flex flex-col items-center text-center">
          <div className="h-px w-24 bg-border" />
          <Link
            to="/v/v3"
            className="group mt-10 btn-journal inline-flex items-center gap-3 px-10 py-4 text-sm font-medium uppercase tracking-[0.18em]"
          >
            Create another ripple
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted-foreground/70">
            Every new story starts with two moments
          </p>
        </div>
      </section>
    </>
  );
}