(function (global) {
  'use strict';

  // Set some constants (shared between the background page and the content script)
  global.tcnce = global.tcnce || {};
  global.tcnce.messages = global.tcnce.messages || {};
  global.tcnce.messages.SHOW_PAGE_ACTION = global.tcnce.messages.SHOW_PAGE_ACTION || 'SHOW_PAGE_ACTION';

})(this);