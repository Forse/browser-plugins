// background.js (service worker)

// Global state for the active tab's session
let activeTabInfo = null; // { tabId, url, startTime }
const visitLog = {}; // Logs total active duration by URL, e.g., { "http://example.com": { url: "http://example.com", duration: 12345 } }
const ports = []; // Connected ports from popups

/**
 * Record the active time for the current active tab session and clear it.
 */
function recordTime() {
    if (activeTabInfo && activeTabInfo.startTime) {
        const now = Date.now();
        const duration = now - activeTabInfo.startTime;
        const key = activeTabInfo.url;
        console.log(`Recording ${duration}ms for ${key}`);
        if (!visitLog[key]) {
            visitLog[key] = { url: key, duration: 0 };
        }
        visitLog[key].duration += duration;
        // Clear the active session; a new one will start when the tab is re-activated.
        activeTabInfo = null;
    }
}

/**
 * Push an update to all connected popup ports.
 * The update includes the visit log plus the current active session's live duration.
 */
function pushUpdate() {
    // Make a shallow copy of visitLog.
    const currentLog = Object.assign({}, visitLog);
    // If there's an active session, add the live (extra) time since startTime.
    if (activeTabInfo && activeTabInfo.startTime) {
        const key = activeTabInfo.url;
        const extraDuration = Date.now() - activeTabInfo.startTime;
        if (!currentLog[key]) {
            currentLog[key] = { url: key, duration: extraDuration };
        } else {
            currentLog[key].duration += extraDuration;
        }
    }
    console.log("Pushing update to ports:", currentLog);
    ports.forEach((port) => {
        port.postMessage({ action: "updateVisitLog", visitLog: currentLog });
    });
}

/**
 * Listen for connections from the popup.
 * Each connected port is stored and later used to push updates.
 */
chrome.runtime.onConnect.addListener((port) => {
    console.log("Popup connected via port");
    ports.push(port);

    // Clean up when the popup disconnects.
    port.onDisconnect.addListener(() => {
        const index = ports.indexOf(port);
        if (index !== -1) {
            ports.splice(index, 1);
        }
    });
});

/**
 * Listen for active tab changes.
 * When a new tab becomes active, record time for the previous one, and start a new session.
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log("onActivated fired:", activeInfo);
    recordTime();
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab && tab.url) {
            activeTabInfo = {
                tabId: tab.id,
                url: tab.url,
                startTime: Date.now(),
            };
            console.log("New activeTabInfo from onActivated:", activeTabInfo);
            pushUpdate();
        }
    });
});

/**
 * Listen for window focus changes.
 * This catches when the user moves focus out of (or back to) a window.
 */
chrome.windows.onFocusChanged.addListener((windowId) => {
    console.log("onFocusChanged fired:", windowId);
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        console.log("No window is focused, recording time.");
        recordTime();
        pushUpdate();
    } else {
        chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
            if (tabs && tabs.length > 0) {
                console.log("Active tab from focused window:", tabs[0]);
                // End the previous session (if any) before starting a new one.
                recordTime();
                activeTabInfo = {
                    tabId: tabs[0].id,
                    url: tabs[0].url,
                    startTime: Date.now(),
                };
                console.log(
                    "Updated activeTabInfo after window focus change:",
                    activeTabInfo
                );
                pushUpdate();
            }
        });
    }
});

/**
 * Listen for tab updates (e.g., URL changes).
 * When the URL of the active tab changes, record the previous session and start tracking the new URL.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && activeTabInfo && activeTabInfo.tabId === tabId) {
        console.log(
            `onUpdated fired for active tab ${tabId}, new URL: ${changeInfo.url}`
        );
        recordTime();
        activeTabInfo = {
            tabId: tab.id,
            url: changeInfo.url,
            startTime: Date.now(),
        };
        console.log("Updated activeTabInfo after URL change:", activeTabInfo);
        pushUpdate();
    }
});

/**
 * Optionally, listen for tab removal.
 * If the active tab is closed, record its time.
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log("onRemoved fired for tab:", tabId);
    if (activeTabInfo && activeTabInfo.tabId === tabId) {
        recordTime();
        pushUpdate();
    }
});

/**
 * Optional interval-based push update.
 * This ensures live updates even if no new events occur.
 */
setInterval(() => {
    pushUpdate();
}, 1000);
