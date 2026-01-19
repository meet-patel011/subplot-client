document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const grid = document.getElementById("watchlistGrid");
  const emptyState = document.getElementById("emptyState");

  async function fetchPosterFallback(tmdbId, mediaType) {
    try {
      const res = await fetch(
        `https://subplot-server.onrender.com/api/watchlist/${mediaType}/${tmdbId}/poster`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.posterUrl || null;
    } catch {
      return null;
    }
  }

  async function loadImage(url) {
    if (!url) return null;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  try {
    const res = await fetch("https://subplot-server.onrender.com/api/watchlist", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Unauthorized");

    const data = await res.json();
    const items = data.items || [];

    grid.innerHTML = "";

    if (items.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    for (const item of items) {
      const card = document.createElement("div");
      card.className = "watchlist-card";

      const posterContainer = document.createElement("div");
      posterContainer.className = "watchlist-poster";

      const titleEl = document.createElement("p");
      titleEl.className = "watchlist-title";
      titleEl.textContent = item.title || "Untitled";

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-btn";
      removeBtn.textContent = "✕";

      card.appendChild(posterContainer);
      card.appendChild(titleEl);
      card.appendChild(removeBtn);

      let posterUrl = item.poster && !item.poster.includes("null") ? item.poster : null;
      let loadedImg = await loadImage(posterUrl);

      if (!loadedImg && item.tmdbId && item.mediaType) {
        const fallbackUrl = await fetchPosterFallback(item.tmdbId, item.mediaType);
        if (fallbackUrl) {
          loadedImg = await loadImage(fallbackUrl);
        }
      }

      if (loadedImg) {
        loadedImg.alt = item.title || "Poster";
        posterContainer.appendChild(loadedImg);
      } else {
        const placeholder = document.createElement("div");
        placeholder.style.cssText = `
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        `;
        
        const logo = document.createElement("img");
        logo.src = "assets/logo.png";
        logo.alt = "The Subplot";
        logo.style.cssText = `
          width: 60px;
          height: auto;
          opacity: 0.3;
        `;
        
        const text = document.createElement("span");
        text.textContent = "No Poster";
        text.style.cssText = `
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        `;
        
        placeholder.appendChild(logo);
        placeholder.appendChild(text);
        posterContainer.appendChild(placeholder);
      }

      card.addEventListener("click", (e) => {
        if (e.target.closest(".remove-btn")) return;
        window.location.href = `details.html?id=${item.tmdbId}&type=${item.mediaType}`;
      });

      removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          const delRes = await fetch(
            `https://subplot-server.onrender.com/api/watchlist/${item.mediaType}/${item.tmdbId}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
          );
          if (!delRes.ok) throw new Error("Failed to remove");
          card.remove();
          if (grid.children.length === 0) {
            emptyState.style.display = "block";
          }
        } catch (err) {
          console.error(err);
          alert("Could not remove item from watchlist");
        }
      });

      grid.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    window.location.href = "login.html";
  }
});