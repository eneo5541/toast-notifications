const authorize = () => {
  const username = 'fe-server-search-results';
  const password = '65d111990b2246108b721b820bee958e';

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
    getSearchResults();
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

  fetch('https://stage-search-api.domain.com.au/v2/listings/search', {
    method: 'post',
    headers: {
      Authorization: `Bearer ${this.access_token}`,
      'Content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => (response.json()))
  .then(json => { displayNotification(json.results[0].listing); })
  .catch(error => { console.log('Request failed', error); });
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
    title: "Primary Title",
    message: "Primary message to display",
    iconUrl: listing.media[0].url,
    buttons: [{
      title: "View listing"
    }]
  };

  chrome.notifications.create(options, (id) => { updateCurrentNotification(id, listing.listingSlug); });
}

// localStorage.domainSavedSearches = '{"savedSearches":[{"searchName":"Penrith NSW 2750, Chatswood NSW 2067","url":"https://stage.domain.com.au/sale/?suburb=chatswood-nsw-2067,penrith-nsw-2750&ssubs=1&excludeunderoffer=1","searchQuery":{"queryBody":"{\"humanizedPrice\":\"Any price\",\"locations\":[\"Penrith\",\"Chatswood\"],\"listingType\":\"\"}"}},{"searchName":"rr","url":"https://stage.domain.com.au/new-homes/?ptype=new-apartments,new-house-land,new-land,town-house&bedrooms=1-5&bathrooms=1-4&price=0-250000&carspaces=0-4","searchQuery":{"queryBody":"{\"humanizedPrice\":\"0-250000\",\"locations\":[\"\"],\"listingType\":\"\"}"}},{"searchName":"w","url":"https://stage.domain.com.au/new-homes/?ptype=new-apartments,new-house-land,new-land,town-house&bedrooms=1-5&bathrooms=1-4&price=0-200000&carspaces=0-4","searchQuery":{"queryBody":"{\"humanizedPrice\":\"0-200000\",\"locations\":[\"\"],\"listingType\":\"\"}"}}]}';

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
  sendResponse({ success: request.type === 'STORE_SAVED_SEARCH' });
});