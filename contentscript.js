document.addEventListener("hello", function(data) {
    console.log('got your message!!!');
    chrome.runtime.sendMessage("test");
})