/* global chrome */

(function() {
  'use strict';

  // Match everything at 'trello.com' (http or https)
  var pattern = /^http[s]?:\/\/([^\.]*\.)?trello\.com/;

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // Add an icon for when card numbers will be populated
    //
    // tab.url may not be available if the permission is not allowed
    if (tab.url && tab.url.match(pattern)) {
      chrome.pageAction.show(tabId);
    }

  });

}());
