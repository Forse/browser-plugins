// popup.js

// Helper function to convert milliseconds into a human-readable string.
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let parts = [];
    if (hours > 0) {
        parts.push(hours + "h");
    }
    if (minutes > 0 || hours > 0) {
        parts.push(minutes + "m");
    }
    parts.push(seconds + "s");

    return parts.join(" ");
}

// Render the visit log data in the popup.
function renderVisitLog(visitLog) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML = ""; // Clear previous content

    for (const url in visitLog) {
        if (visitLog.hasOwnProperty(url)) {
            const entry = visitLog[url];
            const formattedTime = formatDuration(entry.duration);
            const p = document.createElement("p");
            p.textContent = `URL: ${entry.url} | Total Time: ${formattedTime}`;
            logDiv.appendChild(p);
        }
    }
}

// Set up a long-lived connection (port) to the background script.
const port = chrome.runtime.connect();

// Listen for live updates from the background script.
port.onMessage.addListener((msg) => {
    if (msg.action === "updateVisitLog") {
        console.log("Received live update:", msg.visitLog);
        renderVisitLog(msg.visitLog);
    }
});

// Optional: Display a waiting message until data is received.
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("log").textContent = "Waiting for data...";
});
