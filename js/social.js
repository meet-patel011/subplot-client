document.querySelectorAll(".club-card").forEach(card => {
  card.addEventListener("click", () => {
    const club = card.dataset.club;
    window.location.href = `club.html?club=${club}`;
  });
});
