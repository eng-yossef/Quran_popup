# 📖 Quran Ayah Looper — Chrome Extension

A lightweight Chrome extension that displays Quran Ayat on any webpage in a floating overlay to help with reading and memorization.

---

## 🌟 Features
- Select **Surah** + **Ayah range**
- Auto-loop through Ayat
- Time per Ayah adjusts based on its text length
- Beautiful glass-style floating overlay
- Hide/close overlay with a built-in button
- Saves last selected settings
- Works on all normal websites

---

## 🏗️ How It Works
1. Choose Surah + Start/End Ayah from popup  
2. Click **Start**  
3. Background script fetches Ayat  
4. Content script displays each Ayah in an overlay  
5. Loop continues until **Stop** is clicked  

---

## 📂 Files
manifest.json
popup.html
popup.js # UI + user settings
background.js # Loop engine + API fetch
content.js # Ayah overlay renderer

---

## 🔧 Installation
1. Go to `chrome://extensions/`  
2. Enable **Developer mode**  
3. Click **Load unpacked**  
4. Select the extension folder  

---

## 🔐 Permissions
```json
"permissions": ["storage", "scripting", "activeTab"],
"host_permissions": ["<all_urls>"]
