(function() {
  'use strict';

  // chrome.runtime.onInstalled.addListener(function (details) {});

  chrome.tabs.onUpdated.addListener(function (tabId) {
    // TODO: Add an icon for when card numbers will be populated
    //chrome.pageAction.show(tabId);
  });

}());
