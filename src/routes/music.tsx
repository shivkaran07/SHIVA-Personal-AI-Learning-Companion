import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { trendingQuery, seedQuery } from "@/lib/queries";
import { rowToVideo, useHistory, useSaved } from "@/hooks/use-library";
import { topChannels } from "@/lib/recommendations";
import { usePlayer } from "@/store/player";
import { SquareRail } from "@/components/common/Rail";
import { SectionHeader } from "@/components/common/States";
import { cn } from "@/lib/utils";

const MOODS = [
  { label: "Focus", q: "lofi focus music" },
  { label: "Energetic", q: "energetic hindi songs" },
  { label: "Chill", q: "chill relaxing songs" },
  { label: "Workout", q: "workout gym music" },
  { label: "Romantic", q: "romantic bollywood songs" },
  { label: "Devotional", q: "devotional bhajan" },
];

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Music — Shivkaran" },
      { name: "description", content: "Mood mixes, favorite songs, artists and trending music from YouTube." },
      { property: "og:title", content: "Music — Shivkaran" },
      { property: "og:description", content: "Mood-based music discovery on YouTube." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MusicPage,
});

function MusicPage() {
  const [mood, setMood] = useState(MOODS[0]);
  const moodQ = useQuery(seedQuery({ q: mood.q, music: true }));
  const trending = useQuery(trendingQuery("music"));
  const history = useHistory(50);
  const favs = useSaved("favorite");
  const playQueue = usePlayer((s) => s.playQueue);

  const recent = (history.data ?? []).filter((h) => h.is_music).map(rowToVideo);
  const favSongs = (favs.data ?? []).filter((f) => f.is_music).map(rowToVideo);
  const artists = topChannels((history.data ?? []).filter((h) => h.is_music));
  const artistQ = useQuery({ ...seedQuery({ q: artists[0] ?? "", music: true }), enabled: !!artists[0] });

  // YouTube's music category is unreliable, so keep only items marked as music.
  const onlyMusic = <T extends { isMusic?: boolean }>(list?: T[]) => list?.filter((v) => v.isMusic);

  const shuffleAll = (list?: { id: string }[]) => {
    if (!list?.length) return;
    const l = [...(list as never[])].sort(() => Math.random() - 0.5);
    playQueue(l, 0);
  };

  return (
    <div className="space-y-10">
      <section className="glass rounded-[26px] p-5">
          <SectionHeader
          title="Mood mixes"
          sub={`Smart mix · ${mood.label}`}
          action={
            <button onClick={() => shuffleAll(onlyMusic(moodQ.data?.videos))} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 font-display text-[13px] font-semibold text-primary-foreground">
              <Shuffle className="size-4" /> Play mix
            </button>
          }
        />
        <div className="mb-5 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button key={m.label} onClick={() => setMood(m)} aria-pressed={m === mood} className={cn("rounded-full px-4 py-2 text-[13px] font-semibold", m === mood ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>
              {m.label}
            </button>
          ))}
        </div>
        <SquareRail videos={onlyMusic(moodQ.data?.videos)} loading={moodQ.isLoading} inline />
      </section>

      {recent.length > 0 && (
        <section>
          <SectionHeader title="Recently played" />
          <SquareRail videos={recent} inline />
        </section>
      )}
      {favSongs.length > 0 && (
        <section>
          <SectionHeader title="Favorite songs" action={<button onClick={() => shuffleAll(favSongs)} className="text-[13px] font-semibold text-primary">Shuffle</button>} />
          <SquareRail videos={favSongs} inline />
        </section>
      )}
      {artists[0] && (
        <section>
          <SectionHeader title={`More from ${artists[0]}`} sub="Artist you play most" />
          <SquareRail videos={onlyMusic(artistQ.data?.videos)} loading={artistQ.isLoading} inline />
        </section>
      )}
      <section>
        <SectionHeader title="Trending music" sub="Popular in India" />
        <SquareRail videos={onlyMusic(trending.data)} loading={trending.isLoading} inline />
      </section>
    </div>
  );
}
