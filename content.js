if (!window.ayahOverlay) {
    window.ayahOverlay = document.createElement("div");
    window.ayahOverlay.id = "ayahOverlay";

    const style = window.ayahOverlay.style;

    // --- Base Properties ---
    style.position = "fixed";
    style.bottom = "30px";
    style.right = "30px";
    style.maxWidth = "420px";
    style.padding = "20px";
    style.color = "#ffffff";
    style.fontSize = "20px";
    style.zIndex = "9999999";
    style.direction = "rtl";
    style.textAlign = "right";
    style.pointerEvents = "none";
    style.opacity = "0.8";

    // --- Advanced Aesthetics ---
    style.background = "rgba(0, 0, 0, 0.7)";
    style.backdropFilter = "blur(12px)";
    style.WebkitBackdropFilter = "blur(12px)"; // Safari support
    style.borderRadius = "16px";
    style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.2)";
    style.border = "1px solid rgba(255, 255, 255, 0.1)";
    style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
    style.userSelect = "text";

    // --- Responsiveness (mobile adjustment) ---
    // JS cannot directly handle media queries inline, but we can use matchMedia
    const mobileQuery = window.matchMedia("(max-width: 500px)");
    function applyMobileStyles(e) {
        if (e.matches) {
            style.width = "90%";
            style.maxWidth = "none";
            style.left = "50%";
            style.right = "auto";
            style.transform = "translateX(-50%)";
            style.bottom = "20px";
            style.padding = "15px";
            style.fontSize = "18px";
        } else {
            style.width = "";
            style.maxWidth = "420px";
            style.left = "";
            style.right = "30px";
            style.transform = "";
            style.bottom = "30px";
            style.padding = "20px";
            style.fontSize = "20px";
        }
    }
    // Apply initially
    applyMobileStyles(mobileQuery);
    // Listen for changes
    mobileQuery.addListener(applyMobileStyles);

    // Hide initially
    style.display = "none";

    document.body.appendChild(window.ayahOverlay);
}



chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SHOW_AYAH") {
        window.ayahOverlay.innerHTML = `
            <div style="font-weight:bold;margin-bottom:10px;">
                الآية ${msg.number}
            </div>
            ${msg.text}
        `;
        window.ayahOverlay.style.display = "block";
    }
    if (msg.type === "HIDE") {
        window.ayahOverlay.style.display = "none";
    }
});
