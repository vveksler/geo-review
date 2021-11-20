const gulp = require("gulp");
const $gp = require("gulp-load-plugins")();

const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
const webpack = require("webpack");
const webpackConfig = require("./webpack.config.js");
const moduleImporter = require("sass-module-importer");
const del = require("del");

const SRC_DIR = "src";
const DIST_DIR = "public/";
const ROOT_PATH = `./${DIST_DIR}`;

// styles
gulp.task("styles", () => {
  return gulp
    .src(`${SRC_DIR}/styles/main.scss`)
    .pipe($gp.plumber())
    .pipe($gp.sassGlob())
    .pipe($gp.sourcemaps.init())
    .pipe(
      $gp.sass({
        outputStyle: "compressed",
        importer: moduleImporter()
      })
    )
    .pipe(
      $gp.autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe($gp.sourcemaps.write())
    .pipe($gp.rename({ suffix: ".min" }))
    .pipe(gulp.dest(`${DIST_DIR}/styles/`))
    .pipe(reload({ stream: true }));
});

gulp.task("clean", () => {
  return del(ROOT_PATH);
});

// JS with webpack
gulp.task("scripts", () => {
  return gulp
    .src(`${SRC_DIR}/scripts/main.js`)
    .pipe($gp.plumber())
    .pipe($gp.webpack(webpackConfig, webpack))
    .pipe(gulp.dest(`${DIST_DIR}/scripts`))
    .pipe(reload({ stream: true }));
});

// server
gulp.task("nodemon", done => {
  let started = false;
  $gp
    .nodemon({
      script: "server.js",
      watch: "server.js"
    })
    .on("start", () => {
      if (started) return;
      done();
      started = true;
    });
});

// dev server + livereload
gulp.task(
  "server",
  gulp.series("nodemon", () => {
    browserSync.init({
      proxy: "http://localhost:3000",
      port: 8080,
      open: false
    });
  })
);

// gulp watcher
gulp.task("watch", () => {
  gulp.watch(`${SRC_DIR}/styles/**/*.scss`, gulp.series("styles"));
  gulp.watch(`${SRC_DIR}/scripts/**/*.js`, gulp.series("scripts"));
  gulp.watch(`views/**/*`).on("change", reload);
});

// GULP:RUN
gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("styles", "scripts"),
    gulp.parallel("watch", "server")
  )
);
