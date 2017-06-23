'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var pump = require('pump');
var cleanCSS = require('gulp-clean-css');
var gulpsequence = require('gulp-sequence');
var htmlmin = require('gulp-htmlmin');
var sourcemaps = require('gulp-sourcemaps');
var babel = require("gulp-babel");
var uglify = require('gulp-uglify');
var image = require('gulp-image');
var pngquant = require('imagemin-pngquant');
var jpgoptim = require('imagemin-jpegoptim');
var clean = require('gulp-clean');

var spritesmith  = require('gulp.spritesmith')
var stylus = require('gulp-stylus');

// Smash Js
gulp.task('smashJs', function (cb) {
  pump([
        gulp.src(['src/js/jquery.js', 'src/js/foundation.js', 'src/js/foundation.equalizer.js', 'src/js/foundation.reveal.js','src/js/fastclick.js', 'src/js/scripts.js']),
        concat('main.js'),
        sourcemaps.init(),
        babel(),
        uglify(),
        sourcemaps.write("."),
        gulp.dest('app/js'),
    ],
    cb
  );
  // return gulp.src('src/js/main.js', {read: false})
  //       .pipe(clean());
});

// Smash Css
gulp.task('smashCss', function() {
  return gulp.src('src/css/*.css')
    .pipe(concat('main.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('app/css/'));
});

// Smash HTML
gulp.task('smashhtml', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('app/'));
});

// Smash images
gulp.task('smashimg', function () {
  gulp.src('src/img/**/*')
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      jpegoptim: true,
      mozjpeg: true,
      guetzli: false,
      gifsicle: true,
      svgo: true,
      concurrent: 10
    }))
    .pipe(gulp.dest('app/img/'));
});

// Build
gulp.task('default', gulpsequence('smashhtml', 'smashJs', 'smashCss', 'smashimg'));

// New sprite stuff
gulp.task('stylus', function() {
    return gulp.src('./src/assets/styles/style.styl')
        .pipe(stylus({
            compress: true
        }))
        .pipe(gulp.dest('./built/assets/styles'))
});

gulp.task('sprite', function() {
    var spriteData = 
        gulp.src('./src/assets/images/sprite/*.*') // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: 'sprite.styl',
                cssFormat: 'stylus',
                algorithm: 'binary-tree',
                cssTemplate: 'stylus.template.mustache',
                cssVarMap: function(sprite) {
                    sprite.name = 's-' + sprite.name
                }
            }));

    spriteData.img.pipe(gulp.dest('./built/assets/images/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('./src/assets/styles/')); // путь, куда сохраняем стили
});

gulp.task('watch', function() {
    gulp.watch('./src/assets/styles/**/*.styl', ['stylus']);
    gulp.watch('./src/assets/images/sprite/*.*', ['sprite']);
});