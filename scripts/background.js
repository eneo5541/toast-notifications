const authorize = () => {
  const username = '';
  const password = '';

  return fetch('https://stage-auth.domain.com.au/v1/connect/token', {
    method: 'post',
    headers: {
      Authorization: `Basic ${window.btoa(username + ":" + password)}`,
      'Content-type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=client_credentials&scope=search-listings`,
  })
  .then(response => (response.json()))
  .then(json => {
    this.access_token = json.access_token;
    // getSearchResults();
  })
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
  console.log('fetching...');

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
  console.log('updating!');
  const newListing = {
    id: listing.id,
    url: listing.listingSlug,
    address: listing.propertyDetails.displayableAddress,
    image: listing.media[0].url
  };
  displayNotification(newListing);
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

  console.log('display notification!')

  chrome.notifications.create(options, (id) => { updateCurrentNotification(id, listing.url); });
}

if (window.Notification) {
  authorize();

  /*let interval = 0;
  const frequency = 1;

  setInterval(() => {
    interval++;

    if (frequency <= interval) {
      getSearchResults();
      interval = 0;
    }
  }, 60000);*/
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type === 'STORE_SAVED_SEARCH') {
    console.log('Storing saved searches: ', request);
    // getSearchResults();
    window.setTimeout(getSearchResults, 8000);
    //localStorage.domainSavedSearches = JSON.stringify(request.data.savedSearchList);
  }
  sendResponse({ success: request.type === 'STORE_SAVED_SEARCH' });
});
