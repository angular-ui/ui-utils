/*describe('i18n', function() {
	'use strict';
	var uiI18n, element;
	beforeEach(function(){
		uiI18n = angular.module('ui.i18n');
		uiI18n.add(['en', 'en-us'],{
			groupPanel:{
				testingMerge: 'some text',
				otherText: 'some other group property text',
				description:'Drag a column header here and drop it to group by that column.'
			},
			example: 'I speak English',
			anotherExample: 'I speak A Different Language'
		});
		uiI18n.add('de',{
			groupPanel:{
				otherText: 'eine andere gruppe eigenschaft text',
				description:'Ziehen Sie eine Spaltenuberschrift hierhin um nach dieser Spalte zu gruppieren.'
			},
			example: 'Ich spreche Deutsch'
		});
		uiI18n.add('de',{
			groupPanel:{
				testingMerge: 'falaffels are spelled horribly...',
			},
			anotherExample: 'I speak A Different Language'
		});
		uiI18n.set('en-us');
	});

    it('should translate', function () {
	    inject(function ($rootScope, $compile) {
	        element = $compile('<p ui-t="groupPanel.otherText"></p>')($rootScope);
			console.log(element);
			expect(element.html()).toBe('some other group property text');
		});
	});
});
*/