console.log("Featured trailers JS loaded");

const BACKEND_URL =
  typeof API_BASE !== "undefined"
    ? API_BASE.replace("/api", "")
    : "https://subplot-server.onrender.com";


async function fetchFeaturedTrailers() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/featured-trailers`, {
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`Failed to load trailers (${res.status})`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];

  } catch (err) {
    console.error("Trailer fetch error:", err);
    return [];
  }
}

function getYouTubeId(url) {
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match ? match[1] : null;
}

async function renderFeaturedTrailers() {
  const row = document.querySelector(".trailer-row");
  if (!row) return;

  const trailers = await fetchFeaturedTrailers();

  if (!trailers.length) {
    row.innerHTML = `
      <div class="no-trailer-msg">
        No trailers available. Refresh the page!
      </div>
    `;
    return;
  }

  row.innerHTML = "";

  trailers.forEach(item => {
    const videoId = getYouTubeId(item.youtubeUrl);

    const card = document.createElement("div");
    card.className = "trailer-card";

    if (!videoId) {
      card.innerHTML = `
        <div class="trailer-info">
          <h3>${item.title || "Trailer"}</h3>
          <p>Trailer not available at the moment.</p>
        </div>
      `;
      row.appendChild(card);
      return;
    }

    card.innerHTML = `
      <div class="trailer-thumb">
        <img
          src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg"
          alt="${item.title || "Trailer"}"
          onerror="this.onerror=null;this.src='assets/trailer-fallback.jpg';"
        />
        <div class="trailer-play">
          <span>▶</span>
        </div>
      </div>

      <div class="trailer-info">
        <h3>${item.title}</h3>
        <p>${item.description || "Watch trailer now"}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      openTrailerModal(videoId);
    });

    row.appendChild(card);
  });
}

function openTrailerModal(videoId) {
  const modal = document.getElementById("trailerModal");
  const frame = document.getElementById("trailerFrame");

  if (!modal || !frame) return;

  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  modal.classList.remove("hidden");
}

function closeTrailerModal() {
  const modal = document.getElementById("trailerModal");
  const frame = document.getElementById("trailerFrame");

  if (!modal || !frame) return;

  modal.classList.add("hidden");
  frame.src = "";
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeaturedTrailers();

  const trailerRow = document.querySelector(".featured-trailers .trailer-row");
  if (trailerRow && window.innerWidth > 768) {
    trailerRow.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        trailerRow.scrollLeft += e.deltaY;
      },
      { passive: false }
    );
  }

  const closeBtn = document.querySelector(".close-trailer");
  const modal = document.getElementById("trailerModal");

  closeBtn?.addEventListener("click", closeTrailerModal);

  modal?.addEventListener("click", e => {
    if (e.target === modal) closeTrailerModal();
  });
});
