(function (window, document) {
  'use strict';
  var tags = [
      'ngInclude',
      'ngPluralize',
      'ngView',
      'ngSwitch',
      'uiCurrency',
      'uiCodemirror',
      'uiDate',
      'uiEvent',
      'uiKeypress',
      'uiKeyup',
      'uiKeydown',
      'uiMask',
      'uiMapInfoWindow',
      'uiMapMarker',
      'uiMapPolyline',
      'uiMapPolygon',
      'uiMapRectangle',
      'uiMapCircle',
      'uiMapGroundOverlay',
      'uiModal',
      'uiReset',
      'uiScrollfix',
      'uiSelect2',
      'uiShow',
      'uiHide',
      'uiToggle',
      'uiSortable',
      'uiTinymce'
    ];
  window.myCustomTags = window.myCustomTags || [];
  tags.push.apply(tags, window.myCustomTags);
  var toCustomElements = function (str) {
    var result = [];
    var dashed = str.replace(/([A-Z])/g, function ($1) {
        return ' ' + $1.toLowerCase();
      });
    var tokens = dashed.split(' ');
    if (tokens.length === 1) {
      var name = tokens[0];
      result.push(name);
      result.push('x-' + name);
      result.push('data-' + name);
    } else {
      var ns = tokens[0];
      var dirname = tokens.slice(1).join('-');
      result.push(ns + ':' + dirname);
      result.push(ns + '-' + dirname);
      result.push('x-' + ns + '-' + dirname);
      result.push('data-' + ns + '-' + dirname);
    }
    return result;
  };
  for (var i = 0, tlen = tags.length; i < tlen; i++) {
    var customElements = toCustomElements(tags[i]);
    for (var j = 0, clen = customElements.length; j < clen; j++) {
      var customElement = customElements[j];
      document.createElement(customElement);
    }
  }
}(window, document));