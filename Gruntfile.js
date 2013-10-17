'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            backend: {
                files: {
                    src: [
                        '**/*.js',
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
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
};