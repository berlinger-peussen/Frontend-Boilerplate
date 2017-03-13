module.exports = (config, gulp, argv, browserSync, lazypipe, plugins, isEnabled) => {

const concat = plugins.concat,
      merged = require('merge-stream')(),
 			manifest = require('asset-builder')('./assets/manifest.json');

const jsTasks = (filename) => {
  return lazypipe()
    .pipe( () => {
      return plugins.if(isEnabled.maps, plugins.sourcemaps.init());
    })
    .pipe( () => {
      return plugins.if(manifest.getProjectGlobs().js, plugins.babel({presets: ["es2015"]}));
    })
    .pipe(concat, filename)
    .pipe(plugins.uglify, {
      compress: {
        'drop_debugger': isEnabled.stripJSDebug
      }
    })
    .pipe( () => {
      return plugins.if(isEnabled.rev, plugins.rev());
    })
    .pipe( () => {
      return plugins.if(isEnabled.maps, plugins.sourcemaps.write('.', {
        sourceRoot: 'assets/scripts/'
      }));
    })();
};
const writeToManifest = (directory) => {
  return lazypipe()
    .pipe(gulp.dest, config.path.dist + directory)
    .pipe(browserSync.stream, {match: '**/*.js'})
    .pipe(plugins.rev.manifest, config.path.dist + 'assets.json', {
      base: config.path.dist,
      merge: true
    })
    .pipe(gulp.dest, config.path.dist)();
};
gulp.task('jshint', () => {
  return gulp.src([
    'bower.json', 'gulpfile.js'
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
  return merged
    .pipe(writeToManifest('scripts'));
});
}