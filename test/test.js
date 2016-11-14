'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var cssRebaseUrls = require('../index');

var testPath = path.join(path.resolve('.'), 'css');

var read = function (name) {
  return fs.readFileSync(path.join(__dirname, name));
};

describe('gulp-css-url-rebase', function () {

  it('should assert when root is not specified', function (cb) {

    var stream = cssRebaseUrls();

    stream.on('data', function (file) {
      assert.equal(file.contents.toString('utf8'), read('1/expected.css').toString('utf-8'));
      cb();
    });

    stream.write(new gutil.File({
      base: testPath,
      path: testPath + '/style.css',
      contents: read('1/test.css')
    }));

    stream.end();

  });

  it('should assert when root is specified', function (cb) {

    var stream = cssRebaseUrls({ root: './css' });

    stream.on('data', function (file) {
      assert.equal(file.contents.toString('utf8'), read('2/expected.css').toString('utf-8'));
      cb();
    });

    stream.write(new gutil.File({
      base: testPath,
      path: testPath + '/style.css',
      contents: read('2/test.css')
    }));

    stream.end();

  });

  it('should assert when reroot is specified', function (cb) {

    var stream = cssRebaseUrls({ root: './www', reroot: './www/processed' });

    stream.on('data', function (file) {
      assert.equal(file.contents.toString('utf8'), read('3/expected.css').toString('utf-8'));
      cb();
    });

    stream.write(new gutil.File({
      base: testPath,
      path: testPath + '/style.css',
      contents: read('3/test.css')
    }));

    stream.end();

  });

  it('should url root when specified', function (cb) {

    var stream = cssRebaseUrls({ root: './www', urlRoot: '/' });

    stream.on('data', function (file) {
      assert.equal(file.contents.toString('utf8'), read('4/expected.css').toString('utf-8'));
      cb();
    });

    stream.write(new gutil.File({
      base: testPath,
      path: testPath + '/style.css',
      contents: read('4/test.css')
    }));

    stream.end();

  });

  it('should set url root when specified even with reroot set', function (cb) {

    var stream = cssRebaseUrls({ root: './www', reroot: './wwwprocessed', urlRoot: '/' });

    stream.on('data', function (file) {
      assert.equal(file.contents.toString('utf8'), read('5/expected.css').toString('utf-8'));
      cb();
    });

    stream.write(new gutil.File({
      base: testPath,
      path: testPath + '/style.css',
      contents: read('5/test.css')
    }));

    stream.end();

  });

});
