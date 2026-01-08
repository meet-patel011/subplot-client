document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".genre-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const genre = card.dataset.genre;
      if (!genre) return;

      window.location.href = `genre-results.html?genre=${genre}`;
    });
  });
});
