module.exports = function (grunt) {
    grunt.initConfig({
        clean: ['build'],
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
                    ignore: ['build/**'],
                    ext: 'js'
                }
            }
        },
        webpack: {
            dev: require('./webpack.config')
        }
    });

    // libs
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-webpack');

    // tasks
    grunt.registerTask('default', ['clean', 'concurrent:dev']);
};

