Package.describe({
  name: 'angularui:ui-utils',
  version: '0.2.3',
  summary: 'Angular-ui-utils package for meteor.',
  git: 'https://github.com/angular-ui/ui-utils.git',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@0.9.0.1');

  api.use('urigo:angular@0.8.4', 'client');

  api.addFiles('dist/main/ui-utils.js', 'client');
});
