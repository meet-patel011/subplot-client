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

  //new code
  const loader = document.getElementById("page-loader");
  const loaderText = document.getElementById("loader-text");

  if (row.children.length === 0) {
    loader?.classList.remove("hidden");
    if (loaderText) loaderText.textContent = "Loading content…";
  }
  //end new code

  //new code
  setTimeout(() => {
    if (row.children.length === 0) {
      loaderText.textContent = "Waking up server may take few minutes… please wait";
    }
  }, 4000);
  //end new code  

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

    // new code
    if (row.children.length > 0) {
      loader.classList.add("hidden");
    }
    //end new code

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

// Youtube
const youtubeRow = document.getElementById("youtube-row");

if (youtubeRow && Array.isArray(YOUTUBE_MOVIES)) {
  YOUTUBE_MOVIES.slice(0, 15).forEach(movie => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img class="poster" src="${movie.poster}" alt="${movie.title}" />
    `;

    card.addEventListener("click", () => {
      window.location.href =
        `details.html?id=${movie.id}&type=youtube`;
    });

    youtubeRow.appendChild(card);
  });
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


const DAY_MS = 24 * 60 * 60 * 1000;

const moodSelector = document.getElementById("moodSelector");
const watchResults = document.getElementById("watchResults");
const changeBtn = document.getElementById("changeMoodBtn");
const changePanel = document.getElementById("changePanel");

function getUserKey() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id ? `watchTonight_user_${user.id}` : "watchTonight_guest";
  } catch {
    return "watchTonight_guest";
  }
}

function isValidStored(data) {
  return data && Date.now() - data.savedAt < DAY_MS;
}

function saveSelection(data) {
  localStorage.setItem(getUserKey(), JSON.stringify(data));
}

function getSavedSelection() {
  try {
    return JSON.parse(localStorage.getItem(getUserKey()));
  } catch {
    return null;
  }
}

function renderCards(items) {
  watchResults.innerHTML = "";

  items.forEach(item => {
    const poster = item.poster_path
      ? `${IMG_POSTER}${item.poster_path}`
      : "assets/no-poster.png";

    const isTV = item.media_type === "tv";
    const typeLabel = isTV ? "Series" : "Movie";

    const dateStr = isTV ? item.first_air_date : item.release_date;
    const year = dateStr ? dateStr.split("-")[0] : "—";

    let overview = item.overview?.trim();
    if (!overview) {
      overview = "A compelling story worth watching tonight.";
    } else if (overview.length > 160) {
      overview = overview.slice(0, 160) + "…";
    }

    const card = document.createElement("div");
    card.className = "watch-card";

    card.innerHTML = `
      <img src="${poster}" />
      <div class="watch-card-content">
        <h3>${item.title || item.name}</h3>
        <div class="meta">
          ${typeLabel} • ${year}
        </div>
        <p class="watch-overview">${overview}</p>
        <div class="meta">
          ⭐ ${item.vote_average.toFixed(1)}
        </div>
      </div>
    `;

    card.onclick = () => {
      window.location.href =
        `details.html?id=${item.id}&type=${isTV ? "tv" : "movie"}`;
    };

    watchResults.appendChild(card);
  });

  watchResults.classList.remove("hidden");
  moodSelector.classList.add("hidden");
  changeBtn.classList.remove("hidden");
}

function pickRandom(arr, count = 1) {
  const shuffled = arr.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function fetchMood(mood) {
  try {
    const [
      netflixRes,
      primeRes,
      hotstarRes,
      bollywoodRes,
      trendingRes
    ] = await Promise.all([
      fetch(`${BACKEND}/api/tmdb/provider/8`),
      fetch(`${BACKEND}/api/tmdb/provider/9`),
      fetch(`${BACKEND}/api/tmdb/provider/122|337`),
      fetch(`${BACKEND}/api/tmdb/bollywood`),
      fetch(`${BACKEND}/api/tmdb/trending`)
    ]);

    const netflixData = await netflixRes.json();
    const primeData = await primeRes.json();
    const hotstarData = await hotstarRes.json();
    const bollywoodData = await bollywoodRes.json();
    const trendingData = await trendingRes.json();

    if (
      !netflixData?.results ||
      !primeData?.results ||
      !hotstarData?.results ||
      !bollywoodData?.results ||
      !trendingData?.results
    ) return [];

    const genreMap = {
      action: 28,
      thriller: 53,
      comedy: 35,
      emotional: 18
    };

    const genreId = genreMap[mood] || null;
    const prev = getSavedSelection();
    const prevIds = prev?.items?.map(i => i.id) || [];

    /* HOLLYWOOD */
    const hollywoodPool = [
      ...netflixData.results,
      ...primeData.results,
      ...hotstarData.results
    ].filter(item =>
      item.original_language === "en" &&
      item.vote_average >= 4 &&
      (!genreId || item.genre_ids?.includes(genreId)) &&
      !prevIds.includes(item.id)
    );

    /* BOLLYWOOD */
    const bollywoodPool = [
      ...bollywoodData.results,
      ...hotstarData.results.filter(i => i.original_language === "hi"),
      ...trendingData.results.filter(i => i.original_language === "hi")
    ].filter(item =>
      item.vote_average >= 3 &&
      (!genreId || item.genre_ids?.includes(genreId)) &&
      !prevIds.includes(item.id)
    );

    if (!hollywoodPool.length || !bollywoodPool.length) return [];

    const hollywoodPick =
      hollywoodPool[Math.floor(Math.random() * hollywoodPool.length)];

    const bollywoodPick =
      bollywoodPool[Math.floor(Math.random() * bollywoodPool.length)];

    return [hollywoodPick, bollywoodPick];

  } catch {
    return [];
  }
}


async function loadDefaultPicks() {
  const items = await fetchMood("emotional");
  if (items.length === 2) {
    const data = {
      mood: "default",
      items,
      savedAt: Date.now()
    };
    saveSelection(data);
    renderCards(items);
  }
}

document.addEventListener("click", async e => {
  const btn = e.target.closest("[data-mood]");
  if (!btn) return;

  const mood = btn.dataset.mood === "surprise"
    ? ["action", "thriller", "comedy", "emotional"][Math.floor(Math.random() * 4)]
    : btn.dataset.mood;

  const items = await fetchMood(mood);

  if (items.length === 2) {
    const data = { mood, items, savedAt: Date.now() };
    saveSelection(data);
    renderCards(items);
    changePanel.classList.add("hidden");
  } else {
    alert("Could not find good picks right now. Try another mood!");
  }
});

changeBtn?.addEventListener("click", () => {
  changePanel.classList.toggle("hidden");
});

(function initWatchTonight() {
  const saved = getSavedSelection();
  if (isValidStored(saved)) {
    renderCards(saved.items);
  } else {
    loadDefaultPicks();
  }
})();

/* PICK ONE (A vs B) */
const PICK_ONE_INTERVAL = 12 * 60 * 60 * 1000;
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

/* SLOT */
function getSlot() {
  return Math.floor(Date.now() / PICK_ONE_INTERVAL);
}

/* USER */
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function getUserKey() {
  const user = getUser();
  if (user && user.id) return `user_${user.id}`;

  let guest = localStorage.getItem("guest_id");
  if (!guest) {
    guest = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("guest_id", guest);
  }
  return guest;
}

/* GLOBAL PAIR */
function getGlobalPair() {
  const raw = localStorage.getItem("pick_one_global");
  if (!raw) return null;

  const data = JSON.parse(raw);
  if (data.slot === getSlot()) return data.movies;
  return null;
}

function saveGlobalPair(movies) {
  localStorage.setItem(
    "pick_one_global",
    JSON.stringify({
      slot: getSlot(),
      movies
    })
  );
}

/* USER SELECTION */
function getUserSelection(pairId) {
  return localStorage.getItem(
    `pick_one_${getUserKey()}_${getSlot()}_${pairId}`
  );
}

function saveUserSelection(pairId, movieId) {
  localStorage.setItem(
    `pick_one_${getUserKey()}_${getSlot()}_${pairId}`,
    movieId.toString()
  );
}

/* HELPERS */
function pairId(a, b) {
  return `${a.id}_${b.id}`;
}

/* FETCH FROM BACKEND ONLY */
async function fetchBollywoodPool() {
  try {
    const res = await fetch(`${BACKEND}/api/tmdb/bollywood`);
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch {
    return [];
  }
}

function pickRandomPair(pool) {
  const valid = pool.filter(m => m.poster_path);
  if (valid.length < 2) return null;
  return valid.sort(() => 0.5 - Math.random()).slice(0, 2);
}

/* RENDER */
function renderPickOne(movies, selectedId) {
  const container = document.getElementById("pickOneContainer");
  const note = document.getElementById("pickOneNote");

  container.innerHTML = "";
  note.classList.add("hidden");

  const pid = pairId(movies[0], movies[1]);

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "pick-one-card";

    if (selectedId) {
      card.classList.add(
        movie.id.toString() === selectedId ? "selected" : "faded"
      );
    }

    card.innerHTML = `
      <img class="pick-one-poster" src="${IMG_BASE}${movie.poster_path}" />
      <div class="pick-one-info">
        <h4>${movie.title}</h4>
        <span>${movie.release_date?.split("-")[0] || "—"} • Film</span>
      </div>
    `;

    card.onclick = () => {
      if (selectedId) return;
      saveUserSelection(pid, movie.id);
      renderPickOne(movies, movie.id.toString());
      note.classList.remove("hidden");
    };

    container.appendChild(card);
  });
}

/* INIT */
async function initPickOne() {
  const container = document.getElementById("pickOneContainer");
  if (!container) return;

  let movies = getGlobalPair();

  if (!movies) {
    const pool = await fetchBollywoodPool();
    const picked = pickRandomPair(pool);
    if (!picked) return;
    movies = picked;
    saveGlobalPair(movies);
  }

  const selected = getUserSelection(pairId(movies[0], movies[1]));
  renderPickOne(movies, selected);
}

initPickOne();

// News section
const HOMEPAGE_NEWS_KEY = "homepage_top_news_v1";
const HOMEPAGE_NEWS_TTL = 6 * 60 * 60 * 1000;

async function loadHomepageNews() {
  const grid = document.getElementById("featuredNewsGrid");
  if (!grid) return;

  let cached;

  try {
    cached = JSON.parse(localStorage.getItem(HOMEPAGE_NEWS_KEY));
  } catch {
    cached = null;
  }

  if (cached && Date.now() - cached.time < HOMEPAGE_NEWS_TTL) {
    renderHomepageNews(cached.articles);
    return;
  }

  try {
    const res = await fetch(`${BACKEND}/api/news/top`);
    const data = await res.json();

    if (!Array.isArray(data?.articles)) return;

    const articles = data.articles
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 2);

    localStorage.setItem(
      HOMEPAGE_NEWS_KEY,
      JSON.stringify({
        time: Date.now(),
        articles
      })
    );

    renderHomepageNews(articles);

  } catch (err) {
    console.error("Homepage news failed", err);
  }
}

function renderHomepageNews(articles) {
  const grid = document.getElementById("featuredNewsGrid");
  grid.innerHTML = "";

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "featured-news-card";

    card.innerHTML = `
      <img
        src="${article.image || 'assets/placeholder-news.jpg'}"
        alt="${article.title}"
      />
      <div class="featured-news-content">
        <span class="news-source">${article.source?.name || "News"}</span>
        <h4>${article.title}</h4>
        <p>${article.description || ""}</p>
      </div>
    `;

    card.onclick = () => {
      window.location.href = "news.html";
    };

    grid.appendChild(card);
  });
}

loadHomepageNews();

