const BACKEND_URL =
  typeof API_BASE !== "undefined"
    ? API_BASE.replace("/api", "")
    : location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://subplot-server.onrender.com";

const params = new URLSearchParams(window.location.search);
const club = params.get("club");

const clubData = {
  sports: {
    name: "Sports",
    desc: "A community for all diehard Sports fans.",
    image: "assets/images/sports.png"
  },
  "world-cinema": {
    name: "World Cinema",
    desc: "A community for Cinephiles to talk.",
    image: "assets/images/cinema.png"
  },
  marvel: {
    name: "Marvel",
    desc: "A community for all Marvellous fans.",
    image: "assets/images/marvel.png"
  },
  dc: {
    name: "DC",
    desc: "A community for all Dark and Bold fans.",
    image: "assets/images/dc.png"
  },
  anime: {
    name: "Anime",
    desc: "A community for all Anime fans.",
    image: "assets/images/anime.png"
  },
  gaming: {
    name: "Video Games",
    desc: "A community for all Pro gamers",
    image: "assets/images/gaming.png"
  }
};

const data = clubData[club];

if (!data) {
  window.location.href = "social.html";
}

document.getElementById("clubName").textContent = data.name;
document.getElementById("clubDesc").textContent = data.desc;
document.getElementById("club-banner").style.backgroundImage =
  `url('${data.image}')`;

async function loadPosts() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/clubs/${club}`);
    const json = await res.json();

    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    if (!json.posts || json.posts.length === 0) {
      feed.innerHTML = `<p style="color:#9ca3af">No posts yet. Be the first to share.</p>`;
      return;
    }

    json.posts.forEach(p => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <div class="post-header">
          <img src="${p.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.username)}`}">
          <strong>${p.user.username}</strong>
        </div>
        <p>${p.content}</p>
      `;
      feed.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load posts", err);
  }
}

document.getElementById("postBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `login.html?redirect=${redirectUrl}`;
    return;
  }

  const content = postContent.value.trim();
  if (!content) return;

  await fetch(`${BACKEND_URL}/api/clubs/${club}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  });

  postContent.value = "";
  loadPosts();
});

loadPosts();
