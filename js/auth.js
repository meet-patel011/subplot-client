window.AUTH_USER = null;

async function checkAuth() {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      // window.AUTH_USER = null;
      window.AUTH_USER = (() => {
        try {
          return JSON.parse(localStorage.getItem("user"));
        } catch {
          return null;
        }
      })();


      localStorage.removeItem("user");
      return null;
    }

    const res = await fetch("https://subplot-server.onrender.com/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      window.AUTH_USER = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return null;
    }

    const data = await res.json();

    window.AUTH_USER = data.user;
    localStorage.setItem("user", JSON.stringify(data.user));

    return data.user;

  } catch (err) {
    window.AUTH_USER = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return null;
  }
}

// AUTH HELPERS
function isLoggedIn() {
  return !!window.AUTH_USER;
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("accessToken");
  window.AUTH_USER = null;
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  const loginLinks = document.querySelectorAll(
    'a[href*="login"], .login-btn'
  );

  loginLinks.forEach(el => {
    el.style.display = "none";
  });
});

