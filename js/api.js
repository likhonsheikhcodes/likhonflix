const TMDB_API_KEY = "cd5b82de62e202dd4c99e6846d3a7670"
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3"

function logMessage(message, type = "log") {
  console[type](message)
  const logContainer = document.getElementById("logContainer")
  const logItem = document.createElement("div")
  logItem.className = `log-item log-${type}`
  logItem.textContent = message
  logContainer.appendChild(logItem)

  if (logContainer.children.length > 5) {
    logContainer.removeChild(logContainer.firstChild)
  }

  setTimeout(() => {
    logItem.style.opacity = "0"
    setTimeout(() => logContainer.removeChild(logItem), 500)
  }, 5000)
}

async function fetchTMDB(endpoint) {
  try {
    const response = await fetch(`${TMDB_API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
    })
    if (!response.ok) throw new Error("Network response was not ok")
    return await response.json()
  } catch (error) {
    console.error("TMDB API Error:", error)
    logMessage("Error fetching data from TMDB", "error")
    return null
  }
}

async function fetchTrending() {
  return await fetchTMDB("/trending/all/week?language=bn-BD")
}

async function fetchContentDetails(id, mediaType) {
  return await fetchTMDB(`/${mediaType}/${id}?language=bn-BD`)
}

async function searchContent(query) {
  return await fetchTMDB(`/search/multi?language=bn-BD&query=${encodeURIComponent(query)}`)
}

