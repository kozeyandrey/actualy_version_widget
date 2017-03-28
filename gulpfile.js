'use strict';

var gulp = require('gulp'),
    scss = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    errorHandle = function(err) {
        console.log(err.toString());
        this.emit('end');
    };

var SASS_INCLUDE_PATHS = [
    './node_modules/normalize-scss/sass/',
    './node_modules/bootstrap-sass/assets/stylesheets/'
];
var LIB_JS_INCLUDE_PATHS = [
    './libs/jquery.flexslider-min.js'
];

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('styles', function () {
    return gulp.src('./sass/main.scss')
        .pipe(plumber({ errorHandler: handleError }))
        .pipe(sourcemaps.init())
        .pipe(scss({outputStyle: 'compressed', includePaths: SASS_INCLUDE_PATHS}))
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest('./css'));
});

gulp.task('lib-js', function() {
    return browserify({
        entries: LIB_JS_INCLUDE_PATHS
    })
        .transform(babelify.configure({
            presets: ["es2015"]
        }))
        .bundle()
        .on('error', errorHandle)
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./js'));
});
gulp.task('js', function() {
    return browserify({
        entries: ["./source-js/main.js"]
    })
        .transform(babelify.configure({
            presets: ["es2015"]
        }))
        .bundle()
        .on('error', errorHandle)
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./js"));
});

gulp.task('watch', ['styles', 'js'], function () {
    gulp.watch('./sass/**/*.scss', ['styles']);
    gulp.watch('./source-js/**/*.js', ['js']);
});

gulp.task('default', ['lib-js', 'styles', 'js'], function () {

});