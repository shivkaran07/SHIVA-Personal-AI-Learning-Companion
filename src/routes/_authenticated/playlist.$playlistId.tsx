import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { rowToVideo } from "@/hooks/use-library";
import { usePlayer } from "@/store/player";
import { VideoCard, VideoCardSkeleton } from "@/components/video/VideoCard";
import { EmptyState } from "@/components/common/States";

export const Route = createFileRoute("/_authenticated/playlist/$playlistId")({
  head: () => ({
    meta: [
      { title: "Playlist — Shivkaran" },
      { name: "description", content: "Your Shivkaran playlist." },
      { property: "og:title", content: "Playlist — Shivkaran" },
      { property: "og:description", content: "A personal YouTube playlist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlaylistPage,
});

function PlaylistPage() {
  const { playlistId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const playQueue = usePlayer((s) => s.playQueue);
  const q = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: async () => {
      const { data, error } = await supabase.from("playlists").select("id, name, playlist_items(*)").eq("id", playlistId).single();
      if (error) throw error;
      return { ...data, playlist_items: [...data.playlist_items].sort((a, b) => a.position - b.position) };
    },
  });

  const videos = q.data?.playlist_items.map(rowToVideo) ?? [];

  const removeItem = async (id: string) => {
    await supabase.from("playlist_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["playlist", playlistId] });
    qc.invalidateQueries({ queryKey: ["playlists"] });
  };
  const deleteList = async () => {
    if (!window.confirm("Delete this playlist?")) return;
    await supabase.from("playlists").delete().eq("id", playlistId);
    qc.invalidateQueries({ queryKey: ["playlists"] });
    toast.success("Playlist deleted");
    navigate({ to: "/library", search: { tab: "playlists" } });
  };

  if (q.error) return <EmptyState title="Playlist not found" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-3xl font-bold">{q.data?.name ?? "…"}</h1>
        <button disabled={!videos.length} onClick={() => playQueue(videos, 0)} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-display text-[13px] font-semibold text-primary-foreground disabled:opacity-50">
          <Play className="size-4 fill-current" /> Play all
        </button>
        <button onClick={deleteList} className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-[13px] font-semibold text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" /> Delete
        </button>
      </div>
      {q.isLoading ? (
        <VideoCardSkeleton variant="row" />
      ) : videos.length ? (
        <div className="max-w-3xl space-y-1">
          {q.data!.playlist_items.map((it, i) => (
            <div key={it.id} className="flex items-center">
              <div className="min-w-0 flex-1"><VideoCard video={videos[i]} context={videos} variant="row" /></div>
              <button onClick={() => removeItem(it.id)} aria-label="Remove" className="rounded-full p-2 text-muted-foreground hover:text-destructive"><X className="size-4" /></button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="This playlist is empty" body="Add videos from any watch page." />
      )}
    </div>
  );
}
