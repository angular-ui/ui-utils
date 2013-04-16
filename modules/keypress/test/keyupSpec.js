describe('uiKeyup', function () {

  var $scope, $compile;

  var createKeyEvent = function (mainKey, alt, ctrl, shift) {
    var keyEvent = jQuery.Event("keyup");

    keyEvent.which = mainKey;
    keyEvent.keyCode = mainKey;
    keyEvent.altKey = alt;
    keyEvent.ctrlKey = ctrl;
    keyEvent.shiftKey = shift;

    return keyEvent;
  };

  var createElement = function (elementDef) {
    var elementStr = angular.isString(elementDef) ? elementDef : angular.toJson(elementDef);
    return $compile("<span ui-keyup='" + elementStr + "'></span>")($scope);
  };

  beforeEach(module('ui.keypress'));
  beforeEach(inject(function (_$rootScope_, _$compile_) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();

    $scope.cb = function (event) {
      this.event1 = event;
    };
  }));

  it('should support single key press', function () {
    createElement({'13': 'event=true'}).trigger(createKeyEvent(13));
    expect($scope.event).toBe(true);
  });

  it('should support combined key press', function () {
    createElement({'ctrl-shift-13': 'event=true'}).trigger(createKeyEvent(13, false, true, true));
    expect($scope.event).toBe(true);
  });
  
  it('should support alternative combinations', function () {
    $scope.event = 0;
    createElement({'ctrl-shift-14 ctrl-shift-13': 'event=event+1'}).trigger(createKeyEvent(13, false, true, true)).trigger(createKeyEvent(14, false, true, true));
    expect($scope.event).toBe(2);
  });

  it('should support multiple key press definitions', function () {
    var elm = createElement({'13': 'event1=true', 'ctrl-shift-13': 'event2=true'});

    elm.trigger(createKeyEvent(13));
    expect($scope.event1).toBe(true);

    elm.trigger(createKeyEvent(13, false, true, true));
    expect($scope.event2).toBe(true);
  });

  it('should support $event in expressions', function () {

    var element = createElement({'esc': 'cb($event)', '13': 'event2=$event'});

    element.trigger(createKeyEvent(27));
    expect($scope.event1.keyCode).toBe(27);

    element.trigger(createKeyEvent(13));
    expect($scope.event2.keyCode).toBe(13);
  });

  it('should support pressing a text character', function() {

    var elm = createElement({'a': 'event=true'}).trigger(createKeyEvent(65)); // 65 is IE/Mozilla key code for a
    expect($scope.event).toBe(true);
  });

  it('should support pressing a non-text keyboard character', function() {

    var elm = createElement({',': 'event=true'}).trigger(createKeyEvent(188)); // 188 is  IE/Mozilla key code for ,
    expect($scope.event).toBe(true);
  });

});