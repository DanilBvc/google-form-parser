chrome.runtime.onInstalled.addListener(() => {
  console.log('Google Forms Scanner extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getActiveTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.action.openPopup();
});
