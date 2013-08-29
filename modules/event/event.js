/**
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ui-event
 * Allows $event object and $params object to be passed
 *
 * @example <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * @example <input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 * @example <input ui-event="objectWithEvents">  // Somewhere in code (controller, directive...):
 *                                               // $scope.objectWithEvents = { myCustomEvent : 'myEventHandler($event, $params)'};
 *
 * @param ui-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
angular.module('ui.event',[]).directive('uiEvent', ['$parse',
  function ($parse) {
    return function ($scope, elm, attrs) {

      function registerEvents(events) {
        angular.forEach(events, function (uiEvent, eventName) {
          var fn = $parse(uiEvent);
          elm.bind(eventName, function (evt) {
            var params = Array.prototype.slice.call(arguments);
            //Take out first paramater (event object);
            params = params.splice(1);
            fn($scope, {$event: evt, $params: params});
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          });
        });
      }

      function unregisterEvents(events) {
        angular.forEach(events, function (uiEvent, eventName) {
          elm.unbind(eventName);
        });
      }

      var events = $scope.$eval(attrs.uiEvent);
      var expr = new RegExp('^[^{]');
      if (attrs.uiEvent && expr.test(attrs.uiEvent)) {
        $scope.$watch(attrs.uiEvent, function(newEvents, oldEvents) {
          if (oldEvents) {
            unregisterEvents(oldEvents);
          }
          if (newEvents) {
            registerEvents(newEvents);
          }
        });
        if (events) {
          registerEvents(events);
        }
      } else {
        registerEvents(events);
      }
    };
  }]);
