// Storage utilities for FlashCut Extension

async function saveToStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, resolve);
  });
}

async function getFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

export { saveToStorage, getFromStorage };
