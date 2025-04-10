// Global state for the currently active tab.
// We store basic info: tabId and url.
let activeTabInfo = null;

// Global log for total active time grouped by domain.
// Structure: {
//   <domain>: {
//     domain: <domain>,
//     total: <seconds>,
//     pages: { <pathname>: <seconds>, ... }
//   },
//   ...
// }
const visitLog = {};

// Connected popup ports for live updates.
const ports = [];

/**
 * Starts (or switches) the active session for a given tab.
 */
function startSession(tab) {
    activeTabInfo = {
        tabId: tab.id,
        url: tab.url,
    };
    console.log("Started session for tab:", activeTabInfo);
}

/**
 * Parses a URL string into its domain (hostname) and path (pathname).
 */
function parseUrl(urlStr) {
    try {
        const urlObj = new URL(urlStr);
        return {
            domain: urlObj.hostname, // e.g., "example.com"
            path: urlObj.pathname, // e.g., "/page1"
        };
    } catch (error) {
        console.error("Invalid URL:", urlStr, error);
        return { domain: urlStr, path: "" };
    }
}

/**
 * Called every second to update the visit log.
 * If a tab is active, increment its duration by 1 second,
 * grouped by domain and then by path.
 */
function pushUpdate() {
    if (activeTabInfo) {
        const { domain, path } = parseUrl(activeTabInfo.url);

        // Initialize domain entry if missing.
        if (!visitLog[domain]) {
            visitLog[domain] = { domain: domain, total: 0, pages: {} };
        }
        // Initialize page entry if missing.
        if (!visitLog[domain].pages[path]) {
            visitLog[domain].pages[path] = 0;
        }
        // Increment both the domain total and the page-specific counter.
        visitLog[domain].total += 1;
        visitLog[domain].pages[path] += 1;
    }

    // Send the updated visitLog to all connected popups.
    ports.forEach((port) => {
        port.postMessage({ action: "updateVisitLog", visitLog: visitLog });
    });
}

/**
 * Listen for popup connections via port messaging.
 */
chrome.runtime.onConnect.addListener((port) => {
    console.log("Popup connected via port");
    ports.push(port);
    port.onDisconnect.addListener(() => {
        const index = ports.indexOf(port);
        if (index !== -1) {
            ports.splice(index, 1);
        }
    });
});

/**
 * Update activeTabInfo when a tab is activated.
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log("onActivated event:", activeInfo);
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab && tab.url) {
            startSession(tab);
        }
    });
});

/**
 * Update activeTabInfo when window focus changes.
 */
chrome.windows.onFocusChanged.addListener((windowId) => {
    console.log("onFocusChanged event:", windowId);
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        console.log("No window is focused.");
        activeTabInfo = null;
    } else {
        chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
            if (tabs && tabs.length > 0) {
                startSession(tabs[0]);
            }
        });
    }
});

/**
 * Update activeTabInfo when the active tab's URL changes.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && activeTabInfo && activeTabInfo.tabId === tabId) {
        console.log("onUpdated event for active tab:", tabId, changeInfo.url);
        startSession(tab);
    }
});

/**
 * Clear activeTabInfo when the active tab is closed.
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log("onRemoved event for tab:", tabId);
    if (activeTabInfo && activeTabInfo.tabId === tabId) {
        activeTabInfo = null;
    }
});

// Every second, push an update that increments the visited time by 1 second.
setInterval(() => {
    pushUpdate();
}, 1000);
