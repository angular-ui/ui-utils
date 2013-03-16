basePath = '.';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/angular/angular.js',
  'components/*/*.js',
  'modules/*/*.js',
  'modules/*/test/*Spec.js'
];

// Avoid including minified version of angular and other libs again
exclude = [
  'components/*/*.min.js'
];

singleRun = true;

reporters = [
	'dots'
];