document.addEventListener("DOMContentLoaded", async () => {

  await checkAuth();
  const BACKEND = API_BASE.replace("/api", "");

  /* READ URL PARAMETERS */
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const type = params.get("type");

  if (!id || !type) {
    console.error("Missing id or type in URL");
    return;
  }

  /* DOM ELEMENTS */
  const heroBg = document.querySelector(".hero-bg");
  const posterEl = document.querySelector(".hero-poster");
  const titleEl = document.querySelector(".hero-title");
  const metaEl = document.querySelector(".hero-meta");
  const overviewEl = document.querySelector(".hero-overview");
  const genresEl = document.querySelector(".hero-genres");

  const seasonsSection = document.getElementById("seasons-section");
  const seasonsRow = document.getElementById("seasons-row");
  const castRow = document.getElementById("cast-row");
  const crewList = document.getElementById("crew-list");

  // youtube content
  if (type === "youtube") {
    const movie = Array.isArray(YOUTUBE_MOVIES)
      ? YOUTUBE_MOVIES.find(m => m.id === id)
      : null;

    if (!movie) {
      console.error("YouTube movie not found");
      return;
    }

    heroBg.style.background = "#000";
    posterEl.src = movie.poster;
    titleEl.textContent = movie.title;

    metaEl.innerHTML = `
      <span>${movie.language}</span>
      <span>•</span>
      <span>${movie.industry}</span>
      <span>•</span>
      <span>Free on YouTube</span>
    `;

    overviewEl.textContent = "";
    genresEl.innerHTML = "";

    seasonsSection && (seasonsSection.style.display = "none");

    document.querySelectorAll(".details-section").forEach(sec => {
      sec.style.display = "none";
    });

    const watchlistBtn = document.querySelector(".btn.secondary");
    if (watchlistBtn) watchlistBtn.style.display = "none";

    const trailerBtn = document.getElementById("heroTrailerBtn");
    if (trailerBtn) {
      trailerBtn.textContent = "▶ Watch Full Movie on YouTube";

      trailerBtn.onclick = () => {
        window.location.href = movie.youtubeUrl;

      };
    }
    return;
  }


  /* FETCH MAIN DETAILS */
  async function fetchDetails() {
    try {
      const res = await fetch(`${BACKEND}/api/tmdb/details/${type}/${id}?language=en-US`);
      const data = await res.json();
      window.__TMDB_DATA__ = data;


      if (data.backdrop_path) {
        heroBg.style.backgroundImage = `url(${IMG_BACKDROP}${data.backdrop_path})`;
      }

      posterEl.src = `${IMG_POSTER}${data.poster_path}`;
      titleEl.textContent = data.title || data.name;

      metaEl.innerHTML = `
        <span>${(data.release_date || data.first_air_date || "N/A").slice(0,4)}</span>
        <span>•</span>
        <span>${type === "tv" ? "TV Series" : "Movie"}</span>
      `;

      const releaseDate = data.release_date || data.first_air_date;
      const isReleased = releaseDate && new Date(releaseDate) <= new Date();

      if (!isReleased) {
        // removes entire ratings section with title
        const ratingsSection = document.querySelector(".details-section:has(.rating-container)");
        ratingsSection?.remove();
      }


      overviewEl.textContent = data.overview || "No description available.";

      genresEl.innerHTML = "";
      data.genres.forEach(g => {
        const span = document.createElement("span");
        span.textContent = g.name;
        genresEl.appendChild(span);
      });

      if (type === "tv" && data.seasons && seasonsRow) {
        seasonsRow.innerHTML = "";
        data.seasons.forEach(season => {
          if (season.episode_count === 0) return;
          const card = document.createElement("div");
          card.className = "season-card";
          card.innerHTML = `
            <strong>${season.name}</strong>
            <small>${season.episode_count} Episodes</small>
          `;
          seasonsRow.appendChild(card);
        });
      } else if (seasonsSection) {
        seasonsSection.style.display = "none";
      }

    } catch (err) {
      console.error("Failed to load details:", err);
    }
  }

  /* FETCH CAST & CREW */
  async function fetchCast() {
    try {
      const res = await fetch(`${BACKEND}/api/tmdb/details/${type}/${id}/credits`);
      const data = await res.json();

      castRow.innerHTML = "";
      data.cast.slice(0, 12).forEach(actor => {
        if (!actor.profile_path) return;
        const card = document.createElement("div");
        card.className = "cast-card";
        card.innerHTML = `
          <img src="${IMG_POSTER}${actor.profile_path}" />
          <p>${actor.name}</p>
        `;
        castRow.appendChild(card);
      });

      crewList.innerHTML = "";
      data.crew
        .filter(p => ["Director", "Producer", "Executive Producer"].includes(p.job))
        .slice(0, 6)
        .forEach(person => {
          if (!person.profile_path) return;
          const div = document.createElement("div");
          div.className = "crew-card";
          div.innerHTML = `
            <img src="${IMG_POSTER}${person.profile_path}" />
            <p>${person.name}</p>
            <span>${person.job}</span>
          `;
          crewList.appendChild(div);
        });

        //REMOVE CAST SECTION IF EMPTY
        if (castRow.children.length === 0) {
          castRow.closest(".details-section")?.remove();
        }

        //REMOVE CREW SECTION IF EMPTY
        if (crewList.children.length === 0) {
          crewList.closest(".details-section")?.remove();
        }


    } catch (err) {
      console.error("Failed to load cast & crew:", err);
    }
  }

  /* TRAILER */
  const trailerBtn = document.getElementById("heroTrailerBtn");
  const trailerModal = document.getElementById("trailerModal");
  const trailerFrame = document.getElementById("trailerFrame");
  const closeTrailer = document.querySelector(".close-trailer");

  if (trailerBtn && type !== "youtube") {
    trailerBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`${BACKEND}/api/tmdb/details/${type}/${id}/videos`);
        const data = await res.json();

        const video =
          data.results.find(v => v.site === "YouTube" && v.type === "Trailer") ||
          data.results.find(v => v.site === "YouTube");

        if (!video) {
          alert("No trailer available.");
          return;
        }

        trailerFrame.src = `https://www.youtube.com/embed/${video.key}?autoplay=1`;
        trailerModal.classList.remove("hidden");

      } catch (err) {
        console.error("Trailer load failed:", err);
      }
    });
  }

  closeTrailer?.addEventListener("click", () => {
    trailerModal.classList.add("hidden");
    trailerFrame.src = "";
  });

  trailerModal?.addEventListener("click", (e) => {
    if (e.target === trailerModal) {
      trailerModal.classList.add("hidden");
      trailerFrame.src = "";
    }
  });

  /* RATINGS */
  const ratingBtns = document.querySelectorAll(".rating-btn");
  const ratingNote = document.querySelector(".rating-note");

  const fills = {
    1: document.getElementById("fill-1"),
    2: document.getElementById("fill-2"),
    3: document.getElementById("fill-3"),
    4: document.getElementById("fill-4")
  };

  function getDefaultRatingsFromTMDB(tmdbData) {
    const avg = tmdbData?.vote_average || 0;
    const votes = tmdbData?.vote_count || 0;

    if (avg >= 8 && votes > 1000) {
      return { 1: 4, 2: 12, 3: 39, 4: 50 };
    }

    if (avg >= 7) {
      return { 1: 10, 2: 25, 3: 40, 4: 25 };
    }

    if (avg >= 6) {
      return { 1: 18, 2: 42, 3: 30, 4: 10 };
    }

    return { 1: 30, 2: 40, 3: 20, 4: 10 };
  }


  async function loadRatingBars() {
    const res = await fetch(`https://subplot-server.onrender.com/api/reviews/ratings/${type}/${id}`);
    const data = await res.json();

    const realRatings = data.ratings || {1:0,2:0,3:0,4:0};
    const defaults = window.__TMDB_DATA__
      ? getDefaultRatingsFromTMDB(window.__TMDB_DATA__)
      : {1:0,2:0,3:0,4:0};

    const ratings = {
      1: (defaults[1] || 0) + (realRatings[1] || 0),
      2: (defaults[2] || 0) + (realRatings[2] || 0),
      3: (defaults[3] || 0) + (realRatings[3] || 0),
      4: (defaults[4] || 0) + (realRatings[4] || 0)
    };

    const total = Object.values(ratings).reduce((a,b)=>a+b,0) || 1;

    Object.keys(fills).forEach(k => {
      fills[k].style.width = `${Math.round((ratings[k] / total) * 100)}%`;
    });
  }

  const autoReviews = {
    1: "Did not enjoy this title.",
    2: "It was okay, a decent one-time watch.",
    3: "Really liked it, worth watching.",
    4: "Absolutely loved it, a must watch!"
  };

  if (!window.AUTH_USER) {
    ratingBtns.forEach(b => b.disabled = true);
    ratingNote.textContent = "🔒 Login to rate and see the community verdict.";
  } else {
    ratingBtns.forEach(btn => {
      btn.addEventListener("click", async () => {
        const ratingValue = Number(btn.dataset.rating);
        const token = localStorage.getItem("accessToken");

        await fetch("https://subplot-server.onrender.com/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            tmdbId: Number(id),
            mediaType: type,
            rating: ratingValue,
            review: autoReviews[ratingValue]
          })
        });

        ratingBtns.forEach(b => b.disabled = true);
        loadRatingBars();
        loadReviews();
      });
    });
  }

  /* REVIEWS */
  const commentInput = document.getElementById("commentInput");
  const commentSubmit = document.getElementById("commentSubmit");
  const commentsList = document.getElementById("commentsList");

  async function loadReviews() {
    const res = await fetch(`https://subplot-server.onrender.com/api/reviews/${type}/${id}`);
    const data = await res.json();

    commentsList.innerHTML = "";

    data.reviews.forEach(r => {
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-header">
          <img class="review-avatar" src="${
            r.user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              r.user.username
            )}&background=6366f1&color=fff&size=128`
          }" />

          <strong>${r.user.username}</strong><br>
          <span>posted on ${new Date(r.createdAt).toLocaleDateString()}</span>
        </div>
        <p>${r.review || ""}</p>
      `;
      commentsList.appendChild(card);
    });
  }

  if (!window.AUTH_USER) {
    commentInput.disabled = true;
    commentSubmit.disabled = true;
    commentInput.placeholder = "Login to write a review";
  } else {
    commentSubmit.addEventListener("click", async () => {
      const text = commentInput.value.trim();
      if (!text) return;

      const token = localStorage.getItem("accessToken");
      await fetch("https://subplot-server.onrender.com/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tmdbId: Number(id),
          mediaType: type,
          rating: 4,
          review: text
        })
      });

      commentInput.value = "";
      loadReviews();
    });
  }

  /* WATCHLIST */
  const watchlistBtn = document.querySelector(".btn.secondary");
  watchlistBtn.addEventListener("click", async () => {
    if (!window.AUTH_USER) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    const token = localStorage.getItem("accessToken");
    await fetch("https://subplot-server.onrender.com/api/watchlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tmdbId: Number(id),
        mediaType: type,
        title: titleEl.textContent,
        poster: posterEl.src
      })
    });

    watchlistBtn.textContent = "✓ Added";
  });

  /* RECOMMENDATIONS */
  async function fetchRecommendations() {
    const row = document.getElementById("recommendations-row");
    if (!row) return;

    const res = await fetch(`${BACKEND}/api/tmdb/details/${type}/${id}/recommendations`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      // remove whole recommendations section (title + row)
      document.getElementById("recommendations-row")
        ?.closest(".details-section")
        ?.remove();
      return;
    }


    row.innerHTML = "";

    data.results.slice(0, 15).forEach(item => {
      if (!item.poster_path) return;

      const card = document.createElement("a");
      card.className = "card";
      card.href = `details.html?id=${item.id}&type=${type}`;
      card.innerHTML = `
        <img src="${IMG_POSTER}${item.poster_path}" />
        <div class="card-overlay"></div>
      `;
      row.appendChild(card);
    });

    row.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        row.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  if (type !== "youtube") {
    await fetchDetails();
    fetchCast();
    fetchRecommendations();
    loadRatingBars();
    loadReviews();
  }  
});

