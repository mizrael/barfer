var gulp = require('gulp'),
    clean = require('gulp-clean'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    deleteEmpty = require('delete-empty'),
    tsProject = ts.createProject('./tsconfig.json');

var base_path = '.',
    views_paths = {
        clean: base_path + '/bin/**/*.pug',
        input: [
            base_path + '/src/**/*.pug'
        ],
        output: base_path + '/bin/'
    },
    ts_paths = {
        clean: base_path + '/bin/**/*.js',
        input: [
            base_path + '/src/**/*.ts'
        ],
        output: base_path + '/bin/'
    };

/*********************************/
// SCRIPTS

gulp.task('scripts_clean', function () {
    return gulp.src([ts_paths.clean], {
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
// VIEWS

gulp.task('views_clean', function () {
    return gulp.src([views_paths.clean], {
            read: false
        })
        .pipe(clean());
});

gulp.task('views_build', ['views_clean'], function () {
    deleteEmpty.sync(views_paths.output);

    return gulp.src(views_paths.input)
        .pipe(gulp.dest(views_paths.output));
});

gulp.task('views_watch', function () {
    return gulp.watch(views_paths.input, ['views_build'])
        .on('change', function (event) {
            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
        });
});

/*********************************/
gulp.task('watch', ['scripts_watch', 'views_watch']);

gulp.task('build', ['scripts_build', 'views_build']);

gulp.task('build_watch', ['build', 'watch']);