// BACKEND BASE 
const BACKEND = API_BASE.replace("/api", "");

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("editorsGrid");
  if (!grid) return;

  loadEditorsPicks(grid);
});


// LOAD EDITOR PICKS (BACKEND CACHED)
async function loadEditorsPicks(grid) {
  try {
    const res = await fetch(`${BACKEND}/api/editors-picks`);
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) return;

    data.results.forEach(item => {
      if (!item.poster_path) return;

      const card = document.createElement("div");
      card.className = "editor-card";

      card.innerHTML = `
        <img src="${IMG_POSTER}${item.poster_path}" alt="${item.title || item.name}">
        <p>${item.title || item.name}</p>
      `;

      card.addEventListener("click", () => {
        window.location.href =
          `details.html?id=${item.id}&type=${item.media_type}`;
      });

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("Editors picks failed:", err);
  }
}
