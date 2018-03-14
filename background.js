chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // alert("message received");
  console.log(sender.tab ?
    "from a content script:" + sender.tab.url :
    "from the extension");
});