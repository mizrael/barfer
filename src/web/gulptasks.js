module.exports = function (gulp, plugins) {
    const deleteEmpty = require('delete-empty'),
        paths = {
            js: {
                clean: './bin/web/static/**/*.js',
                input: './src/web/static/js/**/*.js',
                output: './bin/web/static'
            },
            views: {
                clean: './bin/web/views/**/*.pug',
                input: './src/web/views/**/*.pug',
                output: './bin/web/views'
            },
        };

    /*********************************/
    // SCRIPTS

    gulp.task('build_client_scripts_clean', function () {
        return gulp.src([paths.js.clean], {
                read: false
            })
            .pipe(plugins.debug())
            .pipe(plugins.clean());
    });

    gulp.task('build_client_scripts_build', ['build_client_scripts_clean'], function () {
        return gulp.src(paths.js.input)
            .pipe(plugins.debug())
            .pipe(plugins.concat('scripts.js'))
            //  .pipe(plugins.uglify())
            .pipe(gulp.dest(paths.js.output));
    });

    gulp.task('build_client_scripts_watch', function () {
        return gulp.watch(paths.js.input, ['build_client_scripts_build'])
            .on('change', function (event) {
                console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
            });
    });

    /*********************************/
    // VIEWS

    gulp.task('build_client_views_clean', function () {
        return gulp.src([paths.views.clean], {
                read: false
            })
            .pipe(plugins.clean());
    });

    gulp.task('build_client_views_build', ['build_client_views_clean'], function () {
        deleteEmpty.sync(paths.views.output);

        return gulp.src(paths.views.input)
            .pipe(gulp.dest(paths.views.output));
    });

    gulp.task('build_client_views_watch', function () {
        return gulp.watch(paths.views.input, ['build_client_views_build'])
            .on('change', function (event) {
                console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
            });
    });

    /*********************************/

    gulp.task('build_client_build_all', ['build_client_views_build', 'build_client_scripts_build']);
    gulp.task('build_client_watch_all', ['build_client_views_watch', 'build_client_scripts_watch']);
};