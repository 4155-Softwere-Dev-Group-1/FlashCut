# FlashCut — Installation Guide

## Prerequisites

- [Google Chrome](https://www.google.com/chrome/) (or any Chromium-based browser)
- A FlashCut account (register through the extension popup)

---

## Installing the Chrome Extension (Unpacked)

1. **Download or clone the repository**

   ```bash
   git clone https://github.com/4155-Softwere-Dev-Group-1/FlashCut.git
   ```

   Or download and extract the ZIP from GitHub.

2. **Open Chrome Extensions**

   Navigate to `chrome://extensions` in your address bar.

3. **Enable Developer Mode**

   Toggle **Developer mode** on using the switch in the top-right corner of the page.

4. **Load the extension**

   Click **Load unpacked**, then select the `extension/` folder inside the repository.

   Example path: `FlashCut/extension/`

5. **Confirm the extension loaded**

   The FlashCut icon should appear in your Chrome toolbar. If it doesn't, click the puzzle-piece icon in the toolbar and pin FlashCut.

---

## Connecting to the Backend

The extension points to the hosted API at `https://flashcut.onrender.com` by default — no configuration needed for standard use.

If you need to connect to a local or custom server:

1. Click the FlashCut icon → **Options** (or right-click the icon → **Options**).
2. Under **Backend URL**, enter your server address (e.g. `http://localhost:5001`).
3. Click **Save**.

---

## Creating an Account

1. Click the FlashCut icon in the toolbar.
2. Switch to the **Create account** tab.
3. Enter a username, email, and password, then click **Create account**.
4. You'll be logged in automatically.

---

## Using FlashCut

| Shortcut | Action |
|----------|--------|
| **Alt+S** | Save the selected word or phrase (1–3 words) as a flashcard |
| **Alt+G** | Simplify the selected passage with AI (2+ words, not saved) |

Shortcuts can be reassigned at `chrome://extensions/shortcuts`.

**Note:** Shortcuts do not work on Chrome system pages (e.g. `chrome://`, `chrome-extension://`).

### Saving a flashcard

1. Highlight 1–3 words on any webpage.
2. Press **Alt+S**.
3. A confirmation appears when the card is saved.

### Viewing and managing flashcards

1. Click the FlashCut icon.
2. Your saved cards appear in the popup.
3. Click **Options** for the full list, editing, deletion, and export (CSV/JSON).

---

## Reloading After Updates

If you pull new code from the repository:

1. Go to `chrome://extensions`.
2. Click the **Reload** button (circular arrow) on the FlashCut card.
3. Refresh any browser tabs where you want the updated content script to run.
