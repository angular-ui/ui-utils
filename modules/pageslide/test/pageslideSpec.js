'use strict';

describe('Pageslide: ', function(){

    var $compile;
    var $rootScope;


    beforeEach(module('ui.pageslide'));

    beforeEach(inject(function(_$compile_,_$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;

    }));

    it('Should attach the pageslide panel to <body>', function(){
        // Create template DOM for directive
        var html = (
            '<a pageslide="right" ps-speed="0.5" href="#target">Link text</a>'
            + '<div id="target">'
            + '<p>some random content...</p>'
            + '<a id="target-close" href="#">Click to close</a>'
            + '</div>'
        );

        var elm = document.createElement('div');
        elm.innerHTML = html;
        document.body.appendChild(elm);


        // Compile DOM        
        var template = angular.element(elm);
        $compile(template)($rootScope);
        $rootScope.$digest();

        // Check for DOM Manipulation
        var el = document.querySelector('#ng-pageslide'); 
        var attached_to = el.parentNode.localName;

        expect(attached_to).toBe('body'); 

    });

});
