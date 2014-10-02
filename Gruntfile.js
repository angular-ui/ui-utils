'use strict';

module.exports = function (grunt) {

  // Loading external tasks
  require('load-grunt-tasks')(grunt);

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('serve', [ 'karma:continuous', 'dist:main', 'dist:demo', 'build:gh-pages', 'connect:continuous', 'watch']);

  grunt.registerTask('dist', ['dist:main', 'dist:sub', 'dist:demo']);
  grunt.registerTask('dist:main', ['concat:tmp', 'concat:modules', 'clean:rm_tmp', 'uglify:main']);
  grunt.registerTask('dist:sub', ['ngmin', 'uglify:sub']);
  grunt.registerTask('dist:demo', ['concat:html_doc', 'copy']);


  // HACK TO ACCESS TO THE COMPONENT-PUBLISHER
  function fakeTargetTask(prefix){
    return function(){

      if (this.args.length !== 1) return grunt.log.fail('Just give the name of the ' + prefix + ' you want like :\ngrunt ' + prefix + ':bower');

      var done = this.async();
      var spawn = require('child_process').spawn;
      spawn('./node_modules/.bin/gulp', [ prefix, '--branch='+this.args[0] ].concat(grunt.option.flags()), {
        cwd : './node_modules/angular-ui-publisher',
        stdio: 'inherit'
      }).on('close', done);
    };
  }

  grunt.registerTask('build', fakeTargetTask('build'));
  grunt.registerTask('publish', fakeTargetTask('publish'));
  //


  // HACK TO LIST ALL THE MODULE NAMES
  var moduleNames = grunt.file.expand({ cwd: 'modules' }, ['*','!utils.js']);
  function ngMinModulesConfig(memo, moduleName){

     memo[moduleName]= {
      expand: true,
      cwd: 'modules/' + moduleName,
      src: ['*.js'],
      dest: 'dist/sub/' + moduleName
    };

    return memo;
  }
  //


  // HACK TO MAKE TRAVIS WORK
  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };
  //


  // Project configuration.
  grunt.initConfig({
    bower: 'bower_components',
    dist : '<%= bower %>/angular-ui-docs',
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join('\n')
    },

    watch: {

      src: {
        files: ['modules/**/*.js', '!modules/**/test/*Spec.js', 'demo/**/*.js'],
        tasks: ['jshint:src', 'karma:unit:run', 'dist:main', 'dist:demo', 'build:gh-pages']
      },
      test: {
        files: ['modules/**/test/*Spec.js'],
        tasks: ['jshint:test', 'karma:unit:run']
      },
      demo: {
        files: ['modules/**/demo/*'],
        tasks: ['jshint:src', 'dist:demo', 'build:gh-pages']
      },
      livereload: {
        files: ['out/built/gh-pages/**/*'],
        options: { livereload: true }
      }
    },

    connect: {
      options: {
        base : 'out/built/gh-pages',
        open: true,
        livereload: true
      },
      server: { options: { keepalive: true } },
      continuous: { options: { keepalive: false } }
    },

    karma: {
      unit: testConfig('test/karma.conf.js'),
      server: {configFile: 'test/karma.conf.js'},
      continuous: {configFile: 'test/karma.conf.js',  background: true }
    },

    concat: {
      html_doc: {
        options: {
          banner: ['<!-- Le content - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
            '================================================== -->',
            '<div id="utils" ng-app="doc.ui-utils">', ''
          ].join('\n  '),
          footer : '</div>'},
        src: [ 'modules/**/demo/index.html'],
        dest: 'demo/demos.html'
      },
      tmp: {
        files: {  'tmp/dep.js': [ 'modules/**/*.js', '!modules/utils.js', '!modules/ie-shiv/*.js', '!modules/**/test/*.js']}
      },
      modules: {
        options: {banner: '<%= meta.banner %>'},
        files: {
          'dist/main/ui-utils.js': ['tmp/dep.js', 'modules/utils.js'],
          'dist/main/ui-utils-ieshiv.js' : ['modules/ie-shiv/*.js']
        }
      }
    },
    uglify: {
      options: {banner: '<%= meta.banner %>'},
      main: {
        files: {
          'dist/main/ui-utils.min.js': ['dist/main/ui-utils.js'],
          'dist/main/ui-utils-ieshiv.min.js': ['dist/main/ui-utils-ieshiv.js']
        }
      },
      sub: {
        expand: true,
        cwd: 'dist/sub/',
        src: ['**/*.js'],
        ext: '.min.js',
        dest: 'dist/sub/'
      }
    },
    clean: {
      rm_tmp: {src: ['tmp']}
    },
    jshint: {
      src: {
        files:{ src : ['modules/**/*.js', '!modules/**/test/*Spec.js','demo/**/*.js'] },
        options: { jshintrc: '.jshintrc' }
      },
      test: {
        files:{ src : [ 'modules/**/test/*Spec.js', 'gruntFile.js'] },
        options: grunt.util._.extend({}, grunt.file.readJSON('.jshintrc'), {
          node: true,
          globals: {
            angular: false,
            inject: false,
            jQuery: false,

            jasmine: false,
            afterEach: false,
            beforeEach: false,
            ddescribe: false,
            describe: false,
            expect: false,
            iit: false,
            it: false,
            spyOn: false,
            xdescribe: false,
            xit: false
          }
        })
      }
    },
    copy: {
      main: {
        files: [
          // UI.Include needs a external html source.
          {src: ['modules/include/demo/fragments.html'], dest: 'demo/fragments.html', filter: 'isFile'}
        ]
      }
    },

    ngmin: moduleNames.reduce(ngMinModulesConfig, {}),
    changelog: { options: { dest: 'CHANGELOG.md' } }
  });

};
