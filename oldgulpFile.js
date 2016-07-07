(function() {
    'use strict';
    
    var gulp = require('gulp');
    var nodemon = require('gulp-nodemon');
    var watch = require('gulp-watch');
    var jshint = require('gulp-jshint');
    var livereload = require('gulp-livereload');
    var _paths = [
        'server/**/*.js',
        'client/**/*.js'
    ];
    
    gulp.task('nodemon', function() {
        nodemon({
            script: 'server/app.js',
            env: {
                'NODE_ENV': 'development',
            }
        })
            .on('restart');
    });
    
    gulp.task('watch', function() {
        livereload.listen();
        gulp
            .src(_paths, {
            read: false
            })
            .pipe(watch(_paths, {
                emit: 'all'
            }))
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
        watch(_paths, livereload.changed);
    });
    
    gulp.task('lint', function() {
        gulp
            .src(_paths)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
    });
    
    gulp.task('default', [
        'lint',
        'nodemon',
        'watch'
    ]);
}());
