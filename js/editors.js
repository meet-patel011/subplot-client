// BACKEND BASE 
const BACKEND = API_BASE.replace("/api", "");

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("editorsGrid");
  if (!grid) return;

  loadEditorsPicks(grid);
});


// LOAD EDITOR PICKS (BACKEND CACHED)
async function loadEditorsPicks(grid) {
  // new code
  const loader = document.getElementById("page-loader");

  if (grid.children.length === 0) {
    loader?.classList.remove("hidden");
  }

  setTimeout(() => {
    if (grid.children.length === 0) {
      loader.textContent = "Waking up server… please wait";
    }
  }, 4000);
  // end new code

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

    // new code
    if (grid.children.length > 0) {
      loader?.classList.add("hidden");
    }
    // end new code

  } catch (err) {
    console.error("Editors picks failed:", err);
  }
}
