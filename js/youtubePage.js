document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("youtubeGrid");
  if (!grid || !Array.isArray(YOUTUBE_MOVIES)) return;

  YOUTUBE_MOVIES.forEach(movie => {
    const card = document.createElement("div");
    card.className = "youtube-card";

    card.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;

    card.addEventListener("click", () => {
      window.location.href =
        `details.html?id=${movie.id}&type=youtube`;
    });

    grid.appendChild(card);
  });
});
