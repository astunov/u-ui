'use strict';

// Development
var gulp = require('gulp');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require("browser-sync");
var rimraf = require('rimraf');
var ignore = require('gulp-ignore');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var rigger = require('gulp-rigger');
var wait = require('gulp-wait');
// svg sprite
var svgSprite = require('gulp-svg-sprite');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var replace = require('gulp-replace');

var postcss = require('gulp-postcss');
var assets = require('postcss-assets');

var dirSync = require('gulp-directory-sync');
var reload = browserSync.reload;

// Production
var purify = require('gulp-purifycss');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var csso = require('gulp-csso');

// Testing
var reporter = require('postcss-reporter');
var stylelint = require('stylelint');
var postcss_scss = require("postcss-scss");

// Helpers
var inputDir = 'src/';
var outputDir = 'build/';
var prodDir = 'prod/';

var config = {
  server: {
    baseDir: outputDir
  },
  // tunnel: false,
  // host: 'localhost',
  port: 9000,
  open: false,
  reloadDelay: 1000
};

/*
 * Development
 */
gulp.task('jade', function() {
  return gulp.src([inputDir + 'jade/*.jade', '!' + inputDir + 'jade/_*.jade'])
    .pipe(plumber())
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(outputDir))
    .pipe(browserSync.stream());
});

gulp.task('style', function() {
  return gulp.src([inputDir + 'style/*.scss', '!' + inputDir + 'style/_*.scss'])
     .pipe(wait(2000))
     .pipe(plumber())
     .pipe(sourcemaps.init())
     .pipe(sass())
     .pipe(autoprefixer({
       browsers: ['last 3 versions'],
       cascade: false
     }))
     .pipe(sourcemaps.write())
     .pipe(gulp.dest(outputDir + 'style/'))
     .pipe(browserSync.stream());
});

gulp.task('img:sync', function() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(
      dirSync(inputDir + 'i/', outputDir + 'i/', {printSummary: true}
    ))
    .pipe(browserSync.stream());
});

gulp.task('fonts:sync', function() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(dirSync(
      inputDir + 'fonts/', outputDir + 'fonts/', {printSummary: true}
    ))
    .pipe(browserSync.stream());
});

gulp.task('js:sync', function() {
  return gulp.src(inputDir + 'js/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rigger())
    .pipe(gulp.dest(outputDir + 'js/'))
    .pipe(browserSync.stream())
    .pipe(sourcemaps.write());
});

gulp.task('svgSpriteBuild', function() {
  return gulp.src(inputDir + 'i/icons/*.svg')
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../sprite.svg",
          render: {
            scss: {
              dest: '../../../style/base/_svg-sprite.scss',
              template: inputDir + '/style/abstracts/_svg-sprite-template.scss'
            }
          }
        }
      }
    }))
    .pipe(gulp.dest(inputDir + 'i/sprite/'));
});

// watching files and run tasks
gulp.task('watch', function() {
  gulp.watch(inputDir + 'jade/**/*.jade', ['jade']);
  gulp.watch(inputDir + 'style/**/*.scss', ['style']);
  gulp.watch(inputDir + 'js/**/*.js', ['js:sync']);
  gulp.watch(inputDir + 'i/**/*', ['img:sync']);
});

gulp.task('webserver', function() {
  browserSync(config);
});

/*
 * Production
 */
gulp.task('style:prod', function() {
  return gulp.src([inputDir + 'style/*.scss', '!' + inputDir + 'style/_*.scss'])
     .pipe(plumber())
     .pipe(sass())
     .pipe(autoprefixer({
       browsers: ['last 3 versions'],
       cascade: false
     }))
     .pipe(csso())
     .pipe(gulp.dest(outputDir + 'style/'))
     .pipe(browserSync.stream());
});

gulp.task('img:prod', function() {
  return gulp.src([inputDir + 'i/**/*', '!' + inputDir + 'i/phantom/**'])
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(outputDir + 'i/'));
});

gulp.task('build', [
  'jade',
  'style',
  'js:sync',
  'img:sync',
  'fonts:sync',
  'svgSpriteBuild'
]);

gulp.task('prod', [
  'style:prod',
  'img:prod',
  'svgSpriteBuild'
]);

// TODO: prod & watch

// gulp.task('clean', function (cb) {
//    rimraf('./build/*.html', cb);
// });

// // Test building files
// gulp.task('cssLint', function () {
//   return gulp.src([inputDir + 'sass/**/*.scss', '!' + inputDir + 'sass/templates/*.scss'])
//     .pipe(postcss(
//       [
//         stylelint(),
//         reporter({ clearMessages: true })
//       ],
//       {
//         syntax: postcss_scss
//       }
//     ));
// });

gulp.task('default', ['build', 'webserver', 'watch']);
gulp.task('prod', ['build']);
