document.addEventListener("DOMContentLoaded", async () => {
  // Protect page
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const grid = document.getElementById("watchlistGrid");
  const emptyState = document.getElementById("emptyState");

  try {
    const res = await fetch("https://subplot-server.onrender.com/api/watchlist", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Unauthorized");
    }

    const data = await res.json();
    const items = data.items || [];

    grid.innerHTML = "";

    if (items.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "watchlist-card";

      const posterUrl = item.poster || '';
      const hasValidPoster = posterUrl && !posterUrl.includes('null');
      
      card.innerHTML = `
        <div class="watchlist-poster">
          ${hasValidPoster ? `
            <img
              src="${posterUrl}"
              alt="${item.title}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
            />
            <span class="watchlist-fallback" style="display:none;">No Image</span>
          ` : `
            <span class="watchlist-fallback">No Image</span>
          `}
        </div>
        <button class="remove-btn">✕</button>
      `;

      // Go to details page
      card.addEventListener("click", () => {
        window.location.href = `details.html?id=${item.tmdbId}&type=${item.mediaType}`;
      });

      // REMOVE FROM WATCHLIST
      card.querySelector(".remove-btn").addEventListener("click", async (e) => {
        e.stopPropagation();

        try {
          const delRes = await fetch(
            `https://subplot-server.onrender.com/api/watchlist/${item.mediaType}/${item.tmdbId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!delRes.ok) {
            throw new Error("Failed to remove");
          }

          // Remove card from UI
          card.remove();

          // Show empty state if no items left
          if (grid.children.length === 0) {
            emptyState.style.display = "block";
          }

        } catch (err) {
          console.error(err);
          alert("Could not remove item from watchlist");
        }
      });

      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    window.location.href = "login.html";
  }
});