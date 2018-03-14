document.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.getElementById('refresh-button');
  refreshButton.addEventListener('click', updateSavedSearch);
});

const updateSavedSearch = event => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0].url.indexOf('domain.com.au') > 0) {
      document.getElementById('error-msg').innerHTML = 'You must be on domain.com.au to synchronize';
    } else {
      document.getElementById('error-msg').innerHTML = 'Your searches are synchronized';
      chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATED_SAVED_SEARCH' }, response => {
          console.log('Successfully updated saved searches');
      });
    }
  });
}
