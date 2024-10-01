const newsForm = document.getElementById("news-form");
const newsTitle = document.getElementById("news-title");
const newsAuthor = document.getElementById("news-author");
const newsUrl = document.getElementById("news-url");

const newsId = new URLSearchParams(window.location.search).get("id");

// Function to submit news details
async function submitNews(e) {
  e.preventDefault();

  const newsData = {
    title: newsTitle.value,
    author: newsAuthor.value,
    url: newsUrl.value,
  };

  try {
    let response;
    if (newsId) {
      // Update news item
      response = await fetch(
        `https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news/${newsId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsData),
        }
      );
      if (!response.ok) throw new Error("Failed to update news item.");
      alert("News item updated successfully.");
    } else {
      // Add new news item
      response = await fetch(
        "https://61924d4daeab5c0017105f1a.mockapi.io/skaet/v1/news",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsData),
        }
      );
      if (!response.ok) throw new Error("Failed to add news item.");
      alert("News item added successfully.");
    }

    newsTitle.value = "";
    newsAuthor.value = "";
    newsUrl.value = "";

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

newsForm.addEventListener("submit", submitNews);
