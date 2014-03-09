'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            backend: {
                files: {
                    src: [
                        '**/*.js',
                        '!build/**/*.js',
                        '!node_modules/**/*.js',
                        '!frontend/public/**/*.js'
                    ]
                },
                options: {
                    jshintrc: 'jshint.server.json'
                }
            },
            frontend: {
                files: {
                    src: [
                        'frontend/public/**/*.js',
                        '!frontend/public/javascripts/vendor/**/*.js'
                    ]
                },
                options: {
                    jshintrc: 'jshint.client.json'
                }
            }
        },

        mochaTest: {
            unit: {
                options: {
                    reporter: 'spec',
                    ui: 'bdd'
                },

                src: [
                    'test/specs/**/*.js'
                ]
            }
        },

        handlebars: {
            compile: {
                options: {
                    commonjs: true,
                    namespace: false,
                    processName: function (path) {
                        var filename = path.split('/')[1];
                        return filename.substr(0, filename.length-4);
                    }
                },
                files: {
                    'build/compiledTemplates.js': 'templates/*.hbs'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('compile', ['handlebars']);
    grunt.registerTask('test', ['jshint', 'mochaTest']);
};