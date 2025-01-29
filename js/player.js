const TMDB_API_KEY = "cd5b82de62e202dd4c99e6846d3a7670" // Replace with your actual API key

const VIDEO_SOURCES = [
  {
    name: "VidSrc",
    domain: "vidsrc.xyz",
    type: "direct",
    getUrl: (id, type) => `https://vidsrc.xyz/embed/${type}?tmdb=${id}`,
  },
  {
    name: "VidSrc Me",
    domain: "vidsrc.me",
    type: "direct",
    getUrl: (id, type) => `https://vidsrc.me/embed/${type}?tmdb=${id}`,
  },
  {
    name: "VidSrc In",
    domain: "vidsrc.in",
    type: "direct",
    getUrl: (id, type) => `https://vidsrc.in/embed/${type}?tmdb=${id}`,
  },
  {
    name: "VidSrc Net",
    domain: "vidsrc.net",
    type: "proxy",
    getUrl: (id, type) => `https://vidsrc.net/embed/${type}/${id}`,
  },
  {
    name: "TMDB API",
    type: "api",
    getUrl: (id, type) => `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${TMDB_API_KEY}`,
  },
]

let currentSource = 0
let currentMediaId = null
let currentMediaType = null

function createSecurePlayer(url, mediaId, mediaType) {
  const iframe = document.createElement("iframe")
  iframe.src = url
  iframe.allowFullscreen = true
  iframe.allow = "encrypted-media; autoplay; fullscreen"
  iframe.referrerPolicy = "no-referrer"
  iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-presentation"

  iframe.onerror = () => {
    logMessage("Error loading video. Trying next source.", "warning")
    switchToNextSource(mediaId, mediaType)
  }
  iframe.onload = () => {
    document.getElementById("loadingIndicator").style.opacity = "0"
    logMessage("Video loaded successfully", "info")
  }

  return iframe
}

function switchToNextSource(mediaId, mediaType) {
  currentSource = (currentSource + 1) % VIDEO_SOURCES.length
  loadVideoSource(mediaId, mediaType)
}

async function loadVideoSource(mediaId, mediaType) {
  const source = VIDEO_SOURCES[currentSource]
  const playerContainer = document.getElementById("playerContainer")

  document.getElementById("loadingIndicator").style.opacity = "1"

  if (source.type === "api") {
    try {
      const data = await fetchTMDB(`/${mediaType}/${mediaId}/videos`)
      if (data && data.results && data.results.length > 0) {
        const video = data.results[0]
        const embedUrl = `https://www.youtube.com/embed/${video.key}`
        playerContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`
        logMessage("Playing video from TMDB API", "info")
      } else {
        throw new Error("No video found")
      }
    } catch (error) {
      logMessage("Error loading TMDB API video. Trying next source.", "warning")
      switchToNextSource(mediaId, mediaType)
      return
    }
  } else {
    const url = source.getUrl(mediaId, mediaType === "movie" ? "movie" : "tv")
    playerContainer.innerHTML = ""
    playerContainer.appendChild(createSecurePlayer(url, mediaId, mediaType))
  }

  document.getElementById("loadingIndicator").style.opacity = "0"
}

function updateSourceButtons(mediaId, mediaType) {
  const sourceButtons = document.getElementById("sourceButtons")
  sourceButtons.innerHTML = VIDEO_SOURCES.map(
    (source, index) => `
        <button onclick="switchSource(${index}, '${mediaId}', '${mediaType}')"
                class="video-source-btn ${index === currentSource ? "bg-primary" : ""}">
            ${source.name}
        </button>
    `,
  ).join("")
}

function switchSource(sourceIndex, mediaId, mediaType) {
  currentSource = sourceIndex
  loadVideoSource(mediaId, mediaType)
  updateSourceButtons(mediaId, mediaType)
}

function playContent(id, mediaType, title) {
  currentMediaId = id
  currentMediaType = mediaType

  const playerModal = document.getElementById("playerModal")
  const playerTitle = document.getElementById("playerTitle")

  playerTitle.textContent = title
  playerModal.classList.remove("hidden")
  document.body.style.overflow = "hidden"

  loadVideoSource(id, mediaType)
  updateSourceButtons(id, mediaType)
  logMessage(`Playing: ${title}`, "info")
}

function closePlayer() {
  const playerModal = document.getElementById("playerModal")
  const playerContainer = document.getElementById("playerContainer")
  playerContainer.innerHTML = ""
  playerModal.classList.add("hidden")
  document.body.style.overflow = "auto"
  logMessage("Player closed", "info")
}

// Placeholder for logMessage and fetchTMDB functions.  These need to be implemented separately.
function logMessage(message, type) {
  console.log(message) // Replace with your actual logging mechanism
}

async function fetchTMDB(path) {
  const response = await fetch(`https://api.themoviedb.org/3${path}?api_key=${TMDB_API_KEY}`)
  return response.json()
}

