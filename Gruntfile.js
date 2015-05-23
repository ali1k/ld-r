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
                    ignore: ['build/**', 'bower_components/**', 'npm_modules/**', '*.ttl', '*.md'],
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
        }
    });

    // libs
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // tasks
    grunt.registerTask('build', ['clean:build', 'webpack:build', 'uglify']);
    grunt.registerTask('default', ['clean:build', 'concurrent:dev']);
    grunt.registerTask('compress', ['uglify']);
    grunt.registerTask('clogs', ['clean:logs']);
};
