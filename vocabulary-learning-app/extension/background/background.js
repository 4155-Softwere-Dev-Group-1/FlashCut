console.log('Background service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('ContextCard extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  sendResponse({ success: true });
});