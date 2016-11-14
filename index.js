'use strict';

var path = require('path');
var rework = require('rework');
var reworkUrl = require('rework-plugin-url');
var through = require('through2');
var validator = require('validator');
var url = require('url');

var isAbsolute = function (p) {
  var normal = path.normalize(p);
  var absolute = path.resolve(p);
  if (process.platform === 'win32') {
    absolute = absolute.substr(2);
  }
  return normal === absolute;
};

var isUrl = function (url) {
  if (!url) { return false; }

  // protocol relative URLs
  if (url.indexOf('//') === 0 && validator.isURL(url, { allow_protocol_relative_urls: true })) {
    return true;
  }

  return validator.isURL(url, { require_protocol: true });
};

var rebaseUrls = function (css, options) {
  return rework(css)
    .use(reworkUrl(function (cssUrl) {
      if (isAbsolute(cssUrl) || isUrl(cssUrl) || /^(data:.*;.*,)/.test(cssUrl)) {
        return cssUrl;
      }

      var absolutePath = path.join(options.currentDir, cssUrl);
      var p = path.relative(options.root, absolutePath);

      if (process.platform === 'win32') {
        p = p.replace(/\\/g, '/');
      }

      p = url.resolve(options.urlRoot, p);

      return p;
    })).toString();
};

module.exports = function (options) {
  options = options || {};
  var root = options.root || '.';
  var reroot = options.reroot || '';
  var urlRoot = options.urlRoot || '';

  return through.obj(function (file, enc, cb) {
    var fileDir = path.dirname(file.path);
    var rerootPath = '';

    // Allows placing the processed CSS in a different root directory while
    // leaving image resources alone.
    if (reroot) {
      rerootPath = path.join(
        path.relative(root, reroot),
        path.relative(root, fileDir)
      );
    }

    var css = rebaseUrls(file.contents.toString(), {
      currentDir: fileDir,
      root: path.join(file.cwd, root, rerootPath),
      urlRoot: urlRoot
    });

    file.contents = new Buffer(css);

    this.push(file);
    cb();
  });
};
