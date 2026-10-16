const fetch = global.fetch;

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function requireApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not configured");
  return key;
}

async function tmdb(path, params = {}) {
  const key = requireApiKey();
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", key);
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

const CATALOGS = [
  { id: "movie-trending", type: "movie", name: "Trending Movies", path: "/trending/movie/week" },
  { id: "movie-popular", type: "movie", name: "Popular Movies", path: "/movie/popular" },
  { id: "movie-now-playing", type: "movie", name: "Now Playing", path: "/movie/now_playing" },
  { id: "movie-upcoming", type: "movie", name: "Upcoming Movies", path: "/movie/upcoming" },
  { id: "movie-top-rated", type: "movie", name: "Top Rated Movies", path: "/movie/top_rated" },
  { id: "series-trending", type: "series", name: "Trending Series", path: "/trending/tv/week" },
  { id: "series-popular", type: "series", name: "Popular Series", path: "/tv/popular" },
  { id: "series-on-the-air", type: "series", name: "Currently Airing", path: "/tv/on_the_air" },
  { id: "series-top-rated", type: "series", name: "Top Rated Series", path: "/tv/top_rated" }
];

function toMeta(item, type) {
  const isMovie = type === "movie";
  const title = isMovie ? item.title : item.name;
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const meta = {
    id: `tmdb:${item.id}`,
    type,
    name: title || "Untitled",
    poster: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : undefined,
    background: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : undefined,
    description: item.overview || undefined,
    releaseInfo: releaseDate ? releaseDate.slice(0, 4) : undefined,
    imdbRating: item.vote_average ? item.vote_average.toFixed(1) : undefined,
    genres: Array.isArray(item.genre_ids) ? item.genre_ids.map(String) : undefined
  };
  for (const key of Object.keys(meta)) {
    if (meta[key] === undefined) delete meta[key];
  }
  return meta;
}

async function getCatalogItems(catalogId, skip = 0, genreId = null) {
  const catalog = CATALOGS.find(c => c.id === catalogId);
  if (!catalog) return [];

  const page = Math.floor(Math.max(0, Number(skip) || 0) / 20) + 1;
  let data;
  if (genreId) {
    data = await tmdb(`/discover/${catalog.type === "series" ? "tv" : "movie"}`, {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page
    });
  } else {
    data = await tmdb(catalog.path, { page });
  }
  return (data.results || []).map(item => toMeta(item, catalog.type));
}

async function getGenres(type) {
  const endpoint = type === "series" ? "/genre/tv/list" : "/genre/movie/list";
  const data = await tmdb(endpoint);
  return data.genres || [];
}

module.exports = { CATALOGS, getCatalogItems, getGenres };
