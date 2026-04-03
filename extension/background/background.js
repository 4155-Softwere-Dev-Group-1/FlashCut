console.log('Background service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('FlashCut extension installed');
});

// Forward the keyboard shortcut to the active tab's content script
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-flashcard') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'save-flashcard' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  sendResponse({ success: true });
});