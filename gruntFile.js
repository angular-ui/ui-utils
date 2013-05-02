module.exports = function (grunt) {

  // Loading external tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');

  grunt.loadTasks('./tasks/');


  // Default task.
  grunt.registerTask('build', ['x_concat', 'concat', 'clean:rm_tmp', 'uglify']);
  grunt.registerTask('default', [/*'jshint',*/ 'karma']);


  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, singleRun: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: ['dots'] };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };


  var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
  ''].join('\n');
  // Project configuration.
  grunt.initConfig({
    dist: 'build',
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      unit: testConfig('test/karma.conf.js')
    },
    x_concat: {
      util: {
        moduleName: "ui.utils",
        prefix: 'ui.',
        src: ['modules/*'],
        dest: 'modules/utils.js'
      }
    },
    concat: {
      make_tmp: {
        src: [ 'modules/**/*.js', '!modules/utils.js',  '!modules/ie-shiv/*.js', '!modules/**/test/*.js'],
        dest: 'tmp/dep.js'
      },
      modules: {
        options: {banner : banner},
        src: ['tmp/dep.js', 'modules/utils.js'],
        dest: '<%= dist %>/<%= pkg.name %>.js'
      },
      ieshiv: {
        options: {banner : banner},
        src: ['modules/ie-shiv/*.js'],
        dest: '<%= dist %>/<%= pkg.name %>-ieshiv.js'
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      build: {
        files: {
          '<%= dist %>/<%= pkg.name %>.min.js': ['<%= concat.modules.dest %>'],
          '<%= dist %>/<%= pkg.name %>-ieshiv.min.js': ['<%= concat.ieshiv.dest %>']
        }
      }
    },
    clean: {
      rm_tmp:{src: ['tmp']}
    },
    jshint: {
      files: ['modules/**/*.js', 'tasks/**/*.js'],
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
    }
  });

};