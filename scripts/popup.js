document.addEventListener('DOMContentLoaded', () => {
  const refreshButton = document.getElementById('refresh-button');
  refreshButton.addEventListener('click', updateSavedSearch);
});

const setCookie = (name, value) => {
  document.cookie = `${name}=${value}; path=/`
}

const getAuthCookie = (tabUrl, callback) => {
  chrome.cookies.getAll({ 'url': tabUrl, 'name': 'DOMAIN.ASPXFORMSAUTH' }, cookies => {
    if (cookies) {
      //callback(cookies[0]);

      setCookie('DOMAIN.ASPXFORMSAUTH', cookies[0].value);
      console.log('.........', cookies[0].value);
      console.log('----- cookie', document.cookie);
      fetch('https://stage.domain.com.au/usersavedsearches/savedsearcheslistforcomponentsheader', {
        method: 'get',
        headers: {
          cookie: `DOMAIN.ASPXFORMSAUTH=${cookies[0].value}`,
          'Content-type': 'application/json',
          'Accept': 'application/json',
        }
      })
      .then(response => { console.log('ok, got your saved searches', response); })
      .catch(error => { console.log('Request failed', error); });

    } else {
      document.getElementById('error-msg').innerHTML = 'You don\'t appear to be logged in!';
    }
  });
}

const updateSavedSearch = event => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (tabs[0].url.indexOf('domain.com.au') > 0 || tabs[0].url.indexOf('localhost') > 0 || tabs[0].url.indexOf('eric.neo') > 0) {
      document.getElementById('error-msg').innerHTML = 'Your searches are being synchronized...';
      getAuthCookie(tabs[0].url, authCookie => {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_SAVED_SEARCHES', authToken: authCookie }, response => {
          console.log('Successfully updated saved searches');
        });
      });     
    } else {
      document.getElementById('error-msg').innerHTML = 'You must be on domain.com.au to synchronize';
    }
  });
}
