document.addEventListener("DOMContentLoaded", async () => {
  if (window.innerWidth > 768) return;

  try {
    const res = await fetch("mobile-navbar.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);

    setupMobileBrowse();
    injectProfileIfLoggedIn();
    highlightActiveTab();

  } catch (err) {
    console.error("Mobile navbar failed:", err);
  }
});

function setupMobileBrowse() {
  const browseBtn = document.getElementById("mobileBrowseBtn");
  const overlay = document.getElementById("mobileBrowseOverlay");

  console.log("Browse Btn:", browseBtn);
  console.log("Overlay:", overlay);

  if (!browseBtn || !overlay) {
    console.error("❌ Mobile browse elements missing AFTER injection");
    return;
  }

  browseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    overlay.classList.add("show");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("show");
    }
  });
}

function injectProfileIfLoggedIn() {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  const nav = document.querySelector(".mobile-bottom-nav");
  if (!nav) return;

  const profile = document.createElement("a");
  profile.href = "profile.html";
  profile.className = "nav-item";
  profile.innerHTML = `
    <img src="assets/profile.png" />
    <span>You</span>
  `;

  nav.appendChild(profile);
}

function highlightActiveTab() {
  const page = location.pathname.split("/").pop();

  document.querySelectorAll(".mobile-bottom-nav a").forEach(a => {
    if (a.getAttribute("href") === page) {
      a.classList.add("active");
    }
  });
}
