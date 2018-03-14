// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
  Displays a notification with the current time. Requires "notifications"
  permission in the manifest file (or calling
  "Notification.requestPermission" beforehand).
*/

function show() {
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
      Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlNvQlBlWjdOeFU3bEVPeDZSVzhfbHVhMWtKZyIsImtpZCI6IlNvQlBlWjdOeFU3bEVPeDZSVzhfbHVhMWtKZyJ9.eyJpc3MiOiJodHRwczovL3N0YWdlLWF1dGguZG9tYWluLmNvbS5hdS92MSIsImF1ZCI6Imh0dHBzOi8vc3RhZ2UtYXV0aC5kb21haW4uY29tLmF1L3YxL3Jlc291cmNlcyIsImV4cCI6MTUyMTA4ODc3MiwibmJmIjoxNTIxMDAyMzcyLCJjbGllbnRfaWQiOiJmZS1zZXJ2ZXItc2VhcmNoLXJlc3VsdHMiLCJzY29wZSI6WyJyZWFkLWFkcyIsInJlYWQtYWdlbmN5IiwicmVhZC1saXN0aW5nIiwic2VhcmNoLWxpc3RpbmdzIl0sImp0aSI6ImY4MmQxMTZiOTg1NWU4ODY1ZDRmOGZkMjliMzNkZTI3In0.ftp5vdPMDJRl4nBzQcuJ_faU6bnTRk0XRtyFr6b2tBn5OeyuJ0S3B7Dq9HuCezcPBJ_OjGIoGdx4ahT48mORsKv7CyeG6EJH2y_bGU_zXRscWJNeqZXOHjhQ8Wp8h6LX_v8ik5-xGXp53-J-VzIbXGqoBlEWVhDrFRXPQIHnbRMmPClYem6BLfsbipLAENhqHV2MPXfDWZAITH0yUER0KIH4XOtW0Mvn4MWNAOLCui1LNuR9G7OD0diAWVeAsFZE8xnkDFJQY_j9V7fho1z6E5IX2YsK7wj5DSWv5ewtp-Il8m1egvihs0slrWMXRFfN7yOhQk8i18H_CKCEHJLLsQ',
      'Content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => (response.json()))
  .then(myJson => { console.log(myJson); })
  .catch(error => { console.log('Request failed', error); });

  /* var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
  new Notification(hour + time[2] + ' ' + period, {
    icon: '48.png',
    body: 'Time to make the toast.'
  }); */
}

// localStorage.domainSavedSearches = '{"savedSearches":[{"searchName":"Penrith NSW 2750, Chatswood NSW 2067","url":"https://stage.domain.com.au/sale/?suburb=chatswood-nsw-2067,penrith-nsw-2750&ssubs=1&excludeunderoffer=1","searchQuery":{"queryBody":"{\"humanizedPrice\":\"Any price\",\"locations\":[\"Penrith\",\"Chatswood\"],\"listingType\":\"\"}"}},{"searchName":"rr","url":"https://stage.domain.com.au/new-homes/?ptype=new-apartments,new-house-land,new-land,town-house&bedrooms=1-5&bathrooms=1-4&price=0-250000&carspaces=0-4","searchQuery":{"queryBody":"{\"humanizedPrice\":\"0-250000\",\"locations\":[\"\"],\"listingType\":\"\"}"}},{"searchName":"w","url":"https://stage.domain.com.au/new-homes/?ptype=new-apartments,new-house-land,new-land,town-house&bedrooms=1-5&bathrooms=1-4&price=0-200000&carspaces=0-4","searchQuery":{"queryBody":"{\"humanizedPrice\":\"0-200000\",\"locations\":[\"\"],\"listingType\":\"\"}"}}]}';

// Test for notification support.
if (window.Notification) {
  // While activated, show notifications at the display frequency.
  show();

  let interval = 0; // The display interval, in minutes.
  const frequency = 1;

  setInterval(function() {
    interval++;

    if (frequency <= interval) {
      // show();
      interval = 0;
    }
  }, 6000);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === 'STORE_SAVED_SEARCH') {
    console.log('storing saved searches: ', request.data);
    localStorage.domainSavedSearches = JSON.stringify(request.data.savedSearchList);
  }
  sendResponse({ success: request.type === 'STORE_SAVED_SEARCH' });
});