/**
 * MISSION CONTROL DASHBOARD - MAIN SYSTEMS
 * Final Sync: All Systems Operational
 */

// --- 1. GLOBAL THEME ENGINE ---
window.setTheme = function(theme) {
    console.log("LOG // Switching Visual Spectrum to:", theme);

    const body = document.body;
    body.classList.remove("theme-amber", "theme-blue", "theme-red");

    if (theme !== "default" && theme !== "emerald") {
        body.classList.add("theme-" + theme);
    }

    localStorage.setItem("active_spectrum", theme);
};

// --- 2. BBC NEWS TICKER MODULE ---
const bbcFeedUrl = "https://feeds.bbci.co.uk/news/rss.xml";
const rssProxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(bbcFeedUrl);

function cleanNewsText(text) {
    if (!text) return "";

    const temp = document.createElement("div");
    temp.innerHTML = text;

    return temp.textContent
        .replace(/\s+/g, " ")
        .trim();
}

function buildNewsItem(item) {
    return (
        '<div class="news-ticker-item">' +
            '<div class="news-headline">' + cleanNewsText(item.title) + '</div>' +
            '<div class="news-summary">' + cleanNewsText(item.description) + '</div>' +
        '</div>'
    );
}

async function fetchBBCNewsTicker() {
    console.log("LOG // Fetching BBC RSS news ticker...");

    const track = document.getElementById("news-ticker-track");

    if (!track) {
        console.error("BBC News Ticker Error: #news-ticker-track not found in HTML.");
        return;
    }

    try {
        const response = await fetch(rssProxyUrl);
        const data = await response.json();

        console.log("BBC RSS DATA:", data);

        if (!data.items || data.items.length === 0) {
            throw new Error("No BBC RSS items returned.");
        }

        const items = data.items.slice(0, 10);
        const tickerHtml = items.map(buildNewsItem).join("");

        track.innerHTML = tickerHtml + tickerHtml;

    } catch (error) {
        console.error("BBC News Ticker Error", error);

        track.innerHTML =
            '<div class="news-ticker-item">' +
                '<div class="news-headline">[ BBC NEWS SIGNAL LOST ]</div>' +
                '<div class="news-summary">Unable to retrieve RSS feed via proxy.</div>' +
            '</div>';
    }
}

// --- 3. NASA APOD MODULE ---
const apiKey = "nR2JwicfkArXboMDbTxvJdoZxDUM7sOajxa3PM28";
const apodUrl = "https://api.nasa.gov/planetary/apod?api_key=" + apiKey;

async function fetchNASAData() {
    try {
        const response = await fetch(apodUrl);
        const data = await response.json();
        const root = document.getElementById("apod-root");

        if (data.media_type === "image") {
            root.innerHTML =
                '<div class="apod-container">' +
                    '<img src="' + data.url + '" alt="NASA APOD" class="apod-image">' +
                    '<div class="apod-footer">' +
                        '<div style="font-size: 0.7rem; margin-bottom: 4px; color: var(--primary-color);">' +
                            data.title.toUpperCase() +
                        '</div>' +
                        '<div class="apod-description" id="apod-desc">' +
                            data.explanation +
                        '</div>' +
                    '</div>' +
                '</div>';

            document.getElementById("apod-desc").addEventListener("click", function() {
                this.classList.toggle("expanded");
            });
        }
    } catch (e) {
        console.error("NASA Error", e);
    }
}

// --- 4. SPORTS INTEL ---
const footballKey = "f3866ebe96352485882c5c7a04aaf0a4";

async function fetchSportsData() {
    console.log("LOG // Initiating Live Intel Scan...");

    try {
        const root = document.getElementById("sports-root");
        const targetLeagues = [2, 39, 41];

        const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
            headers: {
                "x-apisports-key": footballKey,
                "x-rapidapi-host": "v3.football.api-sports.io"
            }
        });

        const data = await response.json();
        let displayMatches = data.response.filter(item => targetLeagues.includes(item.league.id));

        if (displayMatches.length === 0) {
            console.log("LOG // No Live Intel. Scanning upcoming schedules...");

            const upcoming = await Promise.all(targetLeagues.map(id =>
                fetch("https://v3.football.api-sports.io/fixtures?league=" + id + "&next=5", {
                    headers: {
                        "x-apisports-key": footballKey,
                        "x-rapidapi-host": "v3.football.api-sports.io"
                    }
                }).then(res => res.json())
            ));

            upcoming.forEach(res => {
                if (res.response) displayMatches = displayMatches.concat(res.response);
            });
        }

        if (displayMatches.length > 0) {
            displayMatches.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

            let html = '<div class="sports-ticker">';

            displayMatches.slice(0, 10).forEach(item => {
                const home = item.teams.home.name;
                const away = item.teams.away.name;
                const status = item.fixture.status.short;
                const elapsed = item.fixture.status.elapsed;
                const homeScore = item.goals.home ?? 0;
                const awayScore = item.goals.away ?? 0;
                const isWigan = home.includes("Wigan") || away.includes("Wigan");

                const liveTag = ["1H", "2H", "HT"].includes(status)
                    ? '<span style="color: #ff4444; animation: blink 1.5s infinite;"> [ LIVE ' + elapsed + '\' ] </span>'
                    : '<span style="color: #666;"> [ ' + new Date(item.fixture.date).toLocaleDateString([], { day: "numeric", month: "short" }) + ' ] </span>';

                const scoreText = ["1H", "2H", "HT"].includes(status)
                    ? homeScore + " - " + awayScore
                    : new Date(item.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                html +=
                    '<div class="game-card" style="' + (isWigan ? "border-left: 3px solid var(--primary-color);" : "") + '">' +
                        '<div style="flex: 1;">' +
                            '<span class="team-names">' + home.toUpperCase() + " vs " + away.toUpperCase() + '</span>' +
                            '<span class="game-status">' + item.league.name.toUpperCase() + " // " + liveTag + '</span>' +
                        '</div>' +
                        '<div class="score-display">' + scoreText + '</div>' +
                    '</div>';
            });

            root.innerHTML = html + "</div>";
        } else {
            root.innerHTML = '<p style="color: #444; text-align: center; margin-top: 20%;">[ NO ACTIVE SIGNALS ]</p>';
        }

    } catch (e) {
        console.error("Sports Error", e);
    }
}

// --- 5. SYSTEM UTILITIES ---
function initControls() {
    console.log("LOG // Initializing UI Controllers...");

    const selector = document.getElementById("stream-selector");
    const videoFrame = document.getElementById("video-feed");

    if (selector && videoFrame) {
        selector.addEventListener("change", e => {
            videoFrame.src = "https://www.youtube.com/embed/" + e.target.value + "?autoplay=1&mute=1";
        });
    }

    document.querySelectorAll("header").forEach(h => {
        h.addEventListener("click", () => h.parentElement.classList.toggle("collapsed"));
    });
}

function updateFooterClock() {
    const footerDate = document.getElementById("footer-date");

    if (footerDate) {
        footerDate.innerText = new Date().toLocaleDateString() + " // " + new Date().toLocaleTimeString();
    }
}

// --- 6. INITIALIZATION BOOT SEQUENCE ---
document.addEventListener("DOMContentLoaded", () => {
    fetchNASAData();
    fetchSportsData();
    fetchBBCNewsTicker();
    initControls();

    const savedTheme = localStorage.getItem("active_spectrum");
    if (savedTheme) window.setTheme(savedTheme);

    setInterval(updateFooterClock, 1000);
    setInterval(fetchSportsData, 900000);
    setInterval(fetchBBCNewsTicker, 600000);

    updateFooterClock();

    console.log("SYSTEM READY // Sync interval set.");
});