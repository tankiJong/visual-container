// generated on 2016-08-06 using generator-webapp 2.1.0
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const conf = require('./gulp/conf');
const wiredep = require('wiredep').stream;
const wpConfig = require('./webpack.config');
const webpack = require('webpack');
const $ = gulpLoadPlugins();
const reload = browserSync.reload;


function extend(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function(source) {
    for (var prop in source) {
      target[prop] = source[prop];
    }
  });

  return target;
}


var DEFAULT_ENV = {
  APP_ENV: '"local"',
  WIDGET_ID: '"38cf7132"',
  WIDGET_JS: '"widget.daovoice.co/widget/38cf7132.js"',
  API_URL: '"http://192.168.2.142:10000"',
  RTM_URL: '"http://rtm.daovoice.co"',
  DAO_AUTH: '"http://account.daocloud.co/signin"',
  AUTH_SIGN_UP: '"http://account.daocloud.co/signup"',
  AUTH_SIGN_IN: '"http://account.daocloud.co/signin"',
  AUTH_LOG_OUT: '"http://account.daocloud.co/logout"',
  COOKIE_DOMAIN: '"localhost"',
  SENTRY_JS: '"https://e5cba35e05984ff1ab70e683fc6b019f@app.getsentry.com/63006"',
  PRICING_URL: '"http://management-api.daovoice.co/plans-api/v1"',
};


console.log(wpConfig, $.webpack);
var CURRENT_ENV = extend({}, DEFAULT_ENV);

Object.keys(CURRENT_ENV)
.forEach(function(k) {
  if (process.env[k]) {
    CURRENT_ENV[k] = JSON.stringify(process.env[k]);
  }
});

wpConfig.plugins = [
  new webpack.DefinePlugin({
    'process.env': CURRENT_ENV,
  }),
  new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn|en/),
];

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('app/scripts/main.js')
    .pipe($.plumber())
    .pipe($.webpack(wpConfig))
    .pipe(gulp.dest('.tmp/scripts/'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    // .pipe($.eslint(options))
    // .pipe($.eslint.format())
    // .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
      mocha: true
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/font/**/*'))
    .pipe(gulp.dest('.tmp/font'))
    .pipe(gulp.dest('dist/font'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/images/**/*',
    '.tmp/font/**/*'
  ]).on('change', reload);

  gulp.watch('app/**/*.scss', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/scripts/**/*.vue', ['scripts']);
  gulp.watch('app/**/*.md', ['scripts']);
  gulp.watch('changelog.md', ['scripts']);
  gulp.watch('app/**/*.html', ['scripts']);
  gulp.watch('app/font/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', ['html', 'images', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      exclude: ['bootstrap-sass'],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
