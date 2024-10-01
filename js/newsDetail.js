let currentPage = 1;
const newsList = document.getElementById("news-list");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const newsDetail = document.getElementById("news-detail");
const commentForm = document.getElementById("comment-form");
const commentsContainer = document.getElementById("comments-container");
const updateNewsForm = document.getElementById("update-news-form");

async function loadNewsDetail(id) {
  try {
    const response = await fetch(
      `https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news/${id}`
    );
    if (!response.ok) throw new Error("Failed to load news detail");
    const newsItem = await response.json();
    displayNewsDetail(newsItem);
  } catch (error) {
    console.error("Error loading news detail:", error);
  }
}

function displayNewsDetail(news) {
  const newsTitle = document.getElementById("news-title");
  const newsDescription = document.getElementById("news-description");
  const authorAvatar = document.getElementById("author-avatar");
  const authorName = document.getElementById("author-name");

  newsTitle.textContent = news.title;
  newsDescription.textContent = news.description;
  authorAvatar.src = news.authorAvatar;
  authorName.textContent = news.author;

  initImageSlider(news.images);
}

function initImageSlider(images) {
  const swiperContainer = document.getElementById("image-slider");
  swiperContainer.innerHTML = "";

  images.forEach((image) => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    slide.innerHTML = `<img src="${image}" alt="News Image" />`;
    swiperContainer.appendChild(slide);
  });

  new Swiper(swiperContainer, {
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

async function loadComments(newsId) {
  const comments = JSON.parse(localStorage.getItem(`comments_${newsId}`)) || [];
  displayComments(comments);
}

function displayComments(comments) {
  commentsContainer.innerHTML = "";
  comments.forEach((comment, index) => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add(
      "comment",
      "flex",
      "items-center",
      "p-2",
      "border",
      "border-gray-300",
      "rounded",
      "mb-2"
    );

    const commentText = document.createElement("span");
    commentText.textContent = comment.text;
    commentText.classList.add("flex-1", "mr-2");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add(
      "delete-button",
      "bg-red-500",
      "text-white",
      "font-semibold",
      "py-1",
      "px-3",
      "rounded",
      "hover:bg-red-700",
      "transition",
      "duration-200",
      "ease-in-out",
      "ml-auto"
    );
    deleteButton.onclick = () => deleteComment(index);

    commentDiv.appendChild(commentText);
    commentDiv.appendChild(deleteButton);

    commentsContainer.appendChild(commentDiv);
  });
}

function deleteComment(commentIndex) {
  const newsId = window.location.search.split("=")[1];
  const comments = JSON.parse(localStorage.getItem(`comments_${newsId}`)) || [];
  comments.splice(commentIndex, 1);
  localStorage.setItem(`comments_${newsId}`, JSON.stringify(comments));
  loadComments(newsId);
}

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const commentText = document.getElementById("comment-text").value;
  const newsId = window.location.search.split("=")[1];

  try {
    const newComment = { text: commentText };
    const comments =
      JSON.parse(localStorage.getItem(`comments_${newsId}`)) || [];
    comments.push(newComment);
    localStorage.setItem(`comments_${newsId}`, JSON.stringify(comments));

    loadComments(newsId);
    commentForm.reset();
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("Error adding comment. Please try again.");
  }
});

updateNewsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newsId = window.location.search.split("=")[1];
  const updatedTitle = document.getElementById("update-title").value;
  const updatedDescription =
    document.getElementById("update-description").value;

  try {
    await fetch(
      `https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news/${newsId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updatedTitle,
          description: updatedDescription,
        }),
      }
    );

    loadNewsDetail(newsId);
    updateNewsForm.reset();
  } catch (error) {
    console.error("Error updating news:", error);
  }
});

async function init() {
  const newsId = window.location.search.split("=")[1];
  await loadNewsDetail(newsId);
  loadComments(newsId);
}

init();
