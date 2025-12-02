// Background Service Worker

console.log('aiGen Form Filler Background Service Worker loaded');

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  // Future: Can handle API requests, caching, etc.

  return true;
});

// Optional: Add context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'aigen-fill-form',
    title: 'Mit aiGen Bericht ausfüllen',
    contexts: ['editable']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'aigen-fill-form') {
    // Open popup or trigger fill
    chrome.action.openPopup();
  }
});
