const { series, dest, src, parallel, watch } = require("gulp");
const del = require("del");
const rollup = require("gulp-better-rollup");
const babel = require("rollup-plugin-babel");
const tap = require("gulp-tap");
const gutil = require("gulp-util");
const rename = require("gulp-rename");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const requireUncached = require("require-uncached");
const s3 = require("gulp-s3-upload");
const fs = require("fs");
const template = require('gulp-template');
const sass = require("gulp-sass");
const file = require("gulp-file");
sass.compiler = require("node-sass");
const browserSync = require("browser-sync");
const browser = browserSync.create();
const uglify = require("gulp-uglify")
const cleanCSS = require('gulp-clean-css');
const es = require('event-stream');
const mergeStream = require('merge-stream');
const config = require("./config.json")

const cdnUrl = 'https://interactive.guim.co.uk';

const isDeploy = gutil.env._.indexOf('deploylive') > -1 || gutil.env._.indexOf('deploypreview')
const live = gutil.env._.indexOf('deploylive') > -1

const version = `v/${Date.now()}`;
const s3Path = `atoms/${config.path}`;
const assetPath = isDeploy ? `${cdnUrl}/${s3Path}/assets/${version}` : '../assets';

const clean = () => {
  return del([".build"]);
}

const render = async() => {
    return src("atoms/**/server/render.js")
      .pipe(rename((path) => {
        path.dirname = path.dirname.replace(/server/g, "");
        path.basename = "main";
        path.extname = ".html";
      }))
      .pipe(tap(async(file) => {
        const render = require(file.path.toString().replace(/main.html/g, "server/render.js")).render
        const html = await render();
        file.contents = Buffer.from(html);
      })) 
      .pipe(dest(".build/"));
}

const buildJS = () => {
  return src("atoms/**/client/js/*.js")
    .pipe(rollup({plugins: [
      babel({
        exclude: "node_modules/**",
      }),
      resolve({
        "mainFields": ["module", "main", "jsnext"]
      }),
      commonjs({
        include: "node_modules/**"
      })]},
    "iife"))
    .pipe(rename((path) => {
      path.dirname = path.dirname.replace(/client\/js/g, "");
    }))
    .pipe(template({
      path: assetPath,
      atomPath : `<%= atomPath %>`
    }))
    .pipe(isDeploy ? uglify() : gutil.noop())
    .pipe(dest(".build/"));
}

const buildCSS = () => {
  return src("atoms/**/client/css/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(rename((path) => {
      path.dirname = path.dirname.replace(/client\/css/g, "");
    }))
    .pipe(template({
      path: assetPath,
      atomPath : `<%= atomPath %>`
    }))
    .pipe(isDeploy ? cleanCSS({compatibility: 'ie8'}) : gutil.noop())
    .pipe(dest(".build"))
    .pipe(browser.stream({
      'match': '**/*.css'
    }));
};

const assets = () => {
  return src("assets/*")
    .pipe(dest(".build/assets/"))
}

const generate = (atom) => {
    return src("harness/*")
      .pipe(template(atom))
      .pipe(dest(".build/" + atom.atom))
}

const _template = (x) => {
  return x.replace(/<%= path %>/g, assetPath).replace(/<%= atomPath %>/g, `.`)
}

const local = () => {
  const atoms = (fs.readdirSync(".build")).filter(n => n !== "assets");

  const atomPromises = atoms.map(atom => { 
    const js = _template((fs.readFileSync(`.build/${atom}/main.js`)).toString());
    const css = _template((fs.readFileSync(`.build/${atom}/main.css`)).toString());
    const html = _template((fs.readFileSync(`.build/${atom}/main.html`)).toString());
    
    return src(["harness/*", "!harness/_index.html"])
      .pipe(template({js,css,html,atom}))
      .pipe(dest(".build/" + atom))
  });

  atomPromises.push(src("harness/_index.html")
    .pipe(template({
      atoms
    }))
    .pipe(rename((path) => {
      path.basename = "index";
    }))
    .pipe(dest(".build")))

  return mergeStream(atomPromises)
}

const serve = () => {
  browser.init({
      'server': {
          'baseDir': ".build"
      },
      'port': 8000
  });

  watch(["atoms/**/*", "!**/*.scss"], series(build, local))
  watch("atoms/**/*.scss", series(buildCSS, local))
}

const s3Upload = (cacheControl, keyPrefix) => {
  return s3()({
      'Bucket': 'gdn-cdn',
      'ACL': 'public-read',
      'CacheControl': cacheControl,
      'keyTransform': fn => `${keyPrefix}/${fn}`
  });
}

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

const upload = () => {
  const atoms = (fs.readdirSync(".build")).filter(n => n !== "assets");

  const uploadTasks = atoms.map(atom => {
    const atomConfig = {
      "title": `${config.title} – ${atom}`,
      "docData": "",
      "path": `${config.path}/${atom}`
    }

    return src(`.build/${atom}/*`)
        .pipe(template({
          path: assetPath,
          atomPath : `${cdnUrl}/${s3Path}/${atom}/${version}`
        }))
        .pipe(s3Upload('max-age=31536000', `${s3Path}/${atom}/${version}`))
        .pipe(file('config.json', JSON.stringify(atomConfig)))
        .pipe(file('preview', version))
        .pipe(live ? file('live', version) : gutil.noop())
        .pipe(s3Upload('max-age=30', `${s3Path}/${atom}`))
  });

  uploadTasks.push(
    src(`.build/assets/**/*`)
        .pipe(s3Upload('max-age=31536000', `${s3Path}/assets/${version}`))
  );
  
  return mergeStream(uploadTasks)
}

const url = (cb) => {
  const atoms = (fs.readdirSync(".build")).filter(n => n !== "assets");

  atoms.forEach(atom => {
    gutil.log(gutil.colors.yellow(`${atom} url:`));
    gutil.log(gutil.colors.yellow(`https://content.guardianapis.com/atom/interactive/interactives/${config.path}/${atom}`));
  });

  cb();
}

const build = series(clean, parallel(buildJS, buildCSS, render, assets));
const deploy = series(build, upload)

exports.build = build;
exports.deploylive = deploy;
exports.deploypreview = deploy;
exports.url = url;
exports.default = series(build, local, serve);