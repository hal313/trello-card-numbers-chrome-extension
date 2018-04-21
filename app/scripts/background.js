/* global chrome */

(function (global) {
  'use strict';

  /**
   * Receives a message from a content script.
   * 
   * @param {*} request the request payload
   * @param {*} sender  the sending entity
   */
  var onRequest = function onRequest(request, sender) {
    // If the request is show_page_action
    if (global.trello_card_numbers_chrome_extension.messages.SHOW_PAGE_ACTION === request) {
      chrome.pageAction.show(sender.tab.id);
    }
  };

  // Add a message listener
  chrome.extension.onRequest.addListener(onRequest);

}(this));
