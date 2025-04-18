// Create the overlay element.
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "10px";
overlay.style.right = "10px";
overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
overlay.style.color = "#fff";
overlay.style.padding = "5px 10px";
overlay.style.borderRadius = "4px";
overlay.style.zIndex = "9999999";
overlay.style.fontFamily = "sans-serif";
overlay.style.fontSize = "14px";
overlay.textContent = "Time on page: 0 s";
document.body.appendChild(overlay);

// Establish a persistent connection to the background.
const port = chrome.runtime.connect({ name: "content" });

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

// Listen for update messages from the background.
port.onMessage.addListener((msg) => {
    if (msg.action === "updateVisitLog" && msg.visitLog) {
        // Look up our full URL in the flat visitLog.
        // (Our background uses the full URL as the key.)
        const currentUrl = location.href;
        if (msg.visitLog[currentUrl]) {
            const seconds = msg.visitLog[currentUrl].duration;
            overlay.textContent = "Time on page: " + formatDuration(seconds);
        }
    }
});
