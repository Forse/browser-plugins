// Establish a persistent connection to the background.
const port = chrome.runtime.connect();

// Listen for update messages from the background.
port.onMessage.addListener((msg) => {
    if (msg.action === "updateVisitLog") {
        console.log("Received update:", msg);
        renderVisitLog(msg.visitLog);
    }
});

// Renders the entire visit log grouped by domain.
function renderVisitLog(visitLog) {
    const container = document.getElementById("visitLogContainer");
    container.innerHTML = ""; // Clear previous content

    const domains = Object.keys(visitLog);
    if (domains.length === 0) {
        container.innerHTML = "<p>No visit log data available yet.</p>";
        return;
    }

    domains.forEach((domain) => {
        const entry = visitLog[domain]; // { domain, total, pages }

        // Create a container div for this domain.
        const domainDiv = document.createElement("div");
        domainDiv.className = "domain-section";

        // Create a header showing the domain and its total time.
        const header = document.createElement("h2");
        header.textContent = domain + " - Total time: " + entry.total + " s";
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

                const tdPath = document.createElement("td");
                // Create an anchor that opens the URL.
                const a = document.createElement("a");
                // We assume https by default – change this if needed.
                a.href = "https://" + domain + path;
                a.target = "_blank"; // Opens in a new tab
                a.textContent = path;
                tdPath.appendChild(a);

                const tdTime = document.createElement("td");
                tdTime.textContent = pages[path] + " s";

                tr.appendChild(tdPath);
                tr.appendChild(tdTime);
                tbody.appendChild(tr);
            });
        } else {
            // In case there are no pages recorded for this domain
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

// Optional: show a waiting message until data arrives.
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("visitLogContainer");
    container.innerHTML = "<p>Waiting for data...</p>";
});
