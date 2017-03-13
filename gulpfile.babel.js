'use strict';

//import gulp from 'gulp';
//const - es6 syntax, require - nodeJS syntax, use with module.exports in tasks
const config 			= require('./gulp-config.json'), 
		  gulp        = require('gulp'),
		  //used for passing flag and using conditionals in gulp tasks e.g. sourcemaps and minification
		  argv        = require('minimist')(process.argv.slice(2)),
		  //auto browsersync on changes, yay
		  browserSync = require('browser-sync').create(),
		  del 				= require('del'),
		  //temp solution until gulp 4 providing series and parallels
		  runSequence = require('run-sequence'),
		  //lazy concat, w00t
		  lazypipe    = require('lazypipe'),
		  //lazyload plugins, no need to require them everywhere, DRY as fuck
		  plugins     = require('gulp-load-plugins')(
		  	{rename: {
		  		'gulp-scss-lint': 'scsslint',
		  		'gulp-svg-sprite': 'svgsprite'
		  	}
		  });


//symantic map for gulp --production flag options
const isEnabled 	= {
		//asset revisioning when --production
		revisioning: argv.production,
		//only minify when --production
		minify: argv.production,
		//no maps when --production
		maps: !argv.production,
		//fail styles when --production
		failOnStyle: argv.production,
		//fail scripts when --production
		failOnJSHint: argv.production
}


//tasks, require and define which vars are needed
require('./gulp-tasks/browsersync')(config, gulp, browserSync);
require('./gulp-tasks/styles')(config, gulp, argv, browserSync, lazypipe, plugins, isEnabled);
require('./gulp-tasks/scripts')(config, gulp, argv, browserSync, lazypipe, plugins, isEnabled);
//require('./gulp-tasks/media')(config, gulp, plugins, del);
//require('./gulp-tasks/svg')(config, gulp, plugins, del);
//require('./gulp-tasks/fonts')(config, gulp, plugins, del);

//run 'gulp' rather than 'gulp build' for the added clean(up)
gulp.task('build', (callback) => {
  runSequence('styles',
  						'scripts',
              callback);
});

gulp.task('clean', del.bind(null, [config.path.dist], {force:true}));

//default, cleans the dist folder and runs build
gulp.task('default', ['clean'], () => {
	gulp.start('build');
});

gulp.task('watch',() => {
	gulp.start('browsersync');
  gulp.watch([config.path.source + 'styles/**/*'], ['styles']);
  gulp.watch([config.path.source + 'scripts/**/*'], ['jshint', 'scripts']);
  //gulp.watch([config.path.source + 'fonts/**/*'], ['fonts']);
  //gulp.watch([config.path.source + 'images/**/*'], ['images']);
  gulp.watch(['bower.json', 'gulpfile.babel.js', './assets/manifest.json'], ['build']);
});

