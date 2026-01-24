const BACKEND = API_BASE.replace("/api", "");

document.addEventListener("DOMContentLoaded", loadNews);

async function loadNews() {
  const feed = document.getElementById("news-feed");
  feed.innerHTML = "";

  // new code
  const loader = document.getElementById("page-loader");

  if (feed.children.length === 0) {
    loader?.classList.remove("hidden");
  }

  setTimeout(() => {
    if (feed.children.length === 0) {
      loader.textContent = "Waking up server may take few minutes… please wait";
    }
  }, 4000);
  // end new code

  const queries = [
    "movie casting",
    "film sequel announced",
    "movie trailer",
    "actor joins film",
    "Marvel movie",
    "DC movie"
  ];

  const seen = new Set();
  const results = [];

  try {
    for (const q of queries) {
      const res = await fetch(`${BACKEND}/api/news/top`);
      const data = await res.json();

      if (!data.articles) continue;

      data.articles.forEach(a => {
        if (!seen.has(a.url)) {
          seen.add(a.url);
          results.push(a);
        }
      });
    }

    // LATEST NEWS FIRST
    results
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 18)
      .forEach(article => {
        const card = document.createElement("div");
        card.className = "news-card";

        card.innerHTML = `
          <img class="news-image"
               src="${article.image || 'assets/placeholder-news.jpg'}"
               onerror="this.onerror=null; this.src='assets/placeholder-news.png';" />

          <div class="news-content">
            <span class="news-tag">${article.source.name}</span>
            <h3 class="news-headline">${article.title}</h3>
            <p class="news-summary">${article.description || ""}</p>

            <div class="news-meta">
              <span>${new Date(article.publishedAt).toDateString()}</span>
              <a href="${article.url}" target="_blank" class="news-link">
                Read →
              </a>
            </div>
          </div>
        `;

        feed.appendChild(card);
      });

      if (feed.children.length > 0) {
        loader?.classList.add("hidden");
      }


  } catch (err) {
    feed.innerHTML = "<p style='color:#888'>Server is busy. Can't load news currently.</p>";
    console.error(err);
  }
}
