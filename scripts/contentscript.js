window.addEventListener('message', function(event) {
    if (event.data.type === 'SAVED_SEARCH_RESULTS') {
      chrome.runtime.sendMessage({ type: 'STORE_SAVED_SEARCH', data: event.data.data });
    }
  }, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === 'UPDATED_SAVED_SEARCH') {
    window.postMessage({ type: 'UPDATED_SAVED_SEARCH' }, '*');
  }
  sendResponse({ success: request.type === 'UPDATED_SAVED_SEARCH' });
});

