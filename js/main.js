async function fetchTrending() {
  const response = await fetch("/api/trending")
  return response.json()
}

let lastScrollPosition = 0

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("mainLoader").style.opacity = "0"
    setTimeout(() => {
      document.getElementById("mainLoader").style.display = "none"
    }, 500)
  }, 2000)

  loadFeaturedContent()
  loadTrendingContent()
  initializeSearch()
  initializeSectionSwitching()
  initializeHeaderAnimation()
  setCurrentYear()
})

function initializeHeaderAnimation() {
  window.addEventListener("scroll", () => {
    const currentScrollPosition = window.pageYOffset
    const header = document.getElementById("mainNav")

    if (currentScrollPosition > lastScrollPosition) {
      // Scrolling down
      header.style.transform = "translateY(-100%)"
    } else {
      // Scrolling up
      header.style.transform = "translateY(0)"
    }

    lastScrollPosition = currentScrollPosition
  })
}

async function loadFeaturedContent() {
  const data = await fetchTrending()
  if (data?.results?.[0]) {
    const featured = data.results[0]
    const backdrop = `https://image.tmdb.org/t/p/original${featured.backdrop_path}`

    document.getElementById("featuredBanner").innerHTML = `
            <div class="relative w-full h-full">
                <img src="${backdrop}" alt="${featured.title || featured.name}" 
                     class="w-full h-full object-cover">
                <div class="absolute inset-0 banner-gradient"></div>
                <div class="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                    <h1 class="text-4xl md:text-6xl font-bold mb-4">
                        ${featured.title || featured.name}
                    </h1>
                    <p class="text-lg md:text-xl mb-6 max-w-2xl text-gray-200">
                        ${featured.overview}
                    </p>
                    <div class="flex items-center space-x-4">
                        <button onclick="playContent('${featured.id}', '${featured.media_type}', '${featured.title || featured.name}')"
                                class="play-btn px-8 py-3 rounded-full font-bold flex items-center">
                            <i class="fas fa-play mr-2"></i>
                            এখন দেখুন
                        </button>
                        <button class="bg-gray-800 bg-opacity-50 hover:bg-opacity-75 text-white px-8 py-3 rounded-full
                                     font-bold transition-all duration-300 flex items-center">
                            <i class="fas fa-info-circle mr-2"></i>
                            আরও তথ্য
                        </button>
                    </div>
                </div>
            </div>
        `
    logMessage("Featured content loaded", "info")
  }
}

function initializeSectionSwitching() {
  const sections = {
    trending: "/trending/all/week",
    movies: "/movie/popular",
    shows: "/tv/popular",
  }

  Object.entries(sections).forEach(([section, endpoint]) => {
    document.querySelector(`[onclick="switchSection('${section}')"]`).addEventListener("click", async () => {
      const data = await fetchTMDB(endpoint)
      updateContentGrid(data?.results)
      logMessage(`Switched to ${section} section`, "info")
    })
  })
}

function initializeSearch() {
  const searchInput = document.getElementById("searchInput")
  let timeout

  searchInput.addEventListener("input", (e) => {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      const query = e.target.value.trim()
      if (query.length > 2) {
        const data = await searchContent(query)
        updateContentGrid(data?.results)
        logMessage(`Searched for: ${query}`, "info")
      }
    }, 500)
  })
}

function updateContentGrid(items) {
  if (!items || items.length === 0) {
    logMessage("No content to display", "warning")
    return
  }

  const container = document.getElementById("trendingContent")
  container.innerHTML = items
    .filter((item) => item.poster_path)
    .map(
      (item) => `
            <div class="cursor-pointer poster-hover" 
                 onclick="playContent('${item.id}', '${item.media_type}', '${item.title || item.name}')">
                <div class="relative">
                    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}"
                         alt="${item.title || item.name}"
                         class="w-full rounded-lg shadow-lg">
                    <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 
                                transition-opacity rounded-lg flex items-center justify-center 
                                opacity-0 hover:opacity-100">
                        <i class="fas fa-play text-2xl"></i>
                    </div>
                </div>
                <h3 class="font-semibold mt-2">${item.title || item.name}</h3>
                <div class="flex items-center text-sm text-gray-400 mt-1">
                    <span>${new Date(item.release_date || item.first_air_date).getFullYear() || "N/A"}</span>
                    <span class="mx-2">•</span>
                    <span class="capitalize">${item.media_type}</span>
                </div>
            </div>
        `,
    )
    .join("")
  logMessage("Content grid updated", "info")
}

async function loadTrendingContent() {
  const data = await fetchTrending()
  updateContentGrid(data?.results)
  logMessage("Trending content loaded", "info")
}

function setCurrentYear() {
  const currentYearElement = document.getElementById("currentYear")
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear()
  }
}

// Handle escape key for player modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePlayer()
  }
})

