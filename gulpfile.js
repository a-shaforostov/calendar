'use strict';

const gulp = require('gulp');
const environments = require('gulp-environments');
var development = environments.development;
var production = environments.production;

const uglify = require('gulp-uglify');
const rigger = require('gulp-rigger');
const del = require('del');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');

const less = require('gulp-less');
const LessPluginCleanCSS = require('less-plugin-clean-css');

const sourcemaps = require('gulp-sourcemaps');
const watch = require('gulp-watch');
const changed = require('gulp-changed');

const tap = require('gulp-tap');
const rename = require("gulp-rename");
const eslint = require('gulp-eslint');

const path = {
    build: { // Тут мы укажем куда складывать готовые после сборки файлы
        html: 'public/',
        js: 'public/js/',
        css: 'public/style/'
    },
    src: { // Пути откуда брать исходники
        // Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        html: 'src/*.html',
        js: ['src/js/**/*.js'],
        less: ['src/style/**/*.less']
    },
    watch: { // Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.less'
    },
    clean: ['public/js', 'public/style', 'public/html.*']
};

gulp.task('js:lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(path.src.js)
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.formatEach())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

gulp.task('html:build', () => {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(plumber())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(path.build.html));
});

gulp.task('js:build', () => {
    console.log(production() ? "production environment" : "development environment");
    return gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(production(uglify()))
        .pipe(gulp.dest(path.build.js));
});

gulp.task('style:build', () => {
    const cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});
    gulp.src(path.src.less)
        .pipe(plumber())
        .pipe(development(sourcemaps.init()))                //Инициализация первой командой
        .pipe(less({
            plugins: [cleanCSSPlugin]
        }).on('error', console.error))
        .pipe(development(sourcemaps.write('.')))   // Карта последней командой '../maps/style'
        .pipe(gulp.dest(path.build.css));
});

gulp.task('clean', () => {
    del(path.clean).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
});

gulp.task('watch', () => {
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build', ['js:lint']);
        // gulp.start('js:build');
    });
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build'
]);

gulp.task('default', ['js:lint', 'build']);
// gulp.task('default', ['build']);
