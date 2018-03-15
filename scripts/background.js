const authorize = () => {
  const username = '';
  const password = '';

  return fetch('https://stage-auth.domain.com.au/v1/connect/token', {
    method: 'post',
    headers: {
      Authorization: `Basic ${window.btoa(username + ":" + password)}`,
      'Content-type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=client_credentials&scope=search-listings`
  })
  .then(response => (response.json()))
  .then(json => {
    this.access_token = json.access_token;
    getSearchResults();
  })
  .catch(error => { console.log('Request failed', error); });
}

const getSavedSearches = authToken => {
  return fetch('https://stage.domain.com.au/usersavedsearches/savedsearcheslistforcomponentsheader', {
    method: 'get',
    headers: {
      cookie: `DOMAIN.ASPXFORMSAUTH=${authToken.value}`,
      'Content-type': 'application/json',
      'Accept': 'application/json',
    }
  })
  .then(response => { console.log('ok, got your saved searches', response); })
  .catch(error => { console.log('Request failed', error); });
}

const getSearchResults = () => {
  if (!localStorage.domainSavedSearches) {
    return;
  }

  const savedSearches = JSON.parse(localStorage.domainSavedSearches);
  const firstSearch = JSON.parse(savedSearches[0].searchQuery.queryBody);

  const payload = {
    listingType: 'Sale',
    page: 1,
    sort: { sortKey: 'DateUpdated', direction: 'Descending' },
    locations: firstSearch.locations.map(location => ({ 'suburb': location }))
  };

  fetch('https://stage-search-api.domain.com.au/v2/listings/search', {
    method: 'post',
    headers: {
      Authorization: `Bearer ${this.access_token}`,
      'Content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => (response.json()))
  .then(json => { updateLatestListing(json.results[0].listing); })
  .catch(error => { console.log('Request failed', error); });
}

const updateLatestListing = listing => {
  const currentListing = localStorage.currentListing ? JSON.parse(localStorage.currentListing) : {};
  const newListing = {
    id: listing.id,
    url: listing.listingSlug,
    address: listing.propertyDetails.displayableAddress,
    image: listing.media[0].url
  };

  if (!currentListing || currentListing.id !== newListing.id) {
    localStorage.currentListing = JSON.stringify(newListing);
    displayNotification(newListing);
  }
}

var currentNotification = { id: null, url: null };
chrome.notifications.onButtonClicked.addListener(function(notification, button) {
  if (notification === currentNotification.id && button === 0) {
    window.open(currentNotification.url);
  }
});

const updateCurrentNotification = (id, url) => {
  currentNotification = {
    id,
    url: `https://www.domain.com.au/${url}`
  };
}

const displayNotification = listing => {
  var options = {
    type: "basic",
    title: "A new listing is available",
    message: listing.address,
    iconUrl: listing.image,
    buttons: [{
      title: "View listing"
    }]
  };

  chrome.notifications.create(options, (id) => { updateCurrentNotification(id, listing.url); });
}

if (window.Notification) {
  authorize();

  let interval = 0;
  const frequency = 1;

  setInterval(() => {
    interval++;

    if (frequency <= interval) {
      getSearchResults();
      interval = 0;
    }
  }, 60000);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type === 'STORE_SAVED_SEARCH') {
    console.log('Storing saved searches: ', request.data);
    localStorage.domainSavedSearches = JSON.stringify(request.data.savedSearchList);
  }

  if (request.type === 'UPDATE_SAVED_SEARCHES') {
    console.log('updating saved searches', request);
    getSavedSearches(request.authToken);
  }
  sendResponse({ success: true });
});
