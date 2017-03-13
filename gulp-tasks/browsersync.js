module.exports = (config, gulp, browserSync) => {
  gulp.task('browsersync', () => {
    return browserSync.init({
      files: config.path.files,
      proxy: config.path.devUrl,
      snippetOptions: {
        whitelist: ['/wp-admin/admin-ajax.php'],
        blacklist: ['/wp-admin/**']
      }
    });
  });

}