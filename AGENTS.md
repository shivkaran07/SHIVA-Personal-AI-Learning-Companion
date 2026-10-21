# Shivkaran — architecture rules

- YouTube Data API calls live only in `src/lib/youtube.server.ts`, exposed via `youtube.functions.ts`; keeps the API key server-side and YouTube logic separate from AI.
- AI calls live in `src/lib/ai/*` (gateway, prompts) and the streaming `/api/ai` route; video context is always re-fetched server-side, never trusted from the client.
- Recommendation logic is pure functions in `src/lib/recommendations.ts`; lets it evolve (e.g. embeddings) without UI changes.
- A single YouTube IFrame player (`YouTubeEngine`) stays mounted in `__root`, docking over the watch page slot or showing as a visible mini player; never hidden/audio-only playback, for YouTube ToS compliance.
- Queue/player state is a persisted Zustand store (`src/store/player.ts`); personal library data lives in Lovable Cloud tables protected by per-user RLS.
- The Python/FastAPI stack in the original brief is replaced by TanStack Start server functions + Lovable Cloud, because only this stack is supported.
