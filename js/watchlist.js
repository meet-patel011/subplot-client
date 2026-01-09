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

      // card.innerHTML = `
      //   <img src="${item.poster}" alt="${item.title}" />
      //   <button class="remove-btn">✕</button>
      // `;

      // new code
      card.innerHTML = `
        <div class="watchlist-poster">
          <span class="watchlist-fallback">Loading…</span>
          <img
            src="${item.poster}"
            alt="${item.title}"
            loading="lazy"
            onload="this.previousElementSibling.style.display='none'"
            onerror="this.style.display='none';this.previousElementSibling.style.display='flex'"
          />
        </div>
        <button class="remove-btn">✕</button>
      `;
      // end new code

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
