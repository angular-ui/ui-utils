/**
 * Created by Tim on 2/1/14.
 */
(function(){
    'use strict'
    // adding deep copy method until angularjs supports deep copy like everyone else.
    // https://github.com/angular/angular.js/pull/5059
    function deepExtend(destination, source) {
        for (var property in source) {
            if (source[property] && source[property].constructor &&
                source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                arguments.callee(destination[property], source[property]); // jshint ignore:line
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    }
    'use strict';
    var MISSING = '[MISSING]: ';
    var uiI18n = angular.module('ui.i18n', []);

    var langCache = {
        _langs: {},
        current: null
    };
    langCache.get = function(lang){
        return langCache._langs[lang.toLowerCase()];
    };
    langCache.add = function(lang, strings){
        var lower = lang.toLowerCase();
        var cache = langCache._langs;
        cache[lower] = deepExtend(cache[lower] || {}, strings);
    };
    langCache.setCurrent = function(lang){
        langCache.current = lang.toLowerCase();
    };
    langCache.getCurrent = function(){
        return langCache.get(langCache.current);
    };

    uiI18n._cache = langCache;
    uiI18n.$broadcast = function(lang){
        if (lang && this.$root){
            uiI18n.$root.$broadcast('$uiI18n', lang);
        }
    };
    uiI18n.add =  function(langs, strings){
        if (typeof(langs) === 'object'){
            angular.forEach(langs, function(lang){
                if (lang){
                    langCache.add(lang, strings);
                }
            });
        } else {
            langCache.add(langs, strings);
        }
    };
    uiI18n.set = function(lang){
        if (lang){
            langCache.setCurrent(lang);
            uiI18n.$broadcast(lang);
        }
    };

    uiI18n.directive('uiI18n',function() {
        return {
            link: function($scope, $elm, $attrs) {
                if (!uiI18n.$root) uiI18n.$root = $scope.$root;
                // check for watchable property
                var lang = $scope.$eval($attrs.uiI18n);
                if (lang){
                    $scope.$watch($attrs.uiI18n, uiI18n.set);
                } else {
                    // fall back to the string value
                    lang = $attrs.uiI18n;
                }
                uiI18n.set(lang);
            }
        };
    });

    // directive syntax
    var uitDirective = function($parse) {
        return {
            restrict: 'EA',
            compile: function(){
                return function($scope, $elm, $attrs) {
                    if (!uiI18n.$root) uiI18n.$root = $scope.$root;
                    var token = $attrs.uiT || $attrs.uiTranslate || $elm.html();
                    var getter = $parse(token);
                    var missing = MISSING + token;

                    var listener = $scope.$on('$uiI18n', function(evt, lang){
                        // set text based on i18n current language
                        $elm.html(getter(langCache.get(lang)) || missing);
                    });
                    $scope.$on('$destroy', listener);
                };
            }
        };
    };
    uiI18n.directive('uiT',['$parse', uitDirective]);
    uiI18n.directive('uiTranslate',['$parse', uitDirective]);

    // optional filter syntax
    var uitFilter = function($parse) {
        return function(data) {
            var getter = $parse(data);
            // set text based on i18n current language
            return getter(langCache.getCurrent()) || MISSING + data;
        };
    };
    uiI18n.filter('t', ['$parse', uitFilter]);
    uiI18n.filter('translate', ['$parse', uitFilter]);
})();