window.AUTH_USER = null;

// CHECK AUTH (CALL ON PAGE LOAD)
async function checkAuth() {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      window.AUTH_USER = null;
      return null;
    }

    const res = await fetch("http://localhost:5000/api/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      window.AUTH_USER = null;
      localStorage.removeItem("accessToken");
      return null;
    }

    const data = await res.json();
    window.AUTH_USER = data.user;
    return data.user;

  } catch (err) {
    window.AUTH_USER = null;
    localStorage.removeItem("accessToken");
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