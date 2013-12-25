module.exports = function (grunt) {

  var initConfig;

  // Loading external tasks
  require('load-grunt-tasks')(grunt);

  /**
   * Custom task to inline a generated file at a certain moment...
   */
  grunt.registerTask('UGF', 'Use Generated Files.', function() {
    initConfig.meta.view.demoHTML= grunt.file.read(grunt.template.process("<%= dist %>/demos.html"));
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('build-doc', ['build', 'concat:html_doc', 'UGF', 'copy']);
  grunt.registerTask('server', ['karma:start']);
  grunt.registerTask('dist', ['concat:tmp', 'concat:modules', 'clean:rm_tmp', 'uglify', 'concat:html_doc', 'copy']);

  // HACK TO ACCESS TO THE COMPONENT-PUBLISHER
  function fakeTargetTask(prefix){
    return function(){

      if (this.args.length !== 1) return grunt.log.fail('Just give the name of the ' + prefix + ' you want like :\ngrunt ' + prefix + ':bower');

      var done = this.async();
      var spawn = require('child_process').spawn;
      spawn('./node_modules/.bin/gulp', [ prefix, '--branch='+this.args[0] ].concat(grunt.option.flags()), {
        cwd : './node_modules/component-publisher',
        stdio: 'inherit'
      }).on('close', done);
    };
  }

  grunt.registerTask('build', fakeTargetTask('build'));
  grunt.registerTask('publish', fakeTargetTask('publish'));
  //

  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  initConfig = {
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
        ''].join('\n'),
      view : {
        humaName : "UI Utils",
        repoName : "ui-utils",
        demoJS : grunt.file.read("demo/demo.js"),
        js : [
          'build/<%= meta.view.repoName %>.min.js'
        ]
      },
      destName : '<%= dist %>/build/<%= meta.view.repoName %>'
    },
    watch: {
      karma: {
        files: ['modules/**/*.js'],
        tasks: ['karma:unit:run'] //NOTE the :run flag
      }
    },
    karma: {
      unit: testConfig('test/karma.conf.js'),
      start: {configFile: 'test/karma.conf.js'}
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
      build: {
        files: {
          'dist/main/ui-utils.min.js': ['dist/main/ui-utils.js'],
          'dist/main/ui-utils-ieshiv.min.js': ['dist/main/ui-utils-ieshiv.js']
        }
      }
    },
    clean: {
      rm_tmp: {src: ['tmp']}
    },
    jshint: {
      files:['modules/**/*.js', 'gruntFile.js', 'test/**/*Spec.js', 'demo/**/*.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        globals: {}
      }
    },
    copy: {
      main: {
        files: [
          // UI.Include needs a external html source.
          {src: ['modules/include/demo/fragments.html'], dest: 'demo/fragments.html', filter: 'isFile'}
        ]
      }
    }
  };
  grunt.initConfig(initConfig);

};
