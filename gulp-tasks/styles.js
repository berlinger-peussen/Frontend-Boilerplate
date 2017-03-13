module.exports = (config, gulp, argv, browserSync, lazypipe, plugins, isEnabled) => {

	const merged = require('merge-stream')(),
		    manifest = require('asset-builder')('./assets/manifest.json');

	const cssTasks = (filename) => {
	  return lazypipe()
	    .pipe( () => {
	      return plugins.if(!isEnabled.failOnStyle, plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}));
	    })
	    .pipe( () => {
	      return plugins.if(isEnabled.maps, plugins.sourcemaps.init());
	    })
	    .pipe( () => {
	      return plugins.if('*.scss', plugins.sass({
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
	      return plugins.if(isEnabled.revisioning, plugins.rev());
	    })
	    .pipe( () => {
	      return plugins.if(isEnabled.maps, plugins.sourcemaps.write('.', {
	        sourceRoot: 'assets/styles/'
	      }));
	    })();
	};	

	const writeToManifest = (directory) => {
	  return lazypipe()
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
	  return gulp.src(manifest.getProjectGlobs().css)
	    .pipe(wiredep())
	    .pipe(plugins.changed(config.path.source + 'styles', {
	      hasChanged: plugins.changed.compareSha1Digest
	    }))
	    .pipe(gulp.dest(config.path.source + 'styles'));
	});

	gulp.task('styles',['scsslint','wiredep'] ,() => {

	  manifest.forEachDependency('css', (dep) => {
	    const cssTasksInstance = cssTasks(dep.name);
	    if (!isEnabled.failOnStyle) {
	      cssTasksInstance.on('error', (err) => {
	        console.error(err.message);
	        this.emit('end');
	      });
	    }
	    merged.add(gulp.src(dep.globs, {base: 'styles'})
	      .pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
	      .pipe(cssTasksInstance));
	  });
	  return merged
	    .pipe(writeToManifest('styles'));
	});

}