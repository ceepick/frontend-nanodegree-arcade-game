var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    del = require('del'),
    runSequence = require('run-sequence');

// Concat files | Minify
gulp.task('minicat', function() {
    return gulp.src(['js/models.js', 'js/menus.js', 'js/levels.js', 'js/resources.js', 'js/app.js', 'js/engine.js'])
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('app.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
});

// Remove concat.js after minicat runs
gulp.task('clean-dist-concat', function() {
    return del([
        'dist/concat.js'
    ]);
});

// Run tasks sequentially
gulp.task('tasks', function(done) {
    runSequence('minicat', 'clean-dist-concat', function() {
        done();
    });
});


gulp.task('default', ['tasks'], function(){});