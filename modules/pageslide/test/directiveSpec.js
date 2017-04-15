'use strict';

describe('ng-pageslide: ', function(){

    var $compile;
    var $rootScope;


    beforeEach(module('pageslide-directive'));

    beforeEach(inject(function(_$compile_,_$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    afterEach(function(){
        document.querySelector('#ng-pageslide').remove();
        document.querySelector('#ng-pageslide-test').remove();
    });

    it('Should attach the pageslide panel to <body>', inject(function(_$rootScope_){
        $rootScope = _$rootScope_;
        $rootScope.is_open = false;

        // Create template DOM for directive
        var html = (
            '<div id="ng-pageslide-test">'
            + '<a pageslide="right" ps-open="is_open" ps-speed="0.5" href="#target">Link text</a>'
            + '<div id="target">'
            + '<p>some random content...</p>'
            + '<a id="target-close" href="#">Click to close</a>'
            + '</div>'
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

    }));
    /*
    it('Should respond to pageslide.open and pageslide.close event', function(){
       // Implement 
       
    });
*/
    it('Should watch for ps-open', inject(function(_$rootScope_){
        $rootScope = _$rootScope_;
        $rootScope.is_open = true;
        $rootScope.$digest();

        // Create template DOM for directive
        var html = (
            '<div id="ng-pageslide-test">'
            + '<a pageslide="right" ps-open="is_open" ps-speed="0.5" href="#target">Link text</a>'
            + '<div id="target">'
            + '<p>some random content...</p>'
            + '<a id="target-close" href="#">Click to close</a>'
            + '</div>'
            + '</div>'
        );

        var elm = document.createElement('div');
        elm.innerHTML = html;
        document.body.appendChild(elm);

        // Compile DOM        
        var template = angular.element(elm);
        $compile(template)($rootScope);
        $rootScope.$digest();
        

        var w = document.querySelector('#ng-pageslide').style.width;
        console.log(w);
        expect(w).toBe('300px');
    }));

});
