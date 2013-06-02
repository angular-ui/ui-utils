module.exports = function (grunt) {

  // Loading external tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:unit']);
  grunt.registerTask('build', ['concat:tmp', 'concat:modules', 'clean:rm_tmp', 'uglify']);
  grunt.registerTask('build-doc', ['build', 'concat:html_doc', 'copy']);
  grunt.registerTask('server', ['karma:start']);


  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox', 'PhantomJS'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    dist : 'components/angular-ui-docs',
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
        repoName : "ui-utils"
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
          '<script>requirejs(["core/demo.js"]);</script>',
          '<div id="utils" ng-non-bindable>'
        ].join('\n'),
        footer : '</div>'},
        src: [ 'modules/**/demo/index.html'],
        dest: '<%= dist %>/demos.html'
      },
      tmp: {
        files: {  'tmp/dep.js': [ 'modules/**/*.js', '!modules/utils.js', '!modules/ie-shiv/*.js', '!modules/**/test/*.js']}
      },
      modules: {
        options: {banner: '<%= meta.banner %>'},
        files: {
          '<%= meta.destName %>.js': ['tmp/dep.js', 'modules/utils.js'],
          '<%= meta.destName %>-ieshiv.js' : ['modules/ie-shiv/*.js']
        }
      }
    },
    uglify: {
      options: {banner: '<%= meta.banner %>'},
      build: {
        files: {
          '<%= meta.destName %>.min.js': ['<%= meta.destName %>.js'],
          '<%= meta.destName %>-ieshiv.min.js': ['<%= meta.destName %>-ieshiv.js']
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
          {src: ['demo/demo.js'], dest: '<%= dist %>/core/demo.js', filter: 'isFile'}
        ]
      },
      template : {
        options : {processContent : function(content){
          return grunt.template.process(content);
        }},
        files: [
          {src: ['<%= dist %>/.tmpl/index.tmpl'], dest: '<%= dist %>/index.html'}
        ]
      }
    }
  });

};