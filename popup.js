let totalAyahsCache = {};

// --- LOAD SURAH LIST ---
async function loadSurahs() {
    try {
        const res = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await res.json();

        const select = document.getElementById("surahSelect");
        data.data.forEach(surah => {
            const opt = document.createElement("option");
            opt.value = surah.number;
            opt.textContent = `${surah.number} - ${surah.englishName} (${surah.numberOfAyahs})`;
            opt.dataset.ayahs = surah.numberOfAyahs;
            select.appendChild(opt);

            totalAyahsCache[surah.number] = surah.numberOfAyahs; // cache total ayahs
        });

        await restoreState();
    } catch (err) {
        console.error("Failed to load surahs:", err);
    }
}

// --- RESTORE STATE ---
async function restoreState() {
    const stored = await chrome.storage.local.get(["isRunning", "surahNumber", "startAyah", "endAyah"]);

    const select = document.getElementById("surahSelect");
    const startInput = document.getElementById("startAyah");
    const endInput = document.getElementById("endAyah");
    const toggleBtn = document.getElementById("toggleBtn");

    const surahNumber = stored.surahNumber || 1;
    select.value = surahNumber;

    const totalAyahs = totalAyahsCache[surahNumber] || 7;

    startInput.value = stored.startAyah || 1;
    endInput.value = stored.endAyah || totalAyahs;

    toggleBtn.textContent = stored.isRunning ? "Stop" : "Start";

    // Auto-fill ayah range if empty
    if (!stored.startAyah && !stored.endAyah) autoFillAyahRange();
}

// --- AUTO-FILL AYAH RANGE ---
function autoFillAyahRange() {
    const select = document.getElementById("surahSelect");
    const startInput = document.getElementById("startAyah");
    const endInput = document.getElementById("endAyah");

    const total = parseInt(select.selectedOptions[0]?.dataset.ayahs) || 1;

    startInput.value = 1;
    startInput.min = 1;
    startInput.max = total;

    endInput.value = total;
    endInput.min = 1;
    endInput.max = total;
}


// --- GET VALIDATED RANGE ---
function getRange() {
    const select = document.getElementById("surahSelect");
    const surahNumber = parseInt(select.value);
    const totalAyahs = parseInt(select.selectedOptions[0]?.dataset.ayahs) || 7;

    let startAyah = parseInt(document.getElementById("startAyah").value) || 1;
    let endAyah = parseInt(document.getElementById("endAyah").value) || totalAyahs;

    if (startAyah < 1) startAyah = 1;
    if (endAyah > totalAyahs) endAyah = totalAyahs;

    if (startAyah > endAyah) [startAyah, endAyah] = [endAyah, startAyah];

    document.getElementById("startAyah").value = startAyah;
    document.getElementById("endAyah").value = endAyah;

    return { surahNumber, startAyah, endAyah };
}

// --- EVENT LISTENERS ---
document.getElementById("surahSelect").addEventListener("change", autoFillAyahRange);

document.getElementById("toggleBtn").addEventListener("click", async () => {
    const toggleBtn = document.getElementById("toggleBtn");

    if (toggleBtn.textContent === "Stop") {
        chrome.runtime.sendMessage({ type: "STOP_LOOP" });
        toggleBtn.textContent = "Start";
    } else {
        const { surahNumber, startAyah, endAyah } = getRange();

        chrome.runtime.sendMessage(
            { type: "START_LOOP", surahNumber, startAyah, endAyah },
            (response) => {
                if (response?.status === "started") toggleBtn.textContent = "Stop";
                else if (response?.status === "error") console.error("Failed to start loop:", response.message);
            }
        );
    }
});

// --- INIT ---
loadSurahs();
