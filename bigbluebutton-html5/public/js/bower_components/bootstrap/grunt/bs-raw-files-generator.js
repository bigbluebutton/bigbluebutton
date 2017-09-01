/*!
 * Bootstrap Grunt task for generating raw-files.min.js for the Customizer
 * http://getbootstrap.com
 * Copyright 2014-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */


const fs = require('fs');
const btoa = require('btoa');
const glob = require('glob');

function getFiles(type) {
  const files = {};
  const recursive = type === 'less';
  const globExpr = recursive ? '/**/*' : '/*';
  glob.sync(type + globExpr)
    .filter(path => type === 'fonts' ? true : new RegExp(`\\.${type}$`).test(path))
    .forEach((fullPath) => {
      const relativePath = fullPath.replace(/^[^/]+\//, '');
      files[relativePath] = type === 'fonts' ? btoa(fs.readFileSync(fullPath)) : fs.readFileSync(fullPath, 'utf8');
    });
  return `var __${type} = ${JSON.stringify(files)}\n`;
}

module.exports = function generateRawFilesJs(grunt, banner) {
  if (!banner) {
    banner = '';
  }
  const dirs = ['js', 'less', 'fonts'];
  const files = banner + dirs.map(getFiles).reduce((combined, file) => combined + file, '');
  const rawFilesJs = 'docs/assets/js/raw-files.min.js';
  try {
    fs.writeFileSync(rawFilesJs, files);
  } catch (err) {
    grunt.fail.warn(err);
  }
  grunt.log.writeln(`File ${rawFilesJs.cyan} created.`);
};
