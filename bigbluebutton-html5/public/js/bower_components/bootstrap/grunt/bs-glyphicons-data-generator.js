/*!
 * Bootstrap Grunt task for Glyphicons data generation
 * http://getbootstrap.com
 * Copyright 2014-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */


const fs = require('fs');

module.exports = function generateGlyphiconsData(grunt) {
  // Pass encoding, utf8, so `readFileSync` will return a string instead of a
  // buffer
  const glyphiconsFile = fs.readFileSync('less/glyphicons.less', 'utf8');
  const glyphiconsLines = glyphiconsFile.split('\n');

  // Use any line that starts with ".glyphicon-" and capture the class name
  const iconClassName = /^\.(glyphicon-[a-zA-Z0-9-]+)/;
  let glyphiconsData = '# This file is generated via Grunt task. **Do not edit directly.**\n' +
                       '# See the \'build-glyphicons-data\' task in Gruntfile.js.\n\n';
  const glyphiconsYml = 'docs/_data/glyphicons.yml';
  for (let i = 0, len = glyphiconsLines.length; i < len; i++) {
    const match = glyphiconsLines[i].match(iconClassName);

    if (match !== null) {
      glyphiconsData += `- ${match[1]}\n`;
    }
  }

  // Create the `_data` directory if it doesn't already exist
  if (!fs.existsSync('docs/_data')) {
    fs.mkdirSync('docs/_data');
  }

  try {
    fs.writeFileSync(glyphiconsYml, glyphiconsData);
  } catch (err) {
    grunt.fail.warn(err);
  }
  grunt.log.writeln(`File ${glyphiconsYml.cyan} created.`);
};
