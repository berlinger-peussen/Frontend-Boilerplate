module.exports = (config, gulp, argv, browserSync, writeToManifest, lazypipe, plugins, isEnabled, gutil) => {

  const concat      = plugins.concat,
        merge       = require('merge-stream'),
        manifest    = require('asset-builder')('./assets/manifest.json');

  const jsTasks = (filename) => {
     return lazypipe()
      .pipe( () => {
         return plugins.if(isEnabled.maps, plugins.sourcemaps.init());
      })
      .pipe(concat, filename)
      .pipe(plugins.uglify, {
        compress: {
          'drop_debugger': isEnabled.stripJSDebug
        }
        
      })
      .pipe(() => {
         return plugins.if(isEnabled.rev, plugins.rev());
      })
      .pipe( () => {
         return plugins.if(isEnabled.maps, plugins.sourcemaps.write('.', {
          sourceRoot: config.path.source + 'scripts/'
        }));
      })();
  };

  gulp.task('jshint', () => {
     return gulp.src([
      'bower.json', 'gulpfile.babel.js'
    ].concat(manifest.getProjectGlobs().js))
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'))
      .pipe(plugins.if(isEnabled.failJSHint, plugins.jshint.reporter('fail')));
  });

  gulp.task('scripts', ['jshint'], () => {
    let merged = merge();
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