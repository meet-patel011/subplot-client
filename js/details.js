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

  /* FETCH MAIN DETAILS */
  async function fetchDetails() {
    try {
      const res = await fetch(`${BACKEND}/api/tmdb/details/${type}/${id}?language=en-US`);
      const data = await res.json();

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

    } catch (err) {
      console.error("Failed to load cast & crew:", err);
    }
  }

  /* TRAILER */
  const trailerBtn = document.getElementById("heroTrailerBtn");
  const trailerModal = document.getElementById("trailerModal");
  const trailerFrame = document.getElementById("trailerFrame");
  const closeTrailer = document.querySelector(".close-trailer");

  if (trailerBtn) {
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

  async function loadRatingBars() {
    const res = await fetch(`http://localhost:5000/api/reviews/ratings/${type}/${id}`);
    const data = await res.json();

    const ratings = data.ratings || {1:0,2:0,3:0,4:0};
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

        await fetch("http://localhost:5000/api/reviews", {
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
    const res = await fetch(`http://localhost:5000/api/reviews/${type}/${id}`);
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
      await fetch("http://localhost:5000/api/reviews", {
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
    await fetch("http://localhost:5000/api/watchlist", {
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
    if (!data.results) return;

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

  fetchDetails();
  fetchCast();
  fetchRecommendations();
  loadRatingBars();
  loadReviews();

});
