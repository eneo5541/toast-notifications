window.addEventListener('message', function(event) {
    if (event.data.type === 'SAVED_SEARCH_RESULTS') {
      console.log('Domain extension is receiving saved searches...');
    }
  }, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === 'UPDATED_SAVED_SEARCH') {
    window.postMessage({ type: 'UPDATED_SAVED_SEARCH' }, '*');
    sendResponse({ success: true });
  }
});

