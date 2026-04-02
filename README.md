# ⚔️ Last Meadow Farm Bot

A browser console script that injects a floating UI into Discord to automate **Last Meadow Online** farm activities — Gathering, Crafting, and Combat.

---

## ✨ Features

- **Auto-detects your token** from Discord's internal webpack state — no manual copying needed
- **Detects Discord host automatically** — works on both `discord.com` and `ptb.discord.com`
- **Draggable modal** — move the panel anywhere on screen by dragging the header
- **Per-activity toggles** — enable/disable Gathering, Crafting, and Combat independently
- **Random jitter** on cooldowns (±15%) to avoid pattern detection
- **Live activity log** — last 10 entries, auto-scrolling

---

## 🚀 Usage

1. Open Discord in your browser (`discord.com` or `ptb.discord.com`) and log in
2. Navigate to **any channel** in the Last Meadow server
3. Open the **Developer Tools** console:
   - **Discord Desktop (Electron):** `Ctrl + Shift + I` → Console tab
   - **Browser:** `F12` → Console tab
4. Copy the entire contents of [`bot.js`](./bot.js) and paste into the console, then press `Enter`
5. The **Last Meadow Bot** panel will appear in the top-right corner

---

## 🎮 Panel guide

| Element | Description |
|---|---|
| **🔑 Token** badge | Shows `✓ auto` if token was detected. Click `⟳ detect` to retry detection or paste manually |
| **Token input** | Auto-filled when detected. You can always paste a different token here |
| **🌿 Gathering** toggle | Sends `start` + `complete` every ~1.5 s |
| **🔨 Crafting** toggle | Sends `start` + `complete` every ~2.5 m |
| **⚔️ Combat** toggle | Sends `start` + `complete` every ~3 m |
| **📋 Activity log** | Last 10 events with timestamps and resource gains |
| **✕** button | Closes the panel and stops all active loops |
| **Header** | Drag to reposition the panel |

---

## ⏱ Cooldowns

| Activity | Start → Complete delay | Loop cooldown |
|---|---|---|
| Gathering | ~1.5 s | ~1.5 s |
| Crafting | ~2.5 s | ~2.5 m |
| Combat | ~2.5 s | ~3 m |

All timings include ±15% random jitter.

---

## 🌐 Compatibility

| Discord client | Supported |
|---|---|
| `discord.com` (browser) | ✅ |
| `ptb.discord.com` (browser) | ✅ |
| Discord Desktop (Electron) | ✅ |

The script reads `window.location.hostname` at runtime and automatically targets the correct API endpoint — no configuration needed.

---

## ⚠️ Disclaimer

This script automates interactions with a third-party Discord bot game. Use it at your own risk. The authors are not responsible for any account actions taken by Discord or the game developers.
