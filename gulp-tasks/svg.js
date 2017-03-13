module.exports = (gulp) => {
//takes a bunch of SVG files, optimizes them and bakes them into SVG sprites
// See: https://github.com/jkphl/gulp-svg-sprite
gulp.task('svg', function() {
  return gulp.src(config.path.svg)
  .pipe(svgsprite({
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