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
        },

        copy: {
            images: {
                expand: true,
                cwd: 'frontend/images/',
                src: '**',
                dest: 'build/public/images/'
            },
            stylesheets: {
                expand: true,
                cwd: 'frontend/stylesheets/',
                src: '*.css',
                dest: 'build/public/stylesheets/'
            }
        },

        browserify: {
            main: {
                files: {
                    'build/public/javascripts/main.js': [
                        'lib/Module.js',
                        'lib/views/*.js',
                        'lib/handlebars/**/*.js',
                        'build/compiledTemplates.js',
                        'frontend/javascripts/main.js'
                    ]
                },
                options: {
                    alias: [
                        'node_modules/jquery/dist/jquery.js:jquery',
                        'node_modules/lodash/dist/lodash.js:lodash',
                        'node_modules/backbone/backbone.js:backbone',
                        'node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js:socket.io-client'
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