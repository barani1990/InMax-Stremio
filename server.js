const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const { CATALOGS, getCatalogItems, getGenres } = require("./main");

const PORT = Number(process.env.PORT || 7000);

const manifest = {
  id: "community.tmdb.catalogs",
  version: "1.0.0",
  name: "TMDB Movies & Series Catalogs",
  description: "Movie and series catalogs with genre browsing, powered by TMDB metadata.",
  resources: ["catalog", "meta"],
  types: ["movie", "series"],
  idPrefixes: ["tmdb:"],
  catalogs: [
    ...CATALOGS.map(c => ({
      type: c.type,
      id: c.id,
      name: c.name,
      extra: [{ name: "skip", isRequired: false }]
    })),
    {
      type: "movie",
      id: "movie-by-genre",
      name: "Movies by Genre",
      extra: [
        { name: "genre", isRequired: true, options: [] },
        { name: "skip", isRequired: false }
      ]
    },
    {
      type: "series",
      id: "series-by-genre",
      name: "Series by Genre",
      extra: [
        { name: "genre", isRequired: true, options: [] },
        { name: "skip", isRequired: false }
      ]
    }
  ]
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra = {} }) => {
  try {
    if (id === "movie-by-genre" || id === "series-by-genre") {
      const expectedType = id === "series-by-genre" ? "series" : "movie";
      if (type !== expectedType || !extra.genre) return { metas: [] };
      const pageSkip = Math.max(0, Number(extra.skip) || 0);
      const catalogId = expectedType === "series" ? "series-popular" : "movie-popular";
      const metas = await getCatalogItems(catalogId, pageSkip, extra.genre);
      return { metas };
    }

    const skip = Math.max(0, Number(extra.skip) || 0);
    const metas = await getCatalogItems(id, skip);
    return { metas };
  } catch (err) {
    console.error("Catalog handler error:", err.message);
    return { metas: [] };
  }
});

builder.defineMetaHandler(async ({ type, id }) => {
  try {
    if (!String(id).startsWith("tmdb:")) return { meta: null };
    const tmdbId = String(id).slice(5);
    const endpoint = type === "series" ? `/tv/${tmdbId}` : `/movie/${tmdbId}`;
    const key = process.env.TMDB_API_KEY;
    if (!key) return { meta: null };
    const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
    url.searchParams.set("api_key", key);
    url.searchParams.set("language", "en-US");
    const response = await fetch(url);
    if (!response.ok) return { meta: null };
    const item = await response.json();
    const title = type === "series" ? item.name : item.title;
    const releaseDate = type === "series" ? item.first_air_date : item.release_date;
    return {
      meta: {
        id: `tmdb:${item.id}`,
        type,
        name: title || "Untitled",
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined,
        description: item.overview || undefined,
        releaseInfo: releaseDate ? releaseDate.slice(0, 4) : undefined,
        imdbRating: item.vote_average ? item.vote_average.toFixed(1) : undefined,
        genres: (item.genres || []).map(g => g.name)
      }
    };
  } catch (err) {
    console.error("Meta handler error:", err.message);
    return { meta: null };
  }
});

const addonInterface = builder.getInterface();

if (require.main === module) {
  serveHTTP(addonInterface, { port: PORT });
  console.log(`Stremio addon listening on port ${PORT}`);
  console.log(`Manifest: http://localhost:${PORT}/manifest.json`);
}

module.exports = addonInterface;
