module.exports = function (grunt) {
    // Loading external tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        dist: 'build',
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            karma: {
                files: ['modules/*/*.js', 'modules/*/test/*Spec.js'],
                tasks: ['karma:unitBackground:run'] //NOTE the :run flag
            }
        },
        karma: {
            options: {
                configFile: 'test.conf.js',
                browsers: ['Chrome', 'Firefox']
            },

            unit: {
                singleRun: true
            },

            unitBackground: {
                background: true
            }
        },
        concat: {
            modules: {
                src: ['<banner:meta.banner>', 'modules/**/*.js', '!modules/ie-shiv/*.js', '!modules/**/test/*.js'],
                dest: '<%= dist %>/<%= pkg.name %>.js'
            },
            ieshiv: {
                src: ['<banner:meta.banner>', 'modules/ie-shiv/*.js'],
                dest: '<%= dist %>/<%= pkg.name %>-ieshiv.js'
            }
        },
        uglify: {
            options: {
                banner: ['/**',
                ' * <%= pkg.description %>',
                ' * @version v<%= pkg.version %> - ',
                '<%= grunt.template.today("yyyy-mm-dd") %>',
                ' * @link <%= pkg.homepage %>',
                ' * @license MIT License, http://www.opensource.org/licenses/MIT',
                ' */'].join('\n')
            },
            build: {
                files: {
                    '<%= dist %>/<%= pkg.name %>.min.js': ['<%= concat.modules.dest %>'],
                    '<%= dist %>/<%= pkg.name %>-ieshiv.min.js': ['<%= concat.ieshiv.dest %>']
                }
            }
        },
        clean: {
            build: {
                src: ['build/*'],
                filter: 'isFile'
            }
        },
    });

    // Default task.
    grunt.registerTask('build', ['concat', 'uglify'])
    grunt.registerTask('default', ['karma:unit', 'build']);

};