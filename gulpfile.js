var gulp = require('gulp');
var data = require('gulp-data');
var nunjucksRender = require('gulp-nunjucks-render');

gulp.task('nunjucks', function() {
  // place code for your default task here

  nunjucksRender.nunjucks.configure(['templates/']);

  // Gets .html and .nunjucks files in pages
  return gulp.src('pages/**/*.+(html|nunjucks)')

  .pipe(data(function() {
  	return require('./data/superbright.json')
  }))
  // Renders template with nunjucks
  .pipe(nunjucksRender())
  // output files in app folder
  .pipe(gulp.dest('nuntest'))

});