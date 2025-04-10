// background.js

// Global state for the currently active tab.
// We store basic info: tabId and url.
let activeTabInfo = null;

// Global log for total active time per URL (in seconds).
const visitLog = {};

// Connected popup/content script ports for live updates.
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
 * Called every second to update the visit log.
 * If a tab is active, increment its duration by 1 second.
 */
function pushUpdate() {
    if (activeTabInfo) {
        const key = activeTabInfo.url;
        if (!visitLog[key]) {
            visitLog[key] = { url: key, duration: 0 };
        }
        // Increment by 1 second.
        visitLog[key].duration += 1;
    }
    // Send the updated visitLog to all connected ports.
    ports.forEach((port) => {
        port.postMessage({ action: "updateVisitLog", visitLog: visitLog });
    });
}

/**
 * Listen for popup or content script connections via port messaging.
 */
chrome.runtime.onConnect.addListener((port) => {
    console.log("Port connected:", port.name);
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
