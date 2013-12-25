/**
 * Executes an event after an 'intended hover'.
 * The delay can be optionally specified
 * Example
 * <div ui-hoverintent="menu.open = true" ui-hoverintent-delay="1000" ui-hoverintent-resetonclick></div>
 *
 * @param {function} uiHoverintent - The event handler function.
 * @param {int} [uiHoverintentDelay=500] - The intent delay in ms
 * @param {boolean} [uiHoverintentResetonclick] - Reset the intent delay timer, when the element is clicked
 */
angular.module('ui.hoverintent', [])
  .directive('uiHoverintent', ['$timeout', function($timeout){
    return {
      restrict: 'A',
      link: function(scope, element, attributes){
        var hoverIntentPromise;

        element.bind('mouseenter', triggerDelayedEvent);
        element.bind('mouseleave', cancelDelayedEvent);
        if(attributes.hasOwnProperty('uiHoverintentResetonclick')){
          element.bind('click', triggerDelayedEvent);
        }

        /**
         * Triggers the eventHandler after the specified delay, or the default delay.
         * Cancels the existing pending trigger (if any).
         */
        function triggerDelayedEvent(event){
          cancelDelayedEvent();

          var delay = scope.$eval(attributes.uiHoverintentDelay);
          if(delay === undefined){
            delay = 500;
          }

          hoverIntentPromise = $timeout(function(){
            scope.$eval(attributes.uiHoverintent, { $event: event });
          }, delay);
        }

        /**
         * Cancels the triggering the event.
         */
        function cancelDelayedEvent(){
          $timeout.cancel(hoverIntentPromise);
        }
      }
    };
  }]);


