module.exports = function (gulp, plugins) {
    const basePath = './bin',
        libsPath = basePath + '/common',
        appPath = basePath + '/messageProcessor',
        jobPath = appPath + '/app_data/jobs/continuous/processor';

    gulp.task('post_replace_paths', function () {
        var glob = jobPath + '/**/*.js';

        return gulp.src(glob)
            .pipe(plugins.replace('../../../../../common', '../../../../bin/common'))
            .pipe(gulp.dest(jobPath));
    });

    gulp.task('build_message_processor', ['post_replace_paths']);
};