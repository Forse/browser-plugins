function getTextTracks(video) {
    const tracks = Array.from(video.textTracks);
    return tracks.filter(track => track.kind === "subtitles" || track.kind === "captions");
}

let currentTextTracks = [];
let currentVideo = null;

function parseTextTrack(track) {
    const cues = Array.from(track.cues ?? []);
    return cues.map(({ startTime, endTime, text }) => ({ startTime, endTime, text }))
}

function emitSubtitles(textTracks) {
    currentTextTracks = textTracks.flatMap(parseTextTrack);
    chrome.runtime.sendMessage({ type: 'SUBTITLES_FOUND', data: currentTextTracks });
}

const observedVideos = new Set();

function observeVideoTextTracks(video) {
    if (observedVideos.has(video)) {
        return;
    }

    observedVideos.add(video);
    currentVideo = video;

    function stopObserving() {
        observedVideos.delete(video);
        clearTimeout(interval);
    }

    function observeTextTracks() {
        const textTracks = getTextTracks(video);
        if (textTracks.length) {
            emitSubtitles(textTracks)
            stopObserving();
        }
    }

    let interval = setInterval(observeTextTracks, 100);
    setTimeout(stopObserving, 1000);
}

function handleNewVideoElement(video) {
    observeVideoTextTracks(video)

    function handlePlay() {
        observeVideoTextTracks(video)
        // video.removeEventListener('play', handlePlay)
    }

    video.addEventListener('play', handlePlay)
}

const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element
                if (node.tagName === 'VIDEO') {
                    handleNewVideoElement(node);
                }

                const videos = node.querySelectorAll?.('video');
                videos?.forEach(handleNewVideoElement);
            }
        }
    }
});

let isInitializes = false

function init() {
    if (isInitializes) {
        return;
    }
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    const videos = document.querySelectorAll('video');
    videos.forEach(handleNewVideoElement);
    isInitializes = true;
}

function handleReadyState() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    }
}

window.addEventListener('readystatechange', handleReadyState);

handleReadyState();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SUBTITLES') {
        sendResponse({ textTracks: currentTextTracks });
    }

    if (message.type === 'VIDEO_SEEK' && currentVideo && !isNaN(message.position)) {
        currentVideo.currentTime = message.position;
    }
});
