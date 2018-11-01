var gulp = require('gulp');
var uglify = require('gulp-uglify/composer');
var ts = require('gulp-typescript');
const tsproj = ts.createProject('ui/apiwrapper/ts/tsconfig.json');
var pump = require('pump');
var uglifyjs = require('uglify-es');
var minify = uglify(uglifyjs, console);

gulp.task('comp-ts', function() {
    var projects = ['ui/apiwrapper/ts/tsconfig.json', 'ui/ts/tsconfig.json', 'ui/elements/tsconfig.json'];
    for (var i = 0; i < projects.length - 1; i++) {
        let tsproj = ts.createProject(projects[i]);
        tsproj.src()
            .pipe(tsproj())
            .pipe(gulp.dest(tsproj.projectDirectory));
    }
    let final = ts.createProject(projects[projects.length - 1]);
    return final.src()
        .pipe(tsproj())
        .pipe(gulp.dest(tsproj.projectDirectory));
});

gulp.task('dev', function() {
    //Compile ts
    return tsproj.src()
        .pipe(tsproj())
        .pipe(gulp.dest(tsproj.projectDirectory));
});

gulp.task('ui', function() {
    let proj = ts.createProject('ui/ts/tsconfig.json');
    return tsproj.src()
        .pipe(tsproj())
        .pipe(gulp.dest(proj.projectDirectory));
})

gulp.task('compress', function(cb) {
    pump([
            gulp.src('ui/apiwrapper/js/script.js'),
            minify({ toplevel: true, compress: {unused: false}}),
            gulp.dest('dist')
        ],
        cb);
});