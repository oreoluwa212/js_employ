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

function displayNews(newsItems) {
  newsList.innerHTML = "";
  newsItems.forEach((news) => {
    const newsElement = document.createElement("div");
    newsElement.classList.add("card");
    newsElement.innerHTML = `
      <h2 class="card-label"><p href="news.html?id=${news.id}">${
      news.title
    }</p></h2>
      <p class="card-head">By ${news.author}</p>
      <p>${
        news.description ||
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque..."
      }</p>
      <a href="news.html?id=${news.id}" class="read-more">Read More</a>
    `;
    newsList.appendChild(newsElement);
  });
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
    currentDay.textContent = `${utcString[0]}, ${utcString[2]} ${utcString[1]} ${utcString[3]}`;
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
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("news-title").value;
    const author = document.getElementById("news-author").value;
    const url = document.getElementById("news-url").value;

    const newCard = document.createElement("div");
    newCard.className = "card";
    newCard.innerHTML = `
    <h2 class="card-label">${title}</h2>
    <p>
      This is a new blog post created by ${author}. You can add more details or content here...
    </p>
    <a href="${url}" class="read-more">Read More</a>
  `;

    const newsList = document.getElementById("news-list");
    newsList.prepend(newCard);

    document.getElementById("news-form").reset();

    document.getElementById("modal").classList.add("hidden");
  });
