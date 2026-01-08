// BACKEND BASE 
const BACKEND = API_BASE.replace("/api", "");

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const genreKey = params.get("genre");

  const titleEl = document.getElementById("genreTitle");
  const grid = document.getElementById("genreGrid");

  if (!genreKey) {
    titleEl.textContent = "Genre not found";
    return;
  }

  /* GENRE MAP */
  const GENRE_MAP = {
    action: { title: "Action", movie: 28, tv: 10759 },
    comedy: { title: "Comedy", movie: 35, tv: 35 },
    drama: { title: "Drama", movie: 18, tv: 18 },
    horror: { title: "Horror", movie: 27, tv: 9648 },
    thriller: { title: "Thriller", movie: 53, tv: 53 },
    mystery: { title: "Mystery", movie: 9648, tv: 9648 },
    romance: { title: "Romance", movie: 10749, tv: 10749 },
    "sci-fi": { title: "Sci-Fi", movie: 878, tv: 10765 },
    informative: { title: "Informative", movie: 99, tv: 99 },
    adventure: { title: "Adventure", genre: 12 }
  };

  const config = GENRE_MAP[genreKey];

  if (!config) {
    titleEl.textContent = "Genre not found";
    return;
  }

  titleEl.textContent = config.title;

  try {
    let results = [];

    /* MOVIES */
    if (config.movie) {
      const res = await fetch(
        `${BACKEND}/api/tmdb/discover/movie?with_genres=${config.movie}&sort_by=popularity.desc`
      );
      const data = await res.json();
      (data.results || []).forEach(item =>
        results.push({ ...item, media_type: "movie" })
      );
    }

    /* TV SERIES */
    if (config.tv) {
      const res = await fetch(
        `${BACKEND}/api/tmdb/discover/tv?with_genres=${config.tv}&sort_by=popularity.desc`
      );
      const data = await res.json();
      (data.results || []).forEach(item =>
        results.push({ ...item, media_type: "tv" })
      );
    }

    /* SHARED GENRE (MOVIE + TV) */
    if (config.genre) {
      const movieRes = await fetch(
        `${BACKEND}/api/tmdb/discover/movie?with_genres=${config.genre}&sort_by=popularity.desc`
      );
      const movieData = await movieRes.json();

      const tvRes = await fetch(
        `${BACKEND}/api/tmdb/discover/tv?with_genres=${config.genre}&sort_by=popularity.desc`
      );
      const tvData = await tvRes.json();

      results = [
        ...(movieData.results || []).map(i => ({ ...i, media_type: "movie" })),
        ...(tvData.results || []).map(i => ({ ...i, media_type: "tv" }))
      ];
    }

    /* KEYWORD FALLBACK */
    if (config.keyword) {
      const res = await fetch(
        `${BACKEND}/api/tmdb/discover/movie?with_keywords=${config.keyword}&sort_by=popularity.desc`
      );
      const data = await res.json();
      (data.results || []).forEach(item =>
        results.push({ ...item, media_type: "movie" })
      );
    }

    renderResults(deduplicate(results));

  } catch (err) {
    console.error("Genre load failed:", err);
  }

  // HELPERS 
  function deduplicate(items) {
    const map = new Map();
    items.forEach(item => {
      const key = `${item.media_type}-${item.id}`;
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  }

  function renderResults(items) {
    grid.innerHTML = "";

    items.forEach(item => {
      if (!item.poster_path) return;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${IMG_POSTER}${item.poster_path}" alt="${item.title || item.name}" />
      `;

      card.addEventListener("click", () => {
        window.location.href =
          `details.html?id=${item.id}&type=${item.media_type}`;
      });

      grid.appendChild(card);
    });
  }
});
