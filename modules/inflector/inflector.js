/**
 * Converts variable-esque naming conventions to something presentational, capitalized words separated by space.
 * @param {String} value The value to be parsed and prettified.
 * @param {String} [inflector] The inflector to use. Default: humanize.
 * @return {String}
 * @example {{ 'Here Is my_phoneNumber' | inflector:'humanize' }} => Here Is My Phone Number
 *          {{ 'Here Is my_phoneNumber' | inflector:'underscore' }} => here_is_my_phone_number
 *          {{ 'Here Is my_phoneNumber' | inflector:'variable' }} => hereIsMyPhoneNumber
 */
angular.module('ui.inflector',[]).filter('inflector', function () {
  'use strict';

  function tokenize(text) {
    text = text.replace(/([A-Z])|([\-|\_])/g, function(_, $1) { return ' ' + ($1 || ''); });
    return text.replace(/\s\s+/g, ' ').trim().toLowerCase().split(' ');
  }

  function capitalizeTokens(tokens) {
    var result = [];
    angular.forEach(tokens, function(token) {
      result.push(token.charAt(0).toUpperCase() + token.substr(1));
    });
    return result;
  }

  var inflectors = {
    humanize: function (value) {
      return capitalizeTokens(tokenize(value)).join(' ');
    },
    underscore: function (value) {
      return tokenize(value).join('_');
    },
    variable: function (value) {
      value = tokenize(value);
      value = value[0] + capitalizeTokens(value.slice(1)).join('');
      return value;
    }
  };

  return function (text, inflector) {
    if (inflector !== false && angular.isString(text)) {
      inflector = inflector || 'humanize';
      return inflectors[inflector](text);
    } else {
      return text;
    }
  };
});
