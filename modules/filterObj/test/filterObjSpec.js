describe('filterObj', function() {
  var formatFilter;

  beforeEach(module('ui.filterObj'));
  beforeEach(inject(function($filter) {
    formatFilter = $filter('filterObj');
  }));
});