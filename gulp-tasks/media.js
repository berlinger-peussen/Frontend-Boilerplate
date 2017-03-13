module.exports = (gulp, plugins, browserSync) => {

	gulp.task('images', function() {
	  return gulp.src(config.path.images)
	    .pipe(plugins.imagemin([
	      plugins.imagemin.jpegtran({progressive: true}),
	      plugins.imagemin.gifsicle({interlaced: true}),
	      plugins.imagemin.svgo({plugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]})
	    ]))
	    .pipe(gulp.dest(config.path.dist + 'images'))
	    .pipe(plugins.browserSync.stream());
	});
	//takes a bunch of SVG files, optimizes them and bakes them into SVG sprites
// See: https://github.com/jkphl/gulp-svg-sprite
// TODO, cleanup and document
	gulp.task('svg', function() {
	  return gulp.src(config.path.svg)
	  .pipe(plugins.svgsprite({
	    mode: {
	      symbol: {
	        bust: false,
	        inline: true,
	        dest: './',
	        sprite: '../images/sprite.svg'
	      },
	      view: {
	        bust: false,
	        inline: true,
	        prefix: ".icon-%s", 
	        sprite:'../images/view-sprite.svg',
	        dest:'./',
	        render:{
	          scss: {
	            dest:'_svg-fonts'
	          }
	        }
	      }
	    }
	  }))
	  .pipe(gulp.dest('styles/'));
	});

}