// NAVBAR AUTH HANDLER
document.addEventListener("DOMContentLoaded", async () => {
  const nav = document.querySelector(".nav-right");
  if (!nav) return;

  const loginLink = nav.querySelector('a[href="login.html"]');

  // checkAuth is global from auth.js
  const user = await checkAuth();

  // If not logged in OR login link missing then do nothing
  if (!user || !loginLink) return;

  // Remove login link
  loginLink.remove();

  // Create avatar
  const avatar = document.createElement("img");
  
  // Letter + Random color per user
  const firstLetter = user.username.charAt(0).toUpperCase();
  const colors = ['6366f1', 'ec4899', '10b981', 'f59e0b', '8b5cf6', 'ef4444', '06b6d4', 'f97316'];
  const colorIndex = user.username.charCodeAt(0) % colors.length;
  
  avatar.src = user.avatar || `https://ui-avatars.com/api/?name=${firstLetter}&background=${colors[colorIndex]}&color=fff&size=128&length=1`;
  avatar.className = "nav-avatar";
  avatar.title = user.username;
  
  avatar.style.width = "36px";
  avatar.style.height = "36px";
  avatar.style.borderRadius = "50%";
  avatar.style.cursor = "pointer";

  // Click avatar - Shows upload popup
  avatar.addEventListener("click", showAvatarUploadPopup);

  nav.appendChild(avatar);
});


// AVATAR UPLOAD POPUP
function showAvatarUploadPopup() {
  // Create popup overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  // Create popup
  const popup = document.createElement("div");
  popup.style.cssText = `
    background: #1a1a2e;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    max-width: 400px;
  `;

  popup.innerHTML = `
    <h3 style="color: #fff; margin: 0 0 20px 0;">Update Avatar</h3>
    <input type="file" id="avatarInput" accept="image/jpeg,image/png,image/jpg" style="display: none;">
    <button id="chooseBtn" style="
      width: 100%;
      padding: 12px;
      background: #b51818ff;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      margin-bottom: 10px;
    ">Choose Photo</button>
    <button id="cancelBtn" style="
      width: 100%;
      padding: 12px;
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    ">Cancel</button>
    <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin-top: 15px;">Max size: 4MB</p>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });

  // Cancel button
  popup.querySelector("#cancelBtn").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // Choose button
  popup.querySelector("#chooseBtn").addEventListener("click", () => {
    popup.querySelector("#avatarInput").click();
  });

  // Handle file selection
  popup.querySelector("#avatarInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size
    if (file.size > 4 * 1024 * 1024) {
      alert("Image too large! Please choose an image under 4MB.");
      return;
    }

    // Show loading
    popup.querySelector("#chooseBtn").textContent = "Uploading...";
    popup.querySelector("#chooseBtn").disabled = true;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      const token = localStorage.getItem("accessToken");

      try {
        const res = await fetch("https://subplot-server.onrender.com/api/user/avatar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ avatar: base64 })
        });

        if (res.ok) {
          document.body.removeChild(overlay);
          location.reload(); // Refresh to show new avatar
        } else {
          alert("Upload failed. Try again.");
          popup.querySelector("#chooseBtn").textContent = "Choose Photo";
          popup.querySelector("#chooseBtn").disabled = false;
        }
      } catch (error) {
        alert("Error uploading. Try again.");
        popup.querySelector("#chooseBtn").textContent = "Choose Photo";
        popup.querySelector("#chooseBtn").disabled = false;
      }
    };

    reader.readAsDataURL(file);
  });
}