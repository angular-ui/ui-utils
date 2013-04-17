basePath = '.';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/jquery/jquery.js',
  'components/angular/angular.js',
  'components/angular-mocks/angular-mocks.js',
  'modules/*/*.js',
  'modules/*/test/*Spec.js'
];

singleRun = true;

reporters = [
	'dots'
];