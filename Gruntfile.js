module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            build: ['build'],
            logs: ['logs/*']
        },
        concurrent: {
            dev: ['nodemon:app', 'webpack:dev'],
            options: {
                logConcurrentOutput: true
            }
        },
        nodemon: {
            app: {
                script: './start.js',
                options: {
                    ignore: ['build/**', 'bower_components/**/*', 'node_modules/**/*', 'logs/**', '*.ttl', '*.md'],
                    ext: 'js'
                }
            }
        },
        webpack: {
            build: require('./webpack.config').build,
            dev: require('./webpack.config').dev
        },
        uglify: {
            options: {
                mangle: false
            },
            myTarget: {
                files: {
                    'build/js/main.js': ['build/js/main.js']
                }
            }
        },
        cssmin : {
            compress : {
                files : {
                    'build/css/custom.css': ['assets/css/**/*.css']
                }
            }
        }
    });

    // libs
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // tasks
    grunt.registerTask('build', ['clean:build', 'cssmin', 'webpack:build', 'uglify']);
    grunt.registerTask('default', ['clean:build', 'cssmin', 'concurrent:dev']);
    grunt.registerTask('compress', ['uglify']);
    grunt.registerTask('style', ['cssmin']);
    grunt.registerTask('clogs', ['clean:logs']);
};
