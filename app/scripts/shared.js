(function (global) {
  'use strict';

  // Set some constants (shared between the background page and the content script)
  global.trello_card_numbers_chrome_extension = global.trello_card_numbers_chrome_extension || {};
  global.trello_card_numbers_chrome_extension.messages = global.trello_card_numbers_chrome_extension.messages || {};
  global.trello_card_numbers_chrome_extension.messages.SHOW_PAGE_ACTION = global.trello_card_numbers_chrome_extension.messages.SHOW_PAGE_ACTION || 'SHOW_PAGE_ACTION';

})(this);