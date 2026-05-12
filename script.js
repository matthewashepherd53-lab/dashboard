window.setTheme = function(theme) {
    const body = document.body;
    body.classList.remove("theme-amber", "theme-blue", "theme-red");
    if (theme !== "default" && theme !== "emerald") body.classList.add("theme-" + theme);
    localStorage.setItem("active_spectrum", theme);
};

async function fetchBBCNewsTicker() {
    const rssProxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://feeds.bbci.co.uk/news/rss.xml");
    const track = document.getElementById("news-ticker-track");
    if (!track) return;
    try {
        const response = await fetch(rssProxyUrl);
        const data = await response.json();
        const items = data.items.slice(0, 10);
        const tickerHtml = items.map(item => `
            <div class="news-ticker-item">
                <div class="news-headline">${item.title}</div>
                <div class="news-summary">${item.description}</div>
            </div>
        `).join("");
        track.innerHTML = tickerHtml + tickerHtml;
    } catch (e) { console.error("News Error", e); }
}

async function fetchNASAData() {
    const apodUrl = "https://api.nasa.gov/planetary/apod?api_key=nR2JwicfkArXboMDbTxvJdoZxDUM7sOajxa3PM28";
    try {
        const response = await fetch(apodUrl);
        const data = await response.json();
        const root = document.getElementById("apod-root");
        if (data.media_type === "image") {
            root.innerHTML = `
                <div class="apod-container">
                    <img src="${data.url}" class="apod-image">
                    <div style="margin-top:5px; font-size:0.7rem; color:var(--primary-color); text-align:center;">${data.title.toUpperCase()}</div>
                </div>`;
        }
    } catch (e) { console.error("NASA Error", e); }
}

function initControls() {
    const selector = document.getElementById("stream-selector");
    const videoFrame = document.getElementById("video-feed");
    const fullBtn = document.getElementById("fullscreen-btn");

    selector.addEventListener("change", e => {
        const val = e.target.value;
        const joiner = val.includes('?') ? '&' : '?';
        videoFrame.src = `https://www.youtube.com/embed/${val}${joiner}autoplay=1&mute=1`;
    });

    fullBtn.addEventListener("click", () => {
        if (videoFrame.requestFullscreen) videoFrame.requestFullscreen();
    });
}

function updateClock() {
    const footerDate = document.getElementById("footer-date");
    if (footerDate) footerDate.innerText = new Date().toLocaleDateString() + " // " + new Date().toLocaleTimeString();
}

document.addEventListener("DOMContentLoaded", () => {
    fetchNASAData();
    fetchBBCNewsTicker();
    initControls();
    const savedTheme = localStorage.getItem("active_spectrum");
    if (savedTheme) window.setTheme(savedTheme);
    setInterval(updateClock, 1000);
    setInterval(fetchBBCNewsTicker, 600000);
    updateClock();
});

function playRadio(url, name) {
    const player = document.getElementById('radio-player');
    const status = document.getElementById('radio-status');
    
    player.src = url;
    player.play();
    
    status.innerText = "LIVE // " + name.toUpperCase();
    status.style.textShadow = "0 0 8px var(--primary-color)"; // Adds the active glow
}

function stopRadio() {
    const player = document.getElementById('radio-player');
    const status = document.getElementById('radio-status');
    player.pause();
    status.innerText = "STANDBY";
    status.style.textShadow = "none"; // Removes glow
}
