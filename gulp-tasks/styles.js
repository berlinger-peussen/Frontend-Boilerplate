module.exports = (config, gulp, argv, browserSync, lazypipe, plugins, isEnabled) => {

	const merged = require('merge-stream')(),
		    manifest = require('asset-builder')('./assets/manifest.json');

	const cssTasks = (filename) => {
	  lazypipe()
	    .pipe( () => {
	      plugins.if(!isEnabled.failOnStyle, plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}));
	    })
	    .pipe( () => {
	      plugins.if(isEnabled.maps, plugins.sourcemaps.init());
	    })
	    .pipe( () => {
	      plugins.if('*.scss', plugins.sass({
	        outputStyle: 'nested', // libsass doesn't support expanded yet
	        precision: 10,
	        includePaths: ['.'],
	        errLogToConsole: !isEnabled.failOnStyle
	      }));
	    })
	    .pipe(plugins.concat, filename)
	    .pipe(plugins.autoprefixer, {
	      browsers: [
	        'last 2 versions',
	        'android 4',
	        'opera 12'
	      ]
	    })
	    .pipe(plugins.cssnano, { safe: true })
	    .pipe( () => {
	      plugins.if(isEnabled.revisioning, plugins.rev());
	    })
	    .pipe( () => {
	      plugins.if(isEnabled.maps, plugins.sourcemaps.write('.', {
	        sourceRoot: config.path + 'styles/'
	      }));
	    })();
	};	

	const writeToManifest = (directory) => {
	  lazypipe()
	    .pipe(gulp.dest, config.path.dist + directory)
	    .pipe(browserSync.stream, {match: '**/*.css'})
	    .pipe(plugins.rev.manifest, config.path.dist + 'assets.json', {
	      base: config.path.dist,
	      merge: true
	    })
	    .pipe(gulp.dest, config.path.dist)();
	};

	gulp.task('scsslint', function() {
    return gulp.src(config.path.source + 'styles/*.scss')
    .pipe(plugins.scsslint({
      'endless': true,
      'config' : 'scsslint.yml'
    }));
});

	gulp.task('wiredep', function() {
	  var wiredep = require('wiredep').stream;
	  gulp.src(manifest.getProjectGlobs().css)
	    .pipe(wiredep())
	    .pipe(plugins.changed(config.path.source + 'styles', {
	      hasChanged: plugins.changed.compareSha1Digest
	    }))
	    .pipe(gulp.dest(config.path.source + 'styles'));
	});

	gulp.task('styles',['scsslint','wiredep'] ,() => {

	  manifest.forEachDependency('css', (dep) => {
	    const cssTasksInstance = cssTasks(dep.name);
	    merged.add(gulp.src(dep.globs, {base: 'styles'})
	      .pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
	      .pipe(cssTasksInstance));
	  });
	  merged
	    .pipe(writeToManifest('styles'));
	});

}