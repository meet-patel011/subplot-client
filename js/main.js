const BACKEND = API_BASE.replace("/api", "");

/* HORIZONTAL SCROLL (ROWS ONLY)*/
document.querySelectorAll(".row").forEach((row) => {
  row.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    },
    { passive: false }
  );
});

/* BROWSE DROPDOWN */
const browseBtn = document.getElementById("browseBtn");
const browseDropdown = document.getElementById("browseDropdown");

if (browseBtn && browseDropdown) {
  browseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    browseDropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    browseDropdown.classList.remove("show");
  });
}

/* CARD CREATOR */
function createCard(item, forceType = null) {
  const poster = item.poster_path
    ? `${IMG_POSTER}${item.poster_path}`
    : "assets/no-poster.png";

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img class="poster" src="${poster}" alt="${item.title || item.name || ""}" />
  `;

  const mediaType = forceType || item.media_type || "movie";

  card.addEventListener("click", () => {
    window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
  });

  return card;
}

/* TRENDING (MOVIE + TV) */
async function loadTrending() {
  const row = document.getElementById("trending-row");
  if (!row) return;

  row.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND}/api/tmdb/trending`);
    const data = await res.json();

    if (!data.results) {
      console.error("Trending: No results", data);
      return;
    }

    data.results.slice(0, 15).forEach((item) => {
      const card = createCard(item);
      if (card) row.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load trending", err);
  }
}

/* Newly Releases */
async function loadUpcoming() {
  const row = document.getElementById("upcoming-row");
  if (!row) return;

  row.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND}/api/tmdb/upcoming`);
    const data = await res.json();

    if (!data.results) {
      console.error("Upcoming: No results", data);
      return;
    }

    data.results.slice(0, 15).forEach((item) => {
      const card = createCard(item, "movie");
      if (card) row.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load newly releasing movies", err);
  }
}

/* STREAMING PROVIDERS */
async function loadByProvider(providerId, rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;

  row.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND}/api/tmdb/provider/${providerId}`);
    const data = await res.json();

    if (!data.results) {
      console.error(`Provider ${providerId}: No results`, data);
      return;
    }

    data.results.slice(0, 15).forEach((item) => {
      const card = createCard(item, "movie");
      if (card) row.appendChild(card);
    });

  } catch (err) {
    console.error(`Failed to load provider ${providerId}`, err);
  }
}

/* BOLLYWOOD */
async function loadBollywood() {
  const row = document.getElementById("bollywood-row");
  if (!row) return;

  row.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND}/api/tmdb/bollywood`);
    const data = await res.json();

    if (!data.results) {
      console.error("Bollywood: No results", data);
      return;
    }

    data.results.slice(0, 15).forEach((item) => {
      const card = createCard(item, "movie");
      if (card) row.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load Bollywood", err);
  }
}

/* ANIME */
async function loadAnime() {
  const row = document.getElementById("anime-row");
  if (!row) return;

  row.innerHTML = "";

  try {
    const res = await fetch(`${BACKEND}/api/tmdb/anime`);
    const data = await res.json();

    if (!data.results) {
      console.error("Anime: No results", data);
      return;
    }

    data.results.slice(0, 15).forEach((item) => {
      const card = createCard(item, "tv");
      if (card) row.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load Anime", err);
  }
}

/* SEARCH BAR */
const searchInput = document.querySelector(".search-box input");

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      if (!q) return;
      window.location.href = `search.html?query=${encodeURIComponent(q)}`;
    }
  });
}

/* HOME SPOTLIGHT SEARCH */
(function () {
  const homeSearchInput = document.getElementById("homeSearchInput");
  if (!homeSearchInput) return;

  const placeholders = [
    "Search movies, series, or characters…",
    "Try Inception, Dark, Breaking Bad…",
    "Explore Marvel, DC, Star Wars…",
    "Looking for something intense?",
    "Find your next favorite story…"
  ];

  let index = 0;
  let intervalId = null;

  function startRotation() {
    intervalId = setInterval(() => {
      index = (index + 1) % placeholders.length;
      homeSearchInput.placeholder = placeholders[index];
    }, 3000);
  }

  function stopRotation() {
    clearInterval(intervalId);
  }

  startRotation();

  homeSearchInput.addEventListener("focus", stopRotation);
  homeSearchInput.addEventListener("blur", startRotation);

  homeSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = homeSearchInput.value.trim();
      if (!q) return;
      window.location.href = `search.html?query=${encodeURIComponent(q)}`;
    }
  });
})();


loadTrending();
loadUpcoming();
loadByProvider(8, "netflix-row");
loadByProvider(9, "prime-row");
loadByProvider("122|337", "hotstar-row");
loadBollywood();
loadAnime();
