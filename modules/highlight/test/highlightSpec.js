describe('highlight', function () {
  'use strict';

  var highlightFilter, sce, testPhrase = 'Prefix Highlight Suffix';

  beforeEach(module('ui.highlight'));
  beforeEach(inject(function ($filter, $sce) {
    highlightFilter = $filter('highlight');
    sce = $sce;
  }));
  describe('case insensitive', function () {
    it('should highlight a matching phrase', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, 'highlight'))).toEqual('Prefix <span class="ui-match">Highlight</span> Suffix');
    });
    it('should highlight nothing if no match found', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, 'no match'))).toEqual(testPhrase);
    });
    it('should highlight nothing for the undefined filter', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, undefined))).toEqual(testPhrase);
    });
    it('should work correctly for number filters', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter('3210123', 0))).toEqual('321<span class="ui-match">0</span>123');
    });
    it('should work correctly for number text', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(3210123, '0'))).toEqual('321<span class="ui-match">0</span>123');
    });
  });
  describe('case sensitive', function () {
    it('should highlight a matching phrase', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, 'Highlight', true))).toEqual('Prefix <span class="ui-match">Highlight</span> Suffix');
    });
    it('should highlight nothing if no match found', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, 'no match', true))).toEqual(testPhrase);
    });
    it('should highlight nothing for the undefined filter', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, undefined, true))).toEqual(testPhrase);
    });
    it('should work correctly for number filters', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter('3210123', 0, true))).toEqual('321<span class="ui-match">0</span>123');
    });
    it('should work correctly for number text', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(3210123, '0', true))).toEqual('321<span class="ui-match">0</span>123');
    });
    it('should not highlight a phrase with different letter-casing', function () {
      expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, 'highlight', true))).toEqual(testPhrase);
    });
  });
  it('should highlight nothing if empty filter string passed - issue #114', function () {
    expect(sce.getTrusted(sce.HTML, highlightFilter(testPhrase, ''))).toEqual(testPhrase);
  });
});
