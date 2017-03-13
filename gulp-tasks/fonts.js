module.exports = (gulp, browserSync) => {
		// ### Fonts
	// `gulp fonts` - Grabs all the fonts and outputs them in a flattened directory
	// structure. See: https://github.com/armed/gulp-flatten
	gulp.task('fonts', () => {
	  return gulp.src(config.path.fonts)
	    .pipe(plugins.flatten())
	    .pipe(gulp.dest(config.path.dist + 'fonts'))
	    .pipe(browserSync.stream());
});
}