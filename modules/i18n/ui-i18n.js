/**
 * ui-i18n Created by Tim Sweet on 2/1/14.
 * https://github.com/timothyswt
 * MIT License
 */
 /**
 * @ngdoc directive
 * @name ui-i18n
 * @requires $parse
 *
 * @description
 * Allows you to localize your project by being able to specify a language on any root-ish element
 * this can be a bindable property or the string.
 * if bound it will automatically update all children when update.
 * @example
 <example module="uiI18n">
 <file name="index.html">
     <body ng-controller="main" ui-i18n="language">

     </body>
 </file>
 </example>
 */

(function(deepExtend){
    'use strict';
    var MISSING = '[MISSING]: ',
        UPDATE_EVENT = '$uiI18n',
        FILTER_ALIASES = ['t', 'translate'],
        DIRECTIVE_ALIASES = ['uiT', 'uiTranslate'],
        LOCALE_DIRECTIVE_ALIAS = 'uiI18n',
        // default to english
        DEFAULT_LANG = 'en-US',
        langCache = {
            _langs: {},
            current: null
        },
        uiI18n = angular.module('ui.i18n', []);

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
            uiI18n.$root.$broadcast(UPDATE_EVENT, lang);
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

    var localeDirective = function() {
        return {
            compile: function(){
                return {
                    pre: function($scope, $elm, $attrs) {
                        var alias = LOCALE_DIRECTIVE_ALIAS;
                        if (!uiI18n.$root){
                            uiI18n.$root = $scope.$root;
                        }
                        // check for watchable property
                        var lang = $scope.$eval($attrs[alias]);
                        if (lang){
                            $scope.$watch($attrs[alias], uiI18n.set);
                        } else if ($attrs.$$observers){
                            $scope.$on('$destroy', $attrs.$observe(alias, uiI18n.set));
                        } else {
                            // fall back to the string value
                            lang = $attrs[alias];
                        }
                        uiI18n.set(lang || DEFAULT_LANG);
                    }
                };
            }
        };
    };
    uiI18n.directive(LOCALE_DIRECTIVE_ALIAS, localeDirective);
/**
 *  * @ngdoc directive
 * @name ui-t,ui-Translate
 * @requires $parse
 *
 * @description
 * specify the i18n string to use
 * this can be a bindable property, expression/partial expression, or the object token.
 * @example
<example module="uiI18n">
    <file name="index.html">
        <div ng-controller="main" ui-i18n="language">
            <div>
                <button ng-click="changeDesc()">change Desc</button>
                <span ui-t="groupPanel.{{desc}}"></span>
            </div>

            <p ui-t="example"></p>

            <p ui-t>groupPanel.testingMerge</p>

            <p ui-t>example</p>

            <p ui-t="invalid.translation.path"></p>

            <p ui-t>invalid.path</p>

            <p ui-t>invalid.translation.again</p>


            <h3>Using element:</h3>
            <ui-t>example</ui-t>
            <br/>
            <ui-translate>groupPanel.description</ui-translate>
            <br/>
            <ui-t>invalid.path</ui-t>
            <br/>
            <ui-t>invalid.translation.again</ui-t>

            <h3>Using Translate Filters:</h3>

            <p>{{"groupPanel.description" | t}}</p>

            <p>{{"example" | t}}</p>
            <p>{{"invalid.path" | t}}</p>

            <p>{{"invalid.translation.again" | translate}}</p>
        </div>
    </file>
    <file name="script.js">
    var app = angular.module('app', ['ui.i18n']);

    app.controller('main', ['$scope', function($scope){
        $scope.language = "en";
        $scope.hello = "ui-i18n Example";
        $scope.desc = "description";
        $scope.changeLanguage = function(){
          $scope.language = $scope.language == "de" ? "en" : "de";
        };
        $scope.changeDesc = function(){
          $scope.desc = $scope.desc == "description" ? "otherText" : "description";
        };
    }]);
    //Declare your i18n strings, this is enclosed in order to show that this can be done anywhere in the application
     (function(){
        var uiI18n = angular.module('ui.i18n');
        uiI18n.add(["en", "en-us"],{
            groupPanel:{
            testingMerge: 'some text',
            otherText: 'some other group property text',
            description:'Drag a column header here and drop it to group by that column.'
        },
        example: "I speak English",
        anotherExample: "I speak A Different Language"
        });
     })();

     (function(){
        var uiI18n = angular.module('ui.i18n');
        uiI18n.add("de",{
            groupPanel:{
                otherText: 'eine andere gruppe eigenschaft text',
                description:'Ziehen Sie eine Spaltenüberschrift hierhin um nach dieser Spalte zu gruppieren.'
            },
            example: "Ich spreche Deutsch"
        });
     })();

     (function(){
        var uiI18n = angular.module('ui.i18n');
        uiI18n.add("de",{
            groupPanel:{
                testingMerge: 'falaffels are spelled horribly...',
            },
            anotherExample: "I speak A Different Language"
        });
     })();
    </file>
</example>
 **/
    // directive syntax
    var uitDirective = function($parse) {
        return {
            restrict: 'EA',
            compile: function(){
                return {
                    pre: function($scope, $elm, $attrs) {
                        if (!uiI18n.$root){
                            uiI18n.$root = $scope.$root;
                        }
                        var alias1 = DIRECTIVE_ALIASES[0],
                            alias2 = DIRECTIVE_ALIASES[1];
                        var token = $attrs[alias1] || $attrs[alias2] || $elm.html();
                        var missing = MISSING + token;
                        var observer;
                        if ($attrs.$$observers){
                            var prop = $attrs[alias1] ? alias1 : alias2;
                            observer = $attrs.$observe(prop, function(result){
                                if (result){
                                    $elm.html($parse(result)(langCache.getCurrent()) || missing);
                                }
                            });
                        }
                        var getter = $parse(token);
                        var listener = $scope.$on(UPDATE_EVENT, function(evt, lang){
                            if (observer){
                                observer($attrs[alias1] || $attrs[alias2]);
                            } else {
                                // set text based on i18n current language
                                $elm.html(getter(langCache.get(lang)) || missing);
                            }
                        });
                        $scope.$on('$destroy', listener);
                    }
                };
            }
        };
    };

    // optional filter syntax
    var uitFilter = function($parse) {
        return function(data) {
            var getter = $parse(data);
            // set text based on i18n current language
            return getter(langCache.getCurrent()) || MISSING + data;
        };
    };

    angular.forEach(DIRECTIVE_ALIASES, function(alias){
        uiI18n.directive(alias,['$parse', uitDirective]);
    });
    angular.forEach(FILTER_ALIASES, function(alias){
        uiI18n.filter(alias,['$parse', uitFilter]);
    });
    uiI18n.service('$i18nService', function(){
        var uii18nService = {
            getCache: function(){
                return uiI18n._cache;
            },
            $broadcast: function(){
                uiI18n.$broadcast(arguments);
            },
            add: function(langs, strings){
                uiI18n.add(langs, strings);
            },
            set: function(lang){
                uiI18n.set(lang);
            }
        };
        return uii18nService;
    });
})(function deepExtend(destination, source) {
    'use strict';
    // adding deep copy method until angularjs supports deep copy like everyone else.
    // https://github.com/angular/angular.js/pull/5059
    for (var property in source) {
        if (source[property] && source[property].constructor &&
            source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            deepExtend(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
});