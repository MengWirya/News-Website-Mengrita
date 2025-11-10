const API_KEY = "cfba98e377664fd3901e0897946a56dc";
const BASE_URL = "https://newsapi.org/v2";

const newsDetails = document.getElementById("newsdetails");
const newsType = document.getElementById("newsType");
const searchBar = document.getElementById("searchBar");

const categories = {
  general: document.getElementById("general"),
  business: document.getElementById("business"),
  sports: document.getElementById("sport"),
  entertainment: document.getElementById("entertainment"),
  technology: document.getElementById("technology"),
};

let currentPage = 1;
const pageSize = 15;
let totalResults = 0;
let currentMode = "top";
let currentCategory = "general";
let currentQuery = "";

function showMessage(message) {
  newsDetails.innerHTML = `
		<div class="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
			<p class="text-gray-700">${message}</p>
		</div>`;
}

function showLoading() {
  newsDetails.innerHTML = `
		<div class="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center py-8">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#069cbe]"></div>
		</div>`;
}

// DATE
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
}

// DISPLAY ARTICLES
function displayArticles(articles) {
  if (!articles || articles.length === 0) {
    showMessage("Tidak ada berita ditemukan. Coba kata kunci lain.");
    return;
  }

  newsDetails.innerHTML = "";
  articles.forEach((a) => {
    const image =
      a.urlToImage || "https://via.placeholder.com/640x360?text=No+Image";
    const title = a.title || "No title";
    const description = a.description || "";
    const source = a.source && a.source.name ? a.source.name : "Unknown";
    const published = a.publishedAt ? formatDate(a.publishedAt) : "";

    const card = document.createElement("article");
    card.className =
      "bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition fade-in";
    card.innerHTML = `
			<a href="${a.url}" target="_blank" rel="noopener noreferrer">
				<img src="${image}" alt="" class="w-full h-48 object-cover">
			</a>
			<div class="p-4 fade-in">
				<h3 class="text-lg font-newsreader font-semibold text-[#035a94] mb-2">${escapeHtml(
          title
        )}</h3>
				<p class="text-sm text-gray-700 mb-3">${escapeHtml(description)}</p>
				<div class="flex items-center justify-between text-xs text-gray-500">
					<span>${escapeHtml(source)}</span>
					<span>${escapeHtml(published)}</span>
				</div>
			</div>
		`;

    newsDetails.appendChild(card);
  });
}

// HTML ESCAPE
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// DEFAULT NEWS
async function fetchTopHeadlines(category = "general") {
  newsType.textContent = `Berita paling terkini`;
  showLoading();

  const url = `${BASE_URL}/top-headlines?country=us&pageSize=${pageSize}&page=${currentPage}&apiKey=${API_KEY}&category=${encodeURIComponent(
    category
  )}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "ok") throw new Error(data.message || "API error");
    displayArticles(data.articles);
    totalResults = data.totalResults || 0;
    renderPagination();
    currentMode = "top";
    currentCategory = category;
  } catch (err) {
    console.error("Fetch error:", err);
    showMessage("Gagal memuat berita.");
  }
}

// SEARCHBAR
async function searchNews(query) {
  if (!query || !query.trim()) {
    fetchTopHeadlines();
    return;
  }

  const trimmed = query.trim();
  newsType.textContent = `Hasil pencarian untuk "${trimmed}"`;
  showLoading();

  const url = `${BASE_URL}/everything?q=${encodeURIComponent(
    trimmed
  )}&pageSize=${pageSize}&page=${currentPage}&sortBy=publishedAt&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== "ok") throw new Error(data.message || "API error");
    displayArticles(data.articles);
    totalResults = data.totalResults || 0;
    renderPagination();
    currentMode = "search";
    currentQuery = trimmed;
  } catch (err) {
    console.error("Search error:", err);
    showMessage(
      "Gagal mencari berita dikarenakan koneksi jariangan yang tidak lancar / baik"
    );
  }
}

// CATEGORY BUTTONS
Object.entries(categories).forEach(([key, btn]) => {
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const category = key === "sport" ? "sports" : key;
    fetchTopHeadlines(category);
  });
});

searchBar.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchNews(searchBar.value);
  }
});

// PAGINATION
function renderPagination() {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  const totalPages = Math.ceil(totalResults / pageSize);
  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "← Sebelumnya";
  prevBtn.className =
    "px-4 py-2 bg-[#069cbe] rounded hover:bg-[#069cbe]/75 hover:underline";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      reloadNews();
    }
  });

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Selanjutnya →";
  nextBtn.className =
    "px-4 py-2 bg-[#069cbe] rounded hover:bg-[#069cbe]/75 hover:underline";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      reloadNews();
    }
  });

  const info = document.createElement("span");
  info.textContent = `Page ${currentPage} of ${totalPages}`;
  info.className = "text-sm text-gray-600 mx-2";

  container.appendChild(prevBtn);
  container.appendChild(info);
  container.appendChild(nextBtn);
}

function reloadNews() {
  if (currentMode === "top") {
    fetchTopHeadlines(currentCategory);
  } else if (currentMode === "search") {
    searchNews(currentQuery);
  }
}

fetchTopHeadlines("general");
