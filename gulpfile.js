'use strict';

var gulp = require('gulp');
var sequence = require('run-sequence');
var path = require('path');
var del = require('del');
var nodemon = require('nodemon');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var cssmin = require('gulp-cssmin');
var mobilizer = require('gulp-mobilizer');
var ngAnnotate = require('gulp-ng-annotate');
var replace = require('gulp-replace');
var streamqueue = require('streamqueue');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var debug = require('gulp-debug');
var concat = require('gulp-concat');

var dir = {
    srv: 'server',
    clisrc: path.join('client', 'src'),
    clibuild: path.join('client', 'www')
};

var cf = {
    js: {
        src: [
            path.join(dir.srv, '**/*.js'),
            path.join(dir.clisrc, '**/*.js')
        ]
    },
    html: {
        src: [
            path.join(dir.clisrc, '**/*.html'),
            '!' + path.join(dir.clisrc, 'vendor/**/*.html')
        ]
    },
    css: {
        src: [
            path.join(dir.clisrc, 'vendor/bootstrap/dist/css/bootstrap.min.css'),
            path.join(dir.clisrc, 'css/**/*.css')
        ]
    },
    less: {
        src: [
            path.join(dir.clisrc, 'less/**/*.less')
        ],
        paths: [
            './src/less'
        ]
    },
    vendor: {
        js: [
            '?'
        ],
        css: {
            prepend: [],
            append: []
        },
        fonts: [
            '?'
        ]
    }
};

gulp.on('error', function(er) {
    throw(er);
});

gulp.task('clean', function() {
    return del([
        path.join(dir.clibuild, '**/*')
    ]).then(function(paths) {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
});
        
gulp.task('images', function() {
    return (
        gulp
            .src(path.join(dir.clisrc, 'images/**/*'))
            .pipe(gulp.dest(path.join(dir.clibuild, 'images')))
    );
});

gulp.task('html', function() {
    var injection = [
        '<script type="text/javascript" src="js/bundle.min.js"></script>'
    ];
    gulp
        .src(cf.html.src)
        .pipe(replace('<!-- inject:js -->', injection.join('\n    ')))
        .pipe(gulp.dest(dir.clibuild));
});

gulp.task('css', function() {
    gulp
        .src(cf.css.src)
//        .pipe(mobilizer(...))
        .pipe(cssmin())
        .pipe(concat('style.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.join(dir.clibuild, 'css')));
});

gulp.task('less', function() {
    gulp
        .src(cf.less.src)
        .pipe(less())
        .pipe(mobilizer('style.css', {
            'app.css': {
                hover: 'exclude',
                screens: ['0px']
            },
            'hover.css': {
                hover: 'only',
                screens: ['0px']
            }
        }))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.join(dir.clibuild, 'css')));
});

gulp.task('lint', function() {
    gulp
        .src(cf.js.src)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('js', function() {
    var b = browserify({
        entries: path.join(dir.clisrc, 'entry.js'),
        debug: true
    });
    return (
        b
            .bundle()
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .on('error', function(e) {
                console.log(e);
            })
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(ngAnnotate())
//            .pipe(uglify())
            .pipe(rename({suffix: '.min'}))
            .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(path.join(dir.clibuild, 'js/')))
    );
});

gulp.task('nodemon', function() {
    nodemon({
        script: path.join(dir.srv, 'server.js'),
        env: {
            'NODE_ENV': 'development'
        }
    });
});

gulp.task('build', function(done) {
    var tasks = [
        'html',
        'images',
        'css',
        'js'
    ];
    sequence('clean', 'lint', tasks, done);
});

gulp.task('serve', function(done) {
    sequence('nodemon', done);
});

gulp.task('default', function(done) {
    sequence('build', 'serve', done);
});
