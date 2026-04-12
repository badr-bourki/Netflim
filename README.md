# NETFLIM

Netflix-like streaming UI backed by a secure TMDB proxy API.

## Tech
- Frontend: React (Vite) + TailwindCSS + React Router + Zustand
- Backend: Node.js + Express
- DB: MongoDB (Mongoose)

## Local dev
1. Create `server/.env` from `server/.env.example`
2. Install deps (root installs workspace deps automatically):
   - `npm install`
3. Run:
   - `npm run dev`

Frontend: http://localhost:5173
Backend: http://localhost:4000

## Notes
- TMDB API key is **server-only**. The frontend only calls `/api/*`.
- Watch page uses multiple iframe providers and auto-fallback after 8s.
- Subtitles endpoint requires OpenSubtitles env vars.
