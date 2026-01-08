document.querySelector(".auth-form").addEventListener("submit", async e => {
  e.preventDefault();

  const inputs = e.target.querySelectorAll("input");

  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: inputs[0].value,
      email: inputs[1].value,
      password: inputs[2].value
    })
  });

  if (res.ok) {
    window.location.href = "login.html";
  } else {
    alert("User with same credentials already exist");
  }
});