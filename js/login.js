document.querySelector(".auth-form").addEventListener("submit", async e => {
  e.preventDefault();

  const [email, password] = e.target.querySelectorAll("input");

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  if (res.ok) {
  const data = await res.json();

  // Support any backend token key
  const token =
    data.accessToken ||
    data.token ||
    data.jwt;

  if (!token) {
    alert("Login failed: token not received");
    return;
  }

  localStorage.setItem("accessToken", token);
  window.location.href = "index.html";

  } else {
    alert("Invalid credentials");
  }
});