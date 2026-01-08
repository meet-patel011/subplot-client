document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();

  const feed = document.getElementById("feed");
  const postBtn = document.getElementById("postBtn");

  /* LOAD FEED */
  async function loadFeed() {
    const res = await fetch("https://subplot-server.onrender.com/api/posts");
    const data = await res.json();
    feed.innerHTML = "";

    data.posts.forEach(p => {
      const div = document.createElement("div");
      div.className = "post";

      div.innerHTML = `
        <div class="post-header">
          <img src="${p.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.username)}`}">
          <strong>${p.user.username}</strong>
        </div>

        <div class="post-date">
          Posted on ${new Date(p.createdAt).toLocaleDateString()}
        </div>

        <p>${p.content}</p>

        ${p.media ? `<img class="post-media" src="${p.media}" />` : ""}

        <div class="comment-box">
          <input class="comment-input" placeholder="Write a comment..." />
          <button class="comment-btn">Post</button>
          <div class="comments"></div>
        </div>
      `;

      feed.appendChild(div);

      const commentsContainer = div.querySelector(".comments");
      const commentInput = div.querySelector(".comment-input");
      const commentBtn = div.querySelector(".comment-btn");

      // Load comments 
      loadComments(p._id, commentsContainer);

      // Post comment
      commentBtn.addEventListener("click", async () => {
        if (!window.AUTH_USER) {
          alert("Login to comment");
          return;
        }

        const text = commentInput.value.trim();
        if (!text) return;

        await fetch(`https://subplot-server.onrender.com/api/comments/${p._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ content: text }),
        });

        commentInput.value = "";
        loadComments(p._id, commentsContainer);
      });
    });
  }

  /* LOAD COMMENTS */
  async function loadComments(postId, container) {
    const res = await fetch(`https://subplot-server.onrender.com/api/comments/${postId}`);
    const data = await res.json();

    container.innerHTML = "";

    data.comments.forEach(c => {
      const el = document.createElement("div");
      el.className = "comment";
      el.innerHTML = `
        <img src="${c.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.username)}`}">
        <div>
          <strong>${c.user.username}</strong><br/>
          ${c.content}
        </div>
      `;
      container.appendChild(el);
    });
  }

  /* CREATE POST */
  postBtn.addEventListener("click", async () => {
    if (!window.AUTH_USER) {
      alert("Login to post");
      return;
    }

    const content = postContent.value.trim();
    if (!content) return;

    let media = postMedia.value.trim();
    const file = mediaFile.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async e => {
        media = e.target.result;
        await submitPost(content, media);
      };
      reader.readAsDataURL(file);
    } else {
      await submitPost(content, media);
    }
  });

  async function submitPost(content, media) {
    await fetch("https://subplot-server.onrender.com/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ content, media }),
    });

    postContent.value = "";
    postMedia.value = "";
    mediaFile.value = "";

    loadFeed();
  }

  loadFeed();
});
