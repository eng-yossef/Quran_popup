let isRunning = false;
let allAyat = [];
let loopIndex = 0;
let loopTimer = null;
let currentSurahNumber = null;
let startAyah = null;
let endAyah = null;

// Send message to content script to show/hide ayah
function sendToContent(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs.length) return;

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (msg) => {
                if (window.ayahOverlay) {
                    if (msg.type === "SHOW_AYAH") {
                        window.ayahOverlay.innerHTML = `
                            ${msg.text}  (${msg.number})
                        `;
                        window.ayahOverlay.style.display = "block";
                    }
                    if (msg.type === "HIDE") {
                        window.ayahOverlay.style.display = "none";
                    }
                }
            },
            args: [message]
        });
    });
}

async function fetchAyat(surahNumber) {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const data = await res.json();
    return data.data.ayahs;
}

async function showNextAyah() {
    if (!isRunning || allAyat.length === 0) return;

    const ayah = allAyat[loopIndex];

    sendToContent({ type: "SHOW_AYAH", text: ayah.text, number: ayah.numberInSurah });

    const duration = 3000 + ayah.text.length * 100;

    loopIndex = (loopIndex + 1) % allAyat.length;
    loopTimer = setTimeout(showNextAyah, duration);
}

async function startLoop(surahNumber, start, end) {
    if (isRunning) stopLoop();

    currentSurahNumber = surahNumber;
    startAyah = start;
    endAyah = end;

    isRunning = true;

    const allAyahsData = await fetchAyat(surahNumber);
    allAyat = allAyahsData.slice(startAyah - 1, endAyah);
    loopIndex = 0;

    showNextAyah();

    chrome.storage.local.set({
        isRunning: true,
        surahNumber: currentSurahNumber,
        startAyah,
        endAyah
    });
}

function stopLoop() {
    if (!isRunning) return;
    isRunning = false;
    clearTimeout(loopTimer);
    sendToContent({ type: "HIDE" });
    chrome.storage.local.set({ isRunning: false });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "START_LOOP") {
        startLoop(request.surahNumber, request.startAyah, request.endAyah)
            .then(() => sendResponse({ status: "started" }))
            .catch(err => sendResponse({ status: "error", message: err.message }));
        return true;
    }

    if (request.type === "STOP_LOOP") {
        stopLoop();
        sendResponse({ status: "stopped" });
    }

    if (request.type === "GET_STATE") {
        sendResponse({
            isRunning,
            surahNumber: currentSurahNumber,
            startAyah,
            endAyah
        });
    }
});
