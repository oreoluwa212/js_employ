let currentPage = 1;
const newsList = document.getElementById("news-list");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

async function loadNews(page) {
  const response = await fetch(
    `https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news?page=${page}&limit=10`
  );
  const newsItems = await response.json();
  displayNews(newsItems);
}

async function displayNews(newsItems) {
  newsList.innerHTML = "";

  for (const news of newsItems) {
    const imageResponse = await fetch(
      `https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news/${news.id}/images`
    );
    const images = await imageResponse.json();
    const imageUrl = images.length > 0 ? images[0].image : "";

    const newsElement = document.createElement("div");
    newsElement.classList.add("card");
    newsElement.innerHTML = `
      <h2 class="card-label"><p href="news.html?id=${news.id}">${
      news.title
    }</p></h2>
      <p class="card-head">By ${news.author}</p>
      <p>${
        news.description ||
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      }</p>
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="${news.title} image" class="news-image" />`
          : ""
      }
      <div class="mb-4"></div>
      <div class="flex flex-col">
        <a href="news.html?id=${news.id}" class="read-more">Read More</a>
        <button class="edit-btn" aria-label="Edit" data-id="${
          news.id
        }" data-title="${news.title}" data-author="${
      news.author
    }" data-description="${news.description}">
          <i class="fa fa-edit"></i>
        </button>
        <button class="delete-btn" aria-label="Delete" data-id="${news.id}">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    `;
    newsList.appendChild(newsElement);
  }

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", handleEdit);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
}

async function handleDelete(event) {
  const newsId = event.target.closest("button").getAttribute("data-id");

  if (confirm("Are you sure you want to delete this news item?")) {
    try {
      const response = await fetch(
        `https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news/${newsId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      alert("News item deleted successfully.");
      loadNews(currentPage);
    } catch (error) {
      console.error("Failed to delete news:", error.message);
      alert("Failed to delete the news item. Please try again.");
    }
  }
}

prevBtn.addEventListener("click", () => {
  currentPage--;
  loadNews(currentPage);
  nextBtn.disabled = false;
  if (currentPage === 1) prevBtn.disabled = true;
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  loadNews(currentPage);
  prevBtn.disabled = false;
});

loadNews(currentPage);

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const currentTimeUTC = document.getElementById("currentTimeUTC");
  const currentDay = document.getElementById("currentDay");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(savedTheme);
  }

  function updateTime() {
    const now = new Date();
    const utcString = now.toUTCString().split(" ");
    currentTimeUTC.textContent = utcString[4];
    currentDay.textContent = `${utcString[0]} ${utcString[2]} ${utcString[1]} ${utcString[3]}`;
  }

  updateTime();
  setInterval(updateTime, 1000);

  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("light-mode")) {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light-mode");
    }
  });

  const sections = document.querySelectorAll("section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        } else {
          entry.target.classList.remove("in-view");
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
});

document
  .getElementById("news-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("news-title").value;
    const author = document.getElementById("news-author").value;
    const description = document.getElementById("news-description").value;

    const newPost = {
      title,
      author,
      description,
    };

    try {
      const response = await fetch(
        "https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPost),
        }
      );

      if (response.ok) {
        const createdPost = await response.json();

        const newCard = document.createElement("div");
        newCard.className = "card";
        newCard.innerHTML = `
        <h2 class="card-label">${createdPost.title}</h2>
        <p>By ${createdPost.author}</p>
        <p>${createdPost.description}</p>
        <a href="news.html?id=${createdPost.id}" class="read-more">Read More</a>
      `;

        const newsList = document.getElementById("news-list");
        newsList.prepend(newCard);

        document.getElementById("news-form").reset();
        document.getElementById("modal").classList.add("hidden");

        alert("Blog post created successfully!");
      } else {
        console.error("Error creating new blog post");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  });

function handleEdit(event) {
  const newsId = event.target.closest("button").getAttribute("data-id");
  const newsTitle = event.target.getAttribute("data-title");
  const newsAuthor = event.target.getAttribute("data-author");
  const newsDescription = event.target.getAttribute("data-description");

  document.getElementById("edit-news-id").value = newsId;
  document.getElementById("edit-news-title").value = newsTitle;
  document.getElementById("edit-news-author").value = newsAuthor;
  document.getElementById("edit-news-description").value = newsDescription;

  document.getElementById("edit-modal").classList.remove("hidden");
}

document
  .getElementById("edit-news-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("edit-news-id").value;
    const title = document.getElementById("edit-news-title").value;
    const author = document.getElementById("edit-news-author").value;
    const description = document.getElementById("edit-news-description").value;

    const updatedPost = {
      title,
      author,
      description,
    };

    try {
      const response = await fetch(
        `https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPost),
        }
      );

      if (response.ok) {
        alert("News item updated successfully.");
        loadNews(currentPage);
        document.getElementById("edit-modal").classList.add("hidden");
      } else {
        console.error("Error updating news item");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  });

document.getElementById("close-edit-modal").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});
