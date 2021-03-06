'use strict';

var path = require('path');
var conf = require('./conf');
var log = require('fancy-log');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');
const { series, task, src, dest } = require('gulp');

task('styles', function() {
    return buildStyles();
});

task('styles-reload', series(task('styles'), function() {
    return buildStyles()
        .pipe(browserSync.stream());
}));


task('stylesAuth', function() {
    log.info('stylesAuth');
    return buildSingleScss(path.join(conf.paths.src, '/sass/auth.scss'));
});

task('styles404', function() {
    log.info('styles404');
    return buildSingleScss(path.join(conf.paths.src, '/sass/404.scss'));
});

var buildStyles = function() {
    var sassOptions = {
        style: 'expanded'
    };

    var injectFiles = src([
        path.join(conf.paths.src, '/sass/**/_*.scss'),
        '!' + path.join(conf.paths.src, '/sass/theme/conf/**/*.scss'),
        '!' + path.join(conf.paths.src, '/sass/404.scss'),
        '!' + path.join(conf.paths.src, '/sass/auth.scss')
    ], { read: false });

    var injectOptions = {
        transform: function(filePath) {
            filePath = filePath.replace(conf.paths.src + '/sass/', '');
            return '@import "' + filePath + '";';
        },
        starttag: '// injector',
        endtag: '// endinjector',
        addRootSlash: false
    };

    return src([
        path.join(conf.paths.src, '/sass/main.scss')
    ])
        .pipe($.inject(injectFiles, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe($.sourcemaps.init())
        .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
        .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
        .pipe($.sourcemaps.write())
        .pipe(dest(path.join(conf.paths.tmp, '/serve/app/')));
};

/**
 * 创建单一scss文件
 * @param {*} paths 
 */
var buildSingleScss = function(paths) {
    var sassOptions = {
        style: 'expanded'
    };

    return src([paths])
        .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
        .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
        .pipe(dest(path.join(conf.paths.tmp, '/serve/app/')));
};
