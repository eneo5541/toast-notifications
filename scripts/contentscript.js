chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type === 'UPDATE_SAVED_SEARCHES') {
    chrome.runtime.sendMessage(request);
  }
  sendResponse({ success: request.type === 'UPDATE_SAVED_SEARCHES' });
});
