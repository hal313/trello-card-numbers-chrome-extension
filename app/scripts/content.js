/* global $, _ */
(function (global) {
  'use strict';

  /**
   * Decorates an ID element with some styles.
   * 
   * @param {jQuery} $idElement the jQuery ID element to decorate
   */
  var decorateIDElement = function decorateIDElement($idElement) {
    $idElement
      // Remove the 'hide' class
      .removeClass('hide')
      // Add the styling
      .css('padding-right', '.5em')
      // Add a marker class (to indicate that the class has been decorated)
      .addClass('js-decorated');
  },
  /**
   * Decorates a card.
   * 
   * @param {jQuery} $card the jQuery card element
   */
  decorateCard = function decorateCard($card) {
    decorateIDElement($card.find('.card-short-id'));
  },
  /**
   * Decorates all cards passed in.
   * 
   * @param {jQuery} $cards the jQuery card elements
   */
  decorateCards = function decorateCards($cards) {
    $cards.each(function() {
      decorateCard($(this));
    });
  },
  /**
   * Decorates all the cards in the DOM.
   */
  decorateAllCards = function decorateAllCards() {
    decorateCards($('.list-card'));
  },
  /**
   * Executes the extension.
   */
  execute = function execute() {

    // Invoked when the document is ready
    $(document).ready(function ready() {
      // Decorate all the cards
      decorateAllCards();
  
      var $cardsRoot = $('#content'),
        mutationObserverConfiguration = { childList: true, characterData: false, attributes: false, subtree: true},
        mutationObserver = new MutationObserver(function mutationObserverCallback(mutationRecords) {
          // Iterate through all the mutation records
          _.forEach(mutationRecords, function(mutationRecord) {
            // Iterate through all the added nodes for each mutation record
            _.forEach(mutationRecord.addedNodes, function (addedNode) {
              var $addedNode = $(addedNode),
                addedNodeElement = $addedNode.find('.list-card-title.js-card-name')[0],
                pollIntervalMS = 50,
                pollIntervalMaxCount = 50
                ;
  
              // Check to see if this added node is a candidate for decorating
              //
              // It must be a list card (list-card)
              // It cannot be in the composing phase (js-composer)
              // It cannot be decorated already (js-decorated)
              if ($addedNode.hasClass('list-card') && !$addedNode.hasClass('js-composer') && !$addedNode.hasClass('js-decorated')) {
                // The ID is assigned on the server and appended to the element once the AJAX call returns; use an
                // polling interval to figure out when this is
                var intervalHandle = setInterval(function() {
                  var href = addedNodeElement ? addedNodeElement.href : undefined,
                    parts,
                    id,
                    stopPolling = function stopPolling() {
                      clearInterval(intervalHandle);
                    };
  
                  if (href) {
                    // The 'href' attribute has been set; figure out the ID
                    parts = href.split('/');
                    id = parts[parts.length-1].split('-')[0];
  
                    // Decorate the element
                    decorateIDElement($addedNode.find('.card-short-id').html('#' + id));
  
                    // Stop the polling
                    stopPolling();
                  }
  
                  // Sanity check to not poll indefinitely
                  if (--pollIntervalMaxCount <= 0) {
                    stopPolling();
                  }
  
                }, pollIntervalMS);
              }
            });
          });
  
        });
  
      // Append the mutation observer
      $cardsRoot.each(function appendMutationObserver() {
        mutationObserver.observe(this, mutationObserverConfiguration);
      });
  
    });

  };

  // I believe that the way Chrome loads the extensions has changed; the previous version of the published
  // extension did not require execute() onload, but now this is required.
  window.onload = function onLoad() {
    execute();

    // Let the background page update the "page action" status
    chrome.extension.sendRequest(global.trello_card_numbers_chrome_extension.messages.SHOW_PAGE_ACTION);
  };

}(this));
