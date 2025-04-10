document.querySelectorAll('[data-time]').forEach(el => {
    el.addEventListener('click', (e) => {
        const time = parseFloat(e.target.dataset.time);
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: (time) => {
                    const video = document.querySelector('video');
                    if (video) video.currentTime = time;
                },
                args: [time]
            });
        });
    });
});

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

let currenTextTracks = [];
let searchTerm = '';

function renderTextTracks() {
    const list = document.getElementById('subtitles-list');
    list.innerHTML = '';

    currenTextTracks.filter(track => track.text.includes(searchTerm)).forEach(track => {
        const li = document.createElement('li');
        li.textContent = `${formatTime(track.startTime)} ${track.text}`;
        li.setAttribute('data-time', track.startTime);
        list.appendChild(li);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SUBTITLES_FOUND') {
        currenTextTracks = message.data;
        renderTextTracks();
    }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_SUBTITLES' }, (response) => {
        if (response?.textTracks) {
            currenTextTracks = response.textTracks;
            renderTextTracks();
        }
    });
});

document.getElementById('subtitles-list').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) {
        return;
    }
    const time = parseFloat(li.getAttribute('data-time'));
    if (isNaN(time)) {
        return;
    }
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'VIDEO_SEEK', position: time}, (response) => {
            console.log('seeked', response);
        });
    });
})

const searchInput = document.getElementById('search');
searchInput.addEventListener('change', (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderTextTracks();
})

searchInput.addEventListener('keyup', (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderTextTracks();
})
