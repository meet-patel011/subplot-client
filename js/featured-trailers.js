console.log("Featured trailers JS loaded");

/* DAILY TRAILER DATA */
const DAILY_TRAILERS = [
  {
    title: "O'Romeo",
    description: "This Valentine’s, feel a love that’s pure and devotional! ",
    youtubeUrl: "https://youtu.be/2M4hKmuBzUU?si=quQ-6atAKNlgpKsn"
  },
  {
    title: "Masters of The Universe",
    description:
      "Discover your true power. Watch the Hindi Teaser Trailer for Masters Of The Universe now, and see the movie only in cinemas on 5 June, in English, Hindi, Tamil and Telugu.",
    youtubeUrl: "https://youtu.be/ZmEx7wQI6RY?si=ZCReHzg4aBrEQrhb"
  },
  {
    title: "Mayasabha",
    description: "Mayasabha — The hall of illusion..Trailer out now !!",
    youtubeUrl: "https://youtu.be/NR5zwpCZ6Fs?si=ASHHBDn4-wHtZG3R"
  },

];


function getYouTubeId(url) {
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match ? match[1] : null;
}

function renderFeaturedTrailers() {
  const row = document.querySelector(".trailer-row");
  if (!row) return;

  if (!Array.isArray(DAILY_TRAILERS) || DAILY_TRAILERS.length === 0) {
    row.innerHTML = `
      <div class="no-trailer-msg">
        🎬 No trailers available right now. Check back soon!
      </div>
    `;
    return;
  }

  row.innerHTML = "";

  DAILY_TRAILERS.forEach(item => {
    const videoId = getYouTubeId(item.youtubeUrl);


    if (!videoId) {
      const fallback = document.createElement("div");
      fallback.className = "trailer-card";
      fallback.innerHTML = `
        <div class="trailer-info">
          <h3>${item.title || "Trailer"}</h3>
          <p>Trailer not available at the moment.</p>
        </div>
      `;
      row.appendChild(fallback);
      return;
    }

    const card = document.createElement("div");
    card.className = "trailer-card";

    card.innerHTML = `
      <div class="trailer-thumb">
        <img
          src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg"
          alt="${item.title}"
          onerror="this.src='assets/trailer-fallback.jpg'"
        />
        <div class="trailer-play">
          <span>▶</span>
        </div>
      </div>

      <div class="trailer-info">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
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

  const closeBtn = document.querySelector(".close-trailer");
  const modal = document.getElementById("trailerModal");

  closeBtn?.addEventListener("click", closeTrailerModal);

  modal?.addEventListener("click", e => {
    if (e.target === modal) closeTrailerModal();
  });
});
