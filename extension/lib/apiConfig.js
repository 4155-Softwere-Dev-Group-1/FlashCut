// Single source of truth for FlashCut API base URL (no trailing slash).
// Override via chrome.storage.local key flashcutApiBaseUrl (set from Options).

const DEFAULT_FLASHCUT_API_BASE = 'http://localhost:5000';
const STORAGE_KEY = 'flashcutApiBaseUrl';

function normalizeBaseUrl(url) {
  if (!url || typeof url !== 'string') return DEFAULT_FLASHCUT_API_BASE;
  const t = url.trim().replace(/\/+$/, '');
  if (!t) return DEFAULT_FLASHCUT_API_BASE;
  try {
    const u = new URL(t);
    if (!u.protocol.startsWith('http')) return DEFAULT_FLASHCUT_API_BASE;
    return `${u.origin}`;
  } catch {
    return DEFAULT_FLASHCUT_API_BASE;
  }
}

function getFlashcutApiBaseUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (r) => {
      if (chrome.runtime.lastError) {
        resolve(DEFAULT_FLASHCUT_API_BASE);
        return;
      }
      resolve(normalizeBaseUrl(r[STORAGE_KEY] || DEFAULT_FLASHCUT_API_BASE));
    });
  });
}

function setFlashcutApiBaseUrl(url) {
  const normalized = normalizeBaseUrl(url);
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: normalized }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(normalized);
    });
  });
}

// Manifest grants only http://localhost:5000 and http://127.0.0.1:5000 — other origins need optional permission.
function manifestCoversOrigin(u) {
  const h = u.hostname;
  if (h !== 'localhost' && h !== '127.0.0.1') return false;
  return u.port === '5000';
}

async function prepareAndSaveFlashcutApiBaseUrl(url) {
  const normalized = normalizeBaseUrl(url);
  try {
    const u = new URL(normalized);
    if (!manifestCoversOrigin(u)) {
      await new Promise((resolve) => {
        chrome.permissions.request({ origins: [`${u.origin}/*`] }, resolve);
      });
    }
  } catch (_) { /* invalid URL already normalized away */ }

  await setFlashcutApiBaseUrl(normalized);
  return normalized;
}
