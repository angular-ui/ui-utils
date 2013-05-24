
$("#utils").hide();

requirejs(
  ['build/ui-utils.js'],
  function () {


    //angular.module('doc.ui-map', ['ui.utils', 'prettifyDirective']);

    e$ = $("#utils");
    e$.removeAttr("ng-non-bindable");

    angular.bootstrap(e$[0], ['ui.utils', 'prettifyDirective']);
    e$.show();
    //  $("#map-l").slideUp();

  });