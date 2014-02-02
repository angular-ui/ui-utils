/**
 * Created by Tim on 2/1/14.
 */
(function(){
    'use strict';
    var MISSING = '[MISSING]: ';
    var uiI18n = angular.module('ui.i18n', []);

    uiI18n.value('uiI18n.pack', {
        i18n: {},
        lang: null
    });
    var injector = angular.injector(['ng','ui.i18n']);
    var getPack = function(){
        return injector.get('uiI18n.pack');
    };
    var $root;
    uiI18n.i18n = {
        add: function(langs, strings){
            var pack = getPack();
            if (typeof(langs) === 'object'){
                angular.forEach(langs, function(lang){
                    if (lang){
                        var lower = lang.toLowerCase();
                        var combined = angular.extend(pack.i18n[lang] || {}, strings);
                        pack.i18n[lower] = combined;
                    }
                });
            } else {
                var lower = langs.toLowerCase();
                var combined = angular.extend(pack.i18n[langs] || {}, strings);
                pack.i18n[lower] = combined;
            }
            uiI18n.value('uiI18n.pack', pack);
        },
        set: function(lang){
            if (lang){
                var pack = getPack();
                pack.lang = lang;
                uiI18n.value('uiI18n.pack', pack);
                if ($root) $root.$broadcast('$uiI18n', lang);
            }
        }
    };

    uiI18n.directive('uiI18n',function() {
        return {
            link: function($scope, $elm, $attrs) {
                // check for watchable property
                var lang = $scope.$eval($attrs.uiI18n);
                if (lang){
                    $scope.$watch($attrs.uiI18n, uiI18n.i18n.set);
                } else {
                    // fall back to the string value
                    lang = $attrs.uiI18n;
                }
                uiI18n.i18n.set(lang);
            }
        };
    });

    var uitDirective = function($parse, pack) {
        return {
            restrict: 'EA',
            compile: function(){
                return function($scope, $elm, $attrs) {
                    // this is such a hack! I tried injector invoke $rootScope but its not the right one!
                    // TODO: make this not stupid...
                    if (!$root) $root = $scope.$root;
                    var token = $attrs.uiT || $attrs.uiTranslate || $elm.html();
                    var getter = $parse(token);
                    var missing = MISSING + token;

                    var listener = $scope.$on('$uiI18n', function(evt, lang){
                        // set text based on i18n current language
                        $elm.html(getter(pack.i18n[lang]) || missing);
                    });
                    $scope.$on('$destroy', listener);
                };
            }
        };
    };
    // directive syntax
    uiI18n.directive('uiT',['$parse', 'uiI18n.pack', uitDirective]);
    uiI18n.directive('uiTranslate',['$parse', 'uiI18n.pack', uitDirective]);

    var uitFilter = function($parse, pack) {
        return function(data) {
            var getter = $parse(data);
            // set text based on i18n current language
            return getter(pack.i18n[pack.lang]) || MISSING + data;
        };
    };
    // optional syntax
    uiI18n.filter('t', ['$parse', 'uiI18n.pack', uitFilter]);
    uiI18n.filter('translate', ['$parse', 'uiI18n.pack', uitFilter]);
})();