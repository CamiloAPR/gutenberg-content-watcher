var gulp = require('gulp'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  exec = require('child_process').exec;


function buildCss(cb) {
  var stream = gulp.src('./src/sass/main.scss')
    .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
    .pipe(rename('style.css'))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.stream());

  return stream;
}


function buildJs(cb) {
  exec('npm run build', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
}

function watch(cb) {
  gulp.watch(['**/*.php'], function (done) {
    browserSync.reload();
    done();
  });

  gulp.watch('src/**/*.js', buildJs);
  gulp.watch('src/**/*.scss', buildCss);
}

exports.default = gulp.series(buildCss, buildJs, watch);