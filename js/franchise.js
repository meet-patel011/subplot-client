document.addEventListener("DOMContentLoaded", () => {
  const banners = document.querySelectorAll(".franchise-banner");

  banners.forEach(banner => {
    banner.addEventListener("click", () => {
      const key = banner.dataset.franchise;
      if (!key) return;

      window.location.href = `franchise-results.html?franchise=${key}`;
    });
  });
});
