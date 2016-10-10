var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');

gulp.task('minicat', function(){
    return gulp.src(['js/models.js', 'js/menus.js', 'js/levels.js', 'js/resources.js', 'js/app.js', 'js/engine.js'])
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(gp_rename('uglify.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['minicat'], function(){});