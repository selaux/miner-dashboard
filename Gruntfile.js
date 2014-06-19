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
                        '!frontend/javascripts/**/*.js'
                    ]
                },
                options: {
                    jshintrc: 'jshint.server.json'
                }
            },
            frontend: {
                files: {
                    src: [
                        'frontend/javascripts/**/*.js',
                        '!frontend/javascripts/vendor/**/*.js'
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
                    './test/mocha/setup.js',
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
        },

        copy: {
            images: {
                expand: true,
                cwd: 'frontend/images/',
                src: '**',
                dest: 'build/public/images/'
            }
        },

        browserify: {
            main: {
                files: {
                    'build/public/javascripts/main.js': [
                        'lib/views/**/*.js',
                        'frontend/javascripts/main.js'
                    ]
                },
                options: {
                    alias: [
                        'node_modules/jquery/dist/jquery.js:jquery',
                        'node_modules/lodash/dist/lodash.js:lodash',
                        'node_modules/backbone/backbone.js:backbone',
                        'node_modules/socket.io/node_modules/socket.io-client/lib/index.js:socket.io-client',
                        'frontend/javascripts/vendor/d3.js:d3',
                        'frontend/javascripts/vendor/rickshaw.js:rickshaw'
                    ].concat((function () {
                        var files = grunt.file.expand({ cwd: __dirname }, 'lib/views/**/*.js');
                        return files.map(function (file) {
                            return file + ':' + file.substr(0, file.lastIndexOf('.'));
                        });
                    }())),
                    noParse: [
                        'jquery',
                        'lodash',
                        'backbone'
                    ]
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('compile', ['handlebars', 'copy', 'browserify']);
    grunt.registerTask('test', ['jshint', 'mochaTest']);
};