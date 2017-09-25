const gulp = require('gulp'),
    clean = require('gulp-clean'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    deleteEmpty = require('delete-empty'),
    tsProject = ts.createProject('./tsconfig.json'),
    plugins = require('gulp-load-plugins')();

var base_path = '.',
    ts_paths = {
        clean: ['!' + base_path + '/bin/web/static/**/*.js', base_path + '/bin/**/*.js'],
        input: [
            base_path + '/src/**/*.ts'
        ],
        output: base_path + '/bin/'
    };

/*********************************/
// SCRIPTS

gulp.task('scripts_clean', function () {
    return gulp.src(ts_paths.clean, {
            read: false
        })
        .pipe(clean());
});

gulp.task('scripts_build', ['scripts_clean'], function () {
    deleteEmpty.sync(ts_paths.output);

    var tsResult = gulp.src(ts_paths.input)
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(ts_paths.output));
});

gulp.task('scripts_watch', function () {
    return gulp.watch(ts_paths.input, ['scripts_build'])
        .on('change', function (event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });
});

/*********************************/
require('./src/web/gulptasks')(gulp, plugins);

gulp.task('watch', ['scripts_watch', 'build_client_watch_all']);

gulp.task('build', ['scripts_build', 'build_client_build_all']);

gulp.task('default', ['build', 'watch']);