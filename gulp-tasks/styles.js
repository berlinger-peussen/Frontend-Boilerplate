module.exports = (config, gulp, argv, browserSync, writeToManifest, lazypipe, plugins, isEnabled, gutil) => {

	const merge 			= require('merge-stream'),
				manifest    = require('asset-builder')('./assets/manifest.json'),
				onError     = (err) => {
	  			console.log(err.toString());
	  			this.emit('end');
				};

	const cssTasks = (filename) => {
	  return lazypipe()
	    .pipe(() => {
	      return plugins.if(!isEnabled.failOnStyle, plugins.plumber());
	    })
	    .pipe(() => {
	      return plugins.if(isEnabled.maps, plugins.sourcemaps.init());
	    })
	    .pipe(() => {
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
	    .pipe(plugins.cssnano, {
	      safe: true
	    })
	    .pipe(() => {
	      return plugins.if(isEnabled.revisioning, plugins.rev());
	    })
	    .pipe(() => {
	      return plugins.if(isEnabled.maps, plugins.sourcemaps.write('.', {
	        sourceRoot: 'assets/styles/'
	      }));
	    })();
	};

	gulp.task('scsslint', () => {
    gulp.src(config.path.source + 'styles/*.scss')
    .pipe(plugins.scsslint({
      'endless': true,
      'config' : 'scsslint.yml'
    }));
	});

	gulp.task('styles', ['wiredep'], () => {
	  var merged = merge();
	  manifest.forEachDependency('css', function(dep) {
	    var cssTasksInstance = cssTasks(dep.name);
	    if (!isEnabled.failOnStyle) {
	      cssTasksInstance.on('error', function(err) {
	        console.error(err.message);
	        this.emit('end');
	      });
	    }
	    merged.add(gulp.src(dep.globs, {base: 'styles'})
	      .pipe(plugins.plumber({errorHandler: onError}))
	      .pipe(cssTasksInstance));
	  });
	  merged
	    .pipe(writeToManifest('styles'));
	});

	gulp.task('wiredep', () => {
	  var wiredep = require('wiredep').stream;
	  gulp.src(manifest.getProjectGlobs().css)
	    .pipe(wiredep())
	    .pipe(plugins.changed(config.path.source + 'styles', {
	      hasChanged: plugins.changed.compareSha1Digest
	    }))
	    .pipe(gulp.dest(config.path.source + 'styles'));
	});

}

