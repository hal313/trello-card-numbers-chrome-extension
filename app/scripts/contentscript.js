/* global $, _ */

(function() {
  'use strict';

  // TODO: Use constants for selectors

  var decorateAllCards = function decorateAllCards() {
    decorateCards($('.list-card'));
  };

  var decorateCards = function decorateCards($cards) {
    $cards.each(function() {
      decorateCard($(this));
    });
  };

  var decorateCard = function decorateCard($card) {
    decorateIDElement($card.find('.card-short-id'));
  };

  var decorateIDElement = function decorateIDElement($idElement) {
    $idElement
      // Remove the 'hide' class
      .removeClass("hide")
      // Add the styling
      // TODO: Use a style sheet?
      .css("padding-right", ".5em")
      // Add a marker class (to indicate that the class has been decorated)
      .addClass('js-decorated')
    ;
  };

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
                  }
                  ;

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

      })
    ;

    // Append the mutation observer
    cardsRoot.each(function appendMutationObserver() {
      mutationObserver.observe(this, mutationObserverConfiguration);
    });

  });

}());
