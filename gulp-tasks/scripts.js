module.exports = (config, gulp, argv, browserSync, lazypipe, plugins, isEnabled) => {

  const concat = plugins.concat,
        merged = require('merge-stream')(),
        manifest = require('asset-builder')('./assets/manifest.json');

  const jsTasks = (filename) => {
     lazypipe()
      .pipe( () => {
         plugins.if(isEnabled.maps, plugins.sourcemaps.init());
      })
      .pipe(concat, filename)
      .pipe(plugins.uglify, {
        compress: {
          'drop_debugger': isEnabled.stripJSDebug
        }
      })
      .pipe(() => {
         plugins.if(isEnabled.rev, plugins.rev());
      })
      .pipe( () => {
         plugins.if(isEnabled.maps, plugins.sourcemaps.write('.', {
          sourceRoot: config.path.source + 'scripts/'
        }));
      })();
  };
  const writeToManifest = (directory) => {
     lazypipe()
      .pipe(gulp.dest, config.path.dist + directory)
      .pipe(browserSync.stream, {match: '**/*.js'})
      .pipe(plugins.rev.manifest, config.path.dist + 'assets.json', {
        base: config.path.dist,
        merge: true
      })
      .pipe(gulp.dest, config.path.dist)();
  };
  gulp.task('jshint', () => {
     gulp.src([
      'bower.json', 'gulpfile.babel.js'
    ].concat(manifest.getProjectGlobs().js))
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.if(isEnabled.failJSHint, plugins.jshint.reporter('fail')));
  });
  gulp.task('scripts', ['jshint'], () => {
    manifest.forEachDependency('js', (dep) => {
      merged.add(
        gulp.src(dep.globs, {base: 'scripts'})
          .pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
          .pipe(jsTasks(dep.name))
      );
    });
    merged
      .pipe(writeToManifest('scripts'));
  });
}