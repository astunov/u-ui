'use strict';
// ᚏᚏᚏᚏ DEVELOPMENT ᚏᚏᚏᚏ
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require("browser-sync");
var rimraf = require('rimraf');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var rigger = require('gulp-rigger');
var cssfont64 = require('gulp-cssfont64');

// ᚏᚏᚏᚏ SVG SPRITE ᚏᚏᚏᚏ
var svgSprite = require('gulp-svg-sprite');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var replace = require('gulp-replace');
var dirSync = require('gulp-directory-sync');

// ᚏᚏᚏᚏ PRODUCTION ᚏᚏᚏᚏ
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var csso = require('gulp-csso');

// ᚏᚏᚏᚏ PATHS ᚏᚏᚏᚏ
var inputDir = 'src/';
var outputDir = 'build/';

// ᚏᚏᚏᚏ SERVER CONFIG ᚏᚏᚏᚏ
var config = {
  server: {
    baseDir: outputDir
  },
  port: 9000,
  open: true,
  reloadDelay: 1000
};

// ᚏᚏᚏᚏ WILL BE USEFUL LATE OR NEVER ᚏᚏᚏᚏ
// var reporter = require('postcss-reporter');
// var stylelint = require('stylelint');
// var postcss_scss = require("postcss-scss");
// var purify = require('gulp-purifycss');
// var postcss = require('gulp-postcss');
// var assets = require('postcss-assets');
// var ignore = require('gulp-ignore');
// var watch = require('gulp-watch');

// ᚏᚏᚏᚏ DEVELOPMENT ᚏᚏᚏᚏ

/**
 * Jade => html
 * Файлы _ игнорируются
 */
gulp.task('jade', function() {
  return gulp.src([inputDir + 'jade/*.jade', '!' + inputDir + 'jade/_*.jade'])
    .pipe(plumber())
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(outputDir))
    .pipe(browserSync.stream());
});

/**
 * Scss => css
 * Sourcemaps + autoprefixer включены
 */
gulp.task('style', function() {
  return gulp.src([inputDir + 'style/**/*.scss'])
     .pipe(plumber())
     .pipe(sourcemaps.init())
     .pipe(sass(
       {
         includePaths: [inputDir + 'style/**/*.*']
       }
    ).on('error', sass.logError))
     .pipe(autoprefixer({
       browsers: ['last 3 versions'],
       cascade: false
     }))
     .pipe(sourcemaps.write())
     .pipe(gulp.dest(outputDir + 'style/'))
     .pipe(browserSync.stream());
});

/**
 * Img sync между inputDir & outputDir
 * При добавлянии новых файлов под watch
 * в inputDir, они появляются в outputDir
 */
gulp.task('img:sync', function() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(
      dirSync(inputDir + 'i/', outputDir + 'i/', {printSummary: true}
    ))
    .pipe(browserSync.stream());
});

/**
 * Fonts sync между inputDir & outputDir
 * При добавлянии новых файлов под watch
 * в inputDir, они появляются в outputDir
 * Используется для работы с локальными шрифтами
 * Альтернатива: GoogleFonts || шрифт в localStorage(используется
 * в этом проекте)
 * !!! В данном проекте не используется !!!
 */
gulp.task('fonts:sync', function() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(dirSync(
      inputDir + 'fonts/', outputDir + 'fonts/', {printSummary: true}
    ))
    .pipe(browserSync.stream());
});

/**
 * Конвертация шрифтов в base64
 * для загрузки в localStorage
 * временный метод, используется в ручном режиме,
 * тк данный плагин не группирует семейство шрифтов.
 * Дальше ручками перебивается в один файл ¯\_(ツ)_/¯
 * Альернатива: fontsquirrel при конвертации
 * в base64 потрит шрифт
 */
gulp.task('fonts:convert', function() {
  return gulp.src([inputDir + 'fonts/*.{woff,woff2}'])
    .pipe(cssfont64())
    .pipe(gulp.dest(inputDir + 'style/'))
    .pipe(browserSync.stream());
});

/**
 * JS sync между inputDir & outputDir
 * Через Rigger включаем подключаем
 * файлы в main.js (логика = @import
 * в scss)
 * Sourcemaps включён
 */
gulp.task('js:sync', function() {
  return gulp.src(inputDir + 'js/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rigger())
    .pipe(gulp.dest(outputDir + 'js/'))
    .pipe(browserSync.stream())
    .pipe(sourcemaps.write());
});

/**
 * Создание svg спрайта
 * Все svg в папке i/icons
 * собираются в один svg file
 * далее используем иконки через <use>
 * Подробно http://goo.gl/RV3AAU
 */
gulp.task('svgSprite', function() {
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
// ᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏ
// ᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏ

// ᚏᚏᚏᚏ UTILS ᚏᚏᚏᚏ

gulp.task('watch', function() {
  gulp.watch(inputDir + 'jade/**/*.jade', ['jade']);
  gulp.watch(inputDir + 'style/**/*.scss', ['style']);
  gulp.watch(inputDir + 'js/**/*.js', ['js:sync']);
  gulp.watch(inputDir + 'i/**/*', ['img:sync']);
});

gulp.task('webserver', function() {
  browserSync(config);
});

gulp.task('clean', function(cb) {
  rimraf('./build/', cb);
});
// ᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏ
// ᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏᚏ

// ᚏᚏᚏᚏ PRODUCTION ᚏᚏᚏᚏ

/**
 * Scss => css
 * Убираем sourcemaps
 * Минифицируем через csso
 */
gulp.task('style:prod', function() {
  return gulp.src([inputDir + 'style/*.scss'])
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
/**
 * Img prod
 * Минифицируем картинки через imagemin
 */
gulp.task('img:prod', function() {
  return gulp.src([inputDir + 'i/**/*', '!' + inputDir + 'i/phantom/**'])
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(outputDir + 'i/'));
});

/**
 * Js prod
 * Минифицируем картинки через uglify
 * !!! Оставляем только два файла: main + font-loader !!!
 */
gulp.task('js:prod', function() {
  return gulp.src(inputDir + 'js/{main,font-loader}.js')
    .pipe(rigger())
    .pipe(uglify())
    .pipe(gulp.dest(outputDir + 'js/'));
});

/**
 * Собираем все build таски
 */
gulp.task('build', [
  'jade',
  'style',
  'js:sync',
  'img:sync',
  // if you need local fonts
  // 'fonts:sync',
  'svgSprite'
]);

/**
 * Таск по умолчанию используется для разработки
 */
gulp.task('default', ['build', 'webserver', 'watch']);

/**
 * Таск для продакшена
 */
gulp.task('prod', ['clean'], function() {
  gulp.start('jade', 'style:prod', "js:prod", 'img:prod', 'svgSprite');
});
