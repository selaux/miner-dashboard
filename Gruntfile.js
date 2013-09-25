'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            backend: {
                files: {
                    src: [
                        '**/*.js',
                        '!node_modules/**/*.js',
                        '!public/**/*.js'
                    ]
                },
                options: {
                    jshintrc: 'jshint.server.json'
                }
            },
            frontend: {
                files: {
                    src: [
                        'public/**/*.js',
                        '!public/javascripts/build/**/*.js',
                        '!public/javascripts/vendor/**/*.js'
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
            client: {
                options: {
                    partialsUseNamespace: true,
                    namespace: 'templates',
                },
                files: {
                    'public/javascripts/build/templates.js': [
                        'views/partials/contents.hbs'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
};