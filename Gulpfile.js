const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const cssnano = require('gulp-cssnano');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const ignore = require('gulp-ignore');


var base = './web/public/Packages/Sites/schule.signalwerkCh/Resources';

var inputJS = base + '/Private/JavaScript/*.js';
var outputJS = base + '/Public/JavaScript';
var observeJS = base + '/Private/JavaScript/**/*.js';

var input = base + '/Private/Styles/signalwerk.scss';
var observe = base + '/Private/Styles/**/*.scss';
var output = base + '/Public/Styles';


var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};



gulp.task('js', () =>
  gulp.src(inputJS)
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015', 'stage-0']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(outputJS))


    .pipe(ignore.exclude([ "**/*.map" ]))

    .pipe(uglify().on('error', function(e){
         console.log(e);
    }))

    // now produce the min version
    .pipe(rename({
        suffix: '.min'
    }))

    .pipe(gulp.dest(outputJS))
);


gulp.task('sass', function () {
  return gulp
    .src(input)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    // .pipe(sourcemaps.write())  >> but in current release see next
    .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(output))

    // now produce the min version
    // .pipe(rename({
    //     suffix: '.min'
    // }))
    //
    // .pipe(cssnano())
    //
    // .pipe(gulp.dest(output))

    // Release the pressure back and trigger flowing mode (drain)
    // See: http://sassdoc.com/gulp/#drain-event
    .resume();
});







gulp.task('watch', function() {
  return gulp
    // Watch the input folder for change,
    // and run `sass` task when something happens
    .watch(observe, ['sass'])
    // When there is a change,
    // log a message in the console
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});


gulp.task('watchJS', function() {
  return gulp
    // Watch the input folder for change,
    // and run `sass` task when something happens
    .watch(observeJS, ['js'])
    // When there is a change,
    // log a message in the console
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('default', ['sass', 'js', 'watch', 'watchJS' /*, possible other tasks... */]);
