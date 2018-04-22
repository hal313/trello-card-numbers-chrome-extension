/* global $, _ */
(function (common) {
  'use strict';

  // Constants used in this file
  const CONSTANTS = {
    // Classes that are added by this extension
    classes: {
      decorated: 'js-tcnce-decorated-number',
      polling: 'js-tcnce-polling'
    },
    // Selectors used by this extension
    selectors: {
      composerClass: 'js-composer',
      listCardClass: 'list-card',
      titleElement: '.list-card-title.js-card-name',
      undecoratedCards: '.list-card.js-member-droppable.ui-droppable:not(.js-tcnce-decorated-number):not(.js-composer)'
    }
  };

  /**
   * Determines if an element has been decorated yet.
   * 
   * @param {jQuery} $element the jQuery element to check for decoration
   * @returns {boolean} true, if the element is decorated; false otherwise
   */
  var isDecorated = function isDecorated($element) {
    return !!$element.hasClass(CONSTANTS.classes.decorated);
  },
  /**
   * Marks an element as decorated
   * 
   * @param {jQuery} $element the jQuery element to mark as decorated
   * @returns {jQuery} $element for chaining
   */
  markDecorated = function setDecorated($element) {
    return $element.addClass(CONSTANTS.classes.decorated);
  },
  /**
   * Determines if the element is currently polling.
   * 
   * @param {jQuery} $element the element to look at 
   * @returns {boolean} true, if the element is decorated; false otherwise
   */
  isPolling = function isPolling($element) {
    return !!$element.hasClass(CONSTANTS.classes.polling);
  },
  /**
   * Marks an element as polling.
   * 
   * @param {jQuery} $element the card to mark as polling
   * @returns {jQuery} $element for chaining
   */
  markPolling = function markPolling($element) {
    return $element.addClass(CONSTANTS.classes.polling);
  },
  /**
   * Marks an element as no longer polling.
   * 
   * @param {jQuery} $element the card to remove the polling mark from
   * @returns {jQuery} $element for chaining
   */
  unmarkPolling = function unmarkPolling($element) {
    return $element.removeClass(CONSTANTS.classes.polling);
  },
  /**
   * Decorates a card. The ID of a card is specified in its "href" attribute, which *may* not be populated if the
   * card is newly added as a result of the user adding a new card. This function includes some retry logic to poll
   * for the "href" attribute before decorating the card.
   * 
   * @param {jQuery} $card the jQuery card element
   */
  decorateCard = function decorateCard($card) {
    // Sanity check: decorating a card multiple times will prepend the id to the title!
    if (!isDecorated($card)) {
      /**
       * Gets the ID from an href attribute value.
       * 
       * @param {string} href the href attribute value to parse
       * @returns {string} the ID specified in the element
       */
      var getId = function getId(href) {
          var parts = href.split('/');

          // Pull out the ID from the href attribute
          return parts[parts.length-1].split('-')[0];
        },
        /**
         * Gets the href attribute value from a jQuery element.
         * 
         * @param {jQuery} $element the element to get the "href" attribute value from
         * @returns {string} the "href" attribute value, or undefined if it does not exist
         */
        getHrefFrom$element = function getHrefFrom$element($element) {
          return _.get($element, '[0].href');
        },
        /**
         * Decorates the card by prepending the ID to the card title.
         * 
         * @param {jQuery} $cardElement the element to decorate
         */
        doDecorateCardElement = function doDecorateCardElement($cardElement) {
          // Pull out the ID from the href attribute
          
          var id = getId(getHrefFrom$element($cardElement)),
            // Get the element which has is title
            $titleElement = $cardElement.find(CONSTANTS.selectors.titleElement),
            // Get the original title
            title = $titleElement.html();
    
          // Update the title HTML (prepend the id)
          $titleElement.html('#' + id + ' ' + title);

          // Flag the card as being decorated
          markDecorated($cardElement);
        };

      // We can only decorate cards that have an "href" attribute
      if (!!getHrefFrom$element($card) && !isPolling($card)) {
        // Great, the card element has a "href" attribute - go ahead and decorate the card
        doDecorateCardElement($card);
      } else {
        // Doh! The card does not yet have an "href" attribute! We need to wait until the attribute shows up
        var pollIntervalMS = 50,
          pollIntervalMaxCount = 50;
  
        // Check to see if this added node is a candidate for polling
        //
        // It must be a list card (CONSTANTS.selectors.listCardClass)
        // It must not be in the composing phase (CONSTANTS.selectors.composerClass)
        // It must not be in the polling phase (!isPolling($card))
        if ($card.hasClass(CONSTANTS.selectors.listCardClass) && !$card.hasClass(CONSTANTS.selectors.composerClass) && !isPolling($card)) {
          // Mark the card as polling
          markPolling($card);

          // The ID is assigned on the server and appended to the element once the AJAX call returns; use a
          // polling interval to figure out when this occurs
          var intervalHandle = setInterval(function onInterval() {
            // Get the href attribute
            var href = getHrefFrom$element($card),
              /**
               * Stops the polling.
               */
              stopPolling = function stopPolling() {
                // Mark the card as not polling; eventually the AJAX call will return and
                // the "href" element will be populated; the next call to decorated cards
                // will decorate this card
                unmarkPolling($card);

                // Stop the interval
                clearInterval(intervalHandle);
              };

            // If there is an "href" attribute value 
            if (!!href) {
              // The "href" attribute has been set; decorate the card
              doDecorateCardElement($card);

              // Mark this element as no longer polling
              unmarkPolling($card);

              // Stop the polling
              stopPolling();
            }

            // Do not poll indefinitely!
            if (--pollIntervalMaxCount <= 0) {
              stopPolling();
            }
          }, pollIntervalMS);
        }
      }
    }
  },
  /**
   * Decorates all cards passed in.
   * 
   * @param {jQuery} $cards the jQuery card elements
   */
  decorateCards = function decorateCards() {
    // Find all cards which have not been decorated
    ($(CONSTANTS.selectors.undecoratedCards)).each(function invokeDecorateCard() {
      decorateCard($(this));
    });
  };
  
  // I believe that the way Chrome loads the extensions has changed; the previous version of the published
  // extension did not require execute() onload, but now this is required.
  window.onload = function onLoad() {
    // Invoked when the document is ready
    $(document).ready(function ready() {
      // Decorate all the cards immediately
      decorateCards();

      // Add a mutation observer which will be invoked whenever elements are added
      // We debounce the call to decorateCards() to be kind to the browser
      new MutationObserver(_.debounce(decorateCards, 125)).observe(this, { childList: true, characterData: false, attributes: false, subtree: true});
    });
    
    // Notify the background page to update the "page action" status
    chrome.extension.sendRequest(common.messages.SHOW_PAGE_ACTION);
  };

  // Invoke with the namespaced member from the global context
}(this.tcnce));
