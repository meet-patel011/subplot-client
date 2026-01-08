const BACKEND = API_BASE.replace("/api", "");

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const key = params.get("franchise");

  const titleEl = document.getElementById("franchiseTitle");
  const grid = document.getElementById("franchiseGrid");

  if (!key || !FRANCHISE_MAP[key]) {
    titleEl.textContent = "Franchise not found";
    return;
  }

  const config = FRANCHISE_MAP[key];
  titleEl.textContent = config.title;

  async function loadFranchise() {
    let allResults = [];

    try {

      if (config.curated) {
        const moviePromises = (config.curated.movies || []).map(id =>
          fetch(`${BACKEND}/api/tmdb/details/movie/${id}`)
            .then(r => r.json())
            .then(d => ({ ...d, media_type: "movie" }))
        );

        const tvPromises = (config.curated.series || []).map(id =>
          fetch(`${BACKEND}/api/tmdb/details/tv/${id}`)
            .then(r => r.json())
            .then(d => ({ ...d, media_type: "tv" }))
        );

        allResults.push(
          ...(await Promise.all(moviePromises)),
          ...(await Promise.all(tvPromises))
        );
      }

      if (config.sources) {
        for (const src of config.sources) {
          const items = await fetchBySource(src);
          allResults.push(...items);
        }
      }

      renderResults(deduplicate(allResults));
    } catch (err) {
      console.error("Franchise load failed:", err);
    }
  }

  async function fetchBySource(src) {
    let items = [];

    // COLLECTION
    if (src.type === "collection") {
      const res = await fetch(
        `${BACKEND}/api/tmdb/collection/${src.value}`
      );
      const data = await res.json();
      (data.parts || []).forEach(i =>
        items.push({ ...i, media_type: "movie" })
      );
    }

    // KEYWORD MOVIE
    if (src.type === "keyword-movie") {
      const res = await fetch(
        `${BACKEND}/api/tmdb/discover/movie?with_keywords=${src.value}&sort_by=popularity.desc`
      );
      const data = await res.json();
      (data.results || []).forEach(i =>
        items.push({ ...i, media_type: "movie" })
      );
    }

    // KEYWORD TV
    if (src.type === "keyword-tv") {
      const res = await fetch(
        `${BACKEND}/api/tmdb/discover/tv?with_keywords=${src.value}&sort_by=popularity.desc`
      );
      const data = await res.json();
      (data.results || []).forEach(i =>
        items.push({ ...i, media_type: "tv" })
      );
    }

    // COMPANY MOVIE
    if (src.type === "company-movie") {
      const res = await fetch(
        `${BACKEND}/api/tmdb/discover/movie?with_companies=${src.value}&sort_by=popularity.desc`
      );
      const data = await res.json();
      (data.results || []).forEach(i =>
        items.push({ ...i, media_type: "movie" })
      );
    }

    // COMPANY TV
    if (src.type === "company-tv") {
      const res = await fetch(
        `${BACKEND}/api/tmdb/discover/tv?with_companies=${src.value}&sort_by=popularity.desc`
      );
      const data = await res.json();
      (data.results || []).forEach(i =>
        items.push({ ...i, media_type: "tv" })
      );
    }

    return items;
  }

  /* DEDUPLICATION */
  function deduplicate(items) {
    const map = new Map();
    items.forEach(item => {
      const key = `${item.media_type}-${item.id}`;
      if (!map.has(key)) map.set(key, item);
    });
    return Array.from(map.values());
  }

  /* RENDER */
  function renderResults(items) {
    grid.innerHTML = "";

    items.forEach(item => {
      if (!item.poster_path) return;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${IMG_POSTER}${item.poster_path}" alt="${item.title || item.name}" />
      `;

      card.onclick = () => {
        window.location.href =
          `details.html?id=${item.id}&type=${item.media_type}`;
      };

      grid.appendChild(card);
    });
  }

  loadFranchise();
});
