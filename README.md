# TMDB Movies & Series Stremio Addon

## Features
- Popular, trending, upcoming, now-playing and top-rated movie catalogs
- Popular, trending, currently-airing and top-rated series catalogs
- TMDB metadata, posters, summaries and ratings
- TMDB genre discovery support in the code
- Render-friendly Node.js server

## Configure
1. Create a TMDB API key from your TMDB account settings.
2. In Render, create a Web Service connected to this repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable `TMDB_API_KEY` with your own key.
6. Deploy, then open `https://YOUR-SERVICE.onrender.com/manifest.json`.
7. Install that manifest URL in Stremio.

## Files
- `server.js`: Stremio manifest and handlers
- `main.js`: TMDB API calls and metadata mapping
- `package.json`: Node.js dependencies and start script

This addon supplies metadata catalogs only; it does not provide video streams.
TMDB data use is subject to TMDB's terms and attribution requirements.
