const gulp = require('gulp'),
    clean = require('gulp-clean'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    deleteEmpty = require('delete-empty'),
    tsProject = ts.createProject('./tsconfig.json'),
    replace = require('gulp-replace'),
    plugins = require('gulp-load-plugins')();

require('./src/web/gulptasks')(gulp, plugins);
require('./src/messageProcessor/gulptasks')(gulp, plugins);

/*********************************/

var base_path = '.',
    ts_paths = {
        clean: ['!' + base_path + '/bin/web/static/**/*.js', base_path + '/bin/**/*.js', base_path + '/bin/**/*.js.map'],
        input: [
            base_path + '/src/**/*.ts'
        ],
        sourcemaps: '.', // this is relative to the /bin/ folder
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
        .pipe(sourcemaps.write(ts_paths.sourcemaps))
        .pipe(gulp.dest(ts_paths.output));
});

gulp.task('scripts_watch', function () {
    return gulp.watch(ts_paths.input, ['scripts_build'])
        .on('change', function (event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });
});

/*********************************/


gulp.task('watch', ['scripts_watch', 'build_client_watch_all']);

gulp.task('build', ['scripts_build', 'build_client_build_all']);

gulp.task('post_build_azure', ['build'], function () {
    gulp.start('post_build_message_processor_azure');
});

gulp.task('build:dev', ['build', 'watch']);

gulp.task('default', ['post_build_azure']);