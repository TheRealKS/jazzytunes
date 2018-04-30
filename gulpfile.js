var gulp = require('gulp');
var uglify = require('gulp-uglify/composer');
var ts = require('gulp-typescript');
const tsproj = ts.createProject('ui/apiwrapper/ts/tsconfig.json');
var pump = require('pump');
var uglifyjs = require('uglify-es');
var minify = uglify(uglifyjs, console);

gulp.task('dev', function() {
    //Compile ts
    return tsproj.src()
    .pipe(tsproj())
    .pipe(gulp.dest(tsproj.projectDirectory));
});

gulp.task('compress', function(cb) {
    pump([
        gulp.src('ui/apiwrapper/js/script.js'),
        minify({toplevel: true}),
        gulp.dest('dist')
    ],
    cb);
});