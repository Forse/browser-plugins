// Format seconds into a human-readable string.
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let parts = [];
    if (hours > 0) parts.push(hours + "h");
    if (minutes > 0 || hours > 0) parts.push(minutes + "m");
    parts.push(secs + "s");

    return parts.join(" ");
}

// Render the visit log into an HTML table.
function renderVisitLog(visitLog) {
    const tbody = document.querySelector("#logTable tbody");
    tbody.innerHTML = ""; // Clear any existing rows

    // For each entry in the visit log, create a table row.
    for (const key in visitLog) {
        if (visitLog.hasOwnProperty(key)) {
            const entry = visitLog[key];
            const tr = document.createElement("tr");

            const tdUrl = document.createElement("td");
            tdUrl.textContent = entry.url;

            const tdTime = document.createElement("td");
            tdTime.textContent = formatDuration(entry.duration);

            tr.appendChild(tdUrl);
            tr.appendChild(tdTime);
            tbody.appendChild(tr);
        }
    }
}

// Establish a long-lived connection (port) to the background script.
const port = chrome.runtime.connect();

// Listen for messages from the background service worker.
port.onMessage.addListener((msg) => {
    if (msg.action === "updateVisitLog") {
        console.log("Received live update:", msg.visitLog);
        renderVisitLog(msg.visitLog);
    }
});

// Optional: Initial waiting message.
document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector("#logTable tbody");
    tbody.innerHTML = '<tr><td colspan="2">Waiting for data...</td></tr>';
});
