// NAVBAR AUTH HANDLER
document.addEventListener("DOMContentLoaded", async () => {
  const nav = document.querySelector(".nav-right");
  if (!nav) return;

  const loginLink = nav.querySelector('a[href="login.html"]');

  const user = await checkAuth();

  if (!user || !loginLink) return;

  loginLink.remove();

  const avatar = document.createElement("img");
  
  avatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff&size=128`;
  avatar.className = "nav-avatar";
  avatar.title = user.username;

  avatar.addEventListener("click", () => {
    window.location.href = "profile.html";
  });

  nav.appendChild(avatar);
});