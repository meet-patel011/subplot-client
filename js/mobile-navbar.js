document.addEventListener("DOMContentLoaded", async () => {
  if (window.innerWidth > 768) return;

  try {
    const res = await fetch("mobile-navbar.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);

    setupMobileBrowse();
    injectProfileIfLoggedIn();

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
    console.error("Mobile browse elements missing AFTER injection");
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

async function injectProfileIfLoggedIn() {

  const page = location.pathname.split("/").pop();
  if (page !== "index.html" && page !== "details.html") return;

  let user = window.AUTH_USER || null;

  if (!user && typeof checkAuth === "function") {
    user = await checkAuth();
  }

  if (!user) return;

  const nav = document.querySelector(".mobile-bottom-nav");
  if (!nav) return;

  if (nav.querySelector(".mobile-profile")) return;

  const firstLetter = user.username.charAt(0).toUpperCase();
  const colors = ['6366f1','ec4899','10b981','f59e0b','8b5cf6','ef4444','06b6d4','f97316'];
  const colorIndex = user.username.charCodeAt(0) % colors.length;

  const avatarSrc =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${firstLetter}&background=${colors[colorIndex]}&color=fff&size=128&length=1`;

  const profile = document.createElement("button");
  profile.type = "button";
  profile.className = "nav-item mobile-profile";

  profile.innerHTML = `
    <img src="${avatarSrc}" class="mobile-avatar" />
    <span>You</span>
  `;


  profile.addEventListener("click", () => {
    if (typeof showAvatarUploadPopup === "function") {
      showAvatarUploadPopup();
    }
  });

  nav.appendChild(profile);
}


