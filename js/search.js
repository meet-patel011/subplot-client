// USE BACKEND FROM CONFIG
const BACKEND = API_BASE.replace("/api", "");

const params = new URLSearchParams(window.location.search);
const query = params.get("query");

const title = document.getElementById("search-title");
const resultsGrid = document.getElementById("search-results");

if (title) {
  title.textContent = query
    ? `Results for "${query}"`
    : "Search Results";
}

async function loadSearchResults() {
  if (!query || !resultsGrid) return;

  resultsGrid.innerHTML = "<p>Searching...</p>";

  try {
    const res = await fetch(
      `${BACKEND}/api/tmdb/search?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsGrid.innerHTML = `<p>No results found.</p>`;
      return;
    }

    resultsGrid.innerHTML = "";

    data.results.forEach(item => {
      if (!item.poster_path && !item.profile_path) return;

      const mediaType = item.media_type;
      if (!["movie", "tv", "person"].includes(mediaType)) return;

      const img = item.poster_path
        ? IMG_POSTER + item.poster_path
        : item.profile_path
        ? IMG_POSTER + item.profile_path
        : "assets/no-poster.png";

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${img}" alt="">
        <h4>${item.title || item.name}</h4>
        <p class="muted">${mediaType.toUpperCase()}</p>
      `;

      card.addEventListener("click", () => {
        if (mediaType === "person") {
          window.location.href = `person.html?id=${item.id}`;
        } else {
          window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
        }
      });

      resultsGrid.appendChild(card);
    });

  } catch (err) {
    console.error("Search failed:", err);
    resultsGrid.innerHTML = `<p>Error loading results. Please try again.</p>`;
  }
}

loadSearchResults();
