/** 
*   IMPORTS
*/

var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    gp_babel = require('gulp-babel'),
    del = require('del'),
    runSequence = require('run-sequence');

/**
*   TASKS
*/

// Concat files | Minify
gulp.task('minicat', function() {
    return gulp.src(['js/resources.js', 'js/menus.js', 'js/levels.js', 'js/models.js', 'js/app.js', 'js/engine.js'])
        .pipe(gp_babel({presets: ['es2015-script']}))
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('app.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
});

// Remove all files from dist directory
gulp.task('clean-dist-concat', function() {
    return del([
        'dist/*.js'
    ]);
});

// Remove concat.js after minicat runs
gulp.task('clean-dist-concat', function() {
    return del([
        'dist/concat.js'
    ]);
});

/*
*   CONCATENATION + MINIFICATION SEQUENCE ['minicat', 'clean-dist-concat']
*   Use to create distribution app.min.js file
*/
gulp.task('minicat-seq', function(done) {
    runSequence('minicat', 'clean-dist-concat', function() {
        done();
    });
});

// Runs on gulp without arguments
gulp.task('default', ['minicat-seq'], function(){});