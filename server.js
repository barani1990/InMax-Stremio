
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
  id: "org.tamilmv.recent",
  version: "1.2.2",
  name: "InMax",
  description: "InMax catalog for authorized media sources",
  resources: ["catalog", "meta", "stream"],
  types: ["movie", "series"],
  idPrefixes: ["inmax-"],
  catalogs: [
    { type: "movie", id: "tamilmv-now", name: "InMax Movies" },
    { type: "series", id: "tamilmv-series", name: "InMax Series" },
    { type: "series", id: "tamilmv-shows", name: "InMax TV Shows" }
  ]
};

const builder = new addonBuilder(manifest);

const sampleMovie = {
  id: "inmax-bbb",
  type: "movie",
  name: "Big Buck Bunny",
  description: "Public-domain animated film sample",
  releaseInfo: "2008",
  poster: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg"
};

const sampleSeries = {
  id: "inmax-sample-series",
  type: "series",
  name: "InMax Series Test",
  description: "Sample entry to test the series catalog",
  releaseInfo: "2025"
};

const sampleShow = {
  id: "inmax-sample-show",
  type: "series",
  name: "InMax TV Show Test",
  description: "Sample entry to test the TV-show catalog",
  releaseInfo: "2025"
};

builder.defineCatalogHandler(({ type, id }) => {
  if (type === "movie" && id === "tamilmv-now") {
    return Promise.resolve({ metas: [sampleMovie] });
  }

  if (type === "series" && id === "tamilmv-series") {
    return Promise.resolve({ metas: [sampleSeries] });
  }

  if (type === "series" && id === "tamilmv-shows") {
    return Promise.resolve({ metas: [sampleShow] });
  }

  return Promise.resolve({ metas: [] });
});

builder.defineMetaHandler(({ type, id }) => {
  if (type === "movie" && id === "inmax-bbb") {
    return Promise.resolve({ meta: sampleMovie });
  }

  if (type === "series" && id === "inmax-sample-series") {
    return Promise.resolve({ meta: sampleSeries });
  }

  if (type === "series" && id === "inmax-sample-show") {
    return Promise.resolve({ meta: sampleShow });
  }

  return Promise.resolve({ meta: null });
});

builder.defineStreamHandler(({ type, id }) => {
  if (type === "movie" && id === "inmax-bbb") {
    return Promise.resolve({
      streams: [{
        title: "Public-domain sample",
        url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      }]
    });
  }

  return Promise.resolve({ streams: [] });
});

serveHTTP(builder.getInterface(), {
  port: process.env.PORT || 7000,
  host: "0.0.0.0"
});
