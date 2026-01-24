const BACKEND = API_BASE.replace("/api", "");

async function fetchDetails(query, container) {
  if (!query) return;

  const res = await fetch(
    `${BACKEND}/api/tmdb/search?q=${encodeURIComponent(query)}`
  );
  const data = await res.json();

  if (!data.results) return;

  const item = data.results.find(
    i => i.media_type === "movie" || i.media_type === "tv"
  );
  if (!item) return;

  const detailRes = await fetch(
    `${BACKEND}/api/tmdb/details/${item.media_type}/${item.id}`
  );
  const details = await detailRes.json();

  renderCard(details, item.media_type, container);
}

function renderCard(data, type, container) {
  const profit =
    data.budget && data.revenue
      ? data.revenue - data.budget
      : null;

  const roi =
    profit && data.budget
      ? ((profit / data.budget) * 100).toFixed(1)
      : null;

  container.innerHTML = `
    <img class="compare-poster" src="${IMG_POSTER}${data.poster_path}" />

    <div class="compare-title">${data.title || data.name}</div>
    <div class="compare-meta">
      ${type.toUpperCase()} • ${(data.release_date || data.first_air_date || "").slice(0,4)}
    </div>

    <div class="compare-section">
      <h4>Quality & Popularity</h4>
      <div class="compare-row"><span>Rating</span><span>${data.vote_average.toFixed(1)}/10</span></div>
      <div class="compare-row"><span>Votes</span><span>${data.vote_count}</span></div>
      <div class="compare-row"><span>Popularity</span><span>${Math.round(data.popularity)}</span></div>
    </div>

    <div class="compare-section">
      <h4>Financial Performance</h4>
      <div class="compare-row"><span>Budget</span><span>${data.budget ? "$" + data.budget.toLocaleString() : "N/A"}</span></div>
      <div class="compare-row"><span>Revenue</span><span>${data.revenue ? "$" + data.revenue.toLocaleString() : "N/A"}</span></div>
      <div class="compare-row"><span>Profit</span><span>${profit ? "$" + profit.toLocaleString() : "N/A"}</span></div>
      <div class="compare-row"><span>ROI</span><span>${roi ? roi + "%" : "N/A"}</span></div>
    </div>

    <div class="compare-section">
      <h4>Content</h4>
      <div class="compare-row"><span>Genres-</span><span>${data.genres.map(g => g.name).join(", ")}</span></div>
      <div class="compare-row"><span>Runtime</span><span>${data.runtime || data.episode_run_time?.[0] || "N/A"} min</span></div>
      <h6 style="
        margin: 6px 0 10px;
        font-size: 12px;
        font-weight: 500;
        color: #8fa2ff;
        opacity: 0.9;
      ">
        Ratings and popularity are based on TMDB user data and may differ from Google, IMDb, or Rotten Tomatoes.
      </h6>
    </div>
  `;
}

document.getElementById("leftInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    fetchDetails(e.target.value, document.getElementById("leftCard"));
  }
});

document.getElementById("rightInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    fetchDetails(e.target.value, document.getElementById("rightCard"));
  }
});

document.getElementById("leftInput").addEventListener("change", e => {
  fetchDetails(e.target.value, document.getElementById("leftCard"));
});

document.getElementById("rightInput").addEventListener("change", e => {
  fetchDetails(e.target.value, document.getElementById("rightCard"));
});