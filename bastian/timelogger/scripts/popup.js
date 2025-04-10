// Establish a persistent connection to the background.
const port = chrome.runtime.connect({ name: "popup" });

// Listen for update messages from the background.
port.onMessage.addListener((msg) => {
    if (msg.action === "updateVisitLog" && msg.visitLog) {
        console.log("Received update:", msg);
        // Group the data by domain.
        const groupedLog = groupVisitLog(msg.visitLog);
        renderVisitLog(groupedLog);
    }
});

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

/**
 * Groups the flat visitLog (keyed by full URL) by domain.
 * For each domain, it calculates the total time and breakdown by path.
 * Example output:
 * {
 *   "example.com": {
 *     domain: "example.com",
 *     total: 120,
 *     pages: {
 *       "/": 60,
 *       "/news": 30,
 *       "/about": 30
 *     }
 *   },
 *   "another.com": { ... }
 * }
 */
function groupVisitLog(flatLog) {
    const grouped = {};
    Object.keys(flatLog).forEach((fullUrl) => {
        try {
            const urlObj = new URL(fullUrl);
            const domain = urlObj.hostname;
            const path = urlObj.pathname;
            const time = flatLog[fullUrl].duration;

            if (!grouped[domain]) {
                grouped[domain] = { domain: domain, total: 0, pages: {} };
            }
            grouped[domain].total += time;
            if (!grouped[domain].pages[path]) {
                grouped[domain].pages[path] = 0;
            }
            grouped[domain].pages[path] += time;
        } catch (error) {
            console.error("Error parsing URL:", fullUrl, error);
        }
    });
    return grouped;
}

/**
 * Renders the grouped visit log into HTML.
 */
function renderVisitLog(groupedLog) {
    const container = document.getElementById("visitLogContainer");
    container.innerHTML = ""; // Clear previous content

    const domains = Object.keys(groupedLog);
    if (domains.length === 0) {
        container.innerHTML = "<p>No visit log data available yet.</p>";
        return;
    }

    domains.forEach((domain) => {
        const entry = groupedLog[domain]; // { domain, total, pages }

        // Create a section for this domain.
        const domainDiv = document.createElement("div");
        domainDiv.className = "domain-section";

        // Domain header: include the domain and total time.
        const header = document.createElement("h2");
        header.textContent =
            domain + " - Total time: " + formatDuration(entry.total);
        domainDiv.appendChild(header);

        // Create a table for the breakdown by page.
        const table = document.createElement("table");

        // Table header
        const thead = document.createElement("thead");
        thead.innerHTML = "<tr><th>Page Path</th><th>Time (s)</th></tr>";
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement("tbody");
        const pages = entry.pages;
        if (pages) {
            Object.keys(pages).forEach((path) => {
                const tr = document.createElement("tr");

                // Create a cell with an anchor link.
                const tdPath = document.createElement("td");
                const a = document.createElement("a");
                // Here we assume HTTPS; adjust if needed.
                a.href = "https://" + domain + path;
                a.target = "_blank";
                a.textContent = path;
                tdPath.appendChild(a);

                const tdTime = document.createElement("td");
                tdTime.textContent = formatDuration(pages[path]);

                tr.appendChild(tdPath);
                tr.appendChild(tdTime);
                tbody.appendChild(tr);
            });
        } else {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 2;
            td.textContent = "No page data available.";
            tr.appendChild(td);
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        domainDiv.appendChild(table);
        container.appendChild(domainDiv);
    });
}

// Optional: display a waiting message until data arrives.
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("visitLogContainer");
    container.innerHTML = "<p>Waiting for data...</p>";
});
