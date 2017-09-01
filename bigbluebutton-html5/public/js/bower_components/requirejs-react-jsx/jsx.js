define(function () {
  'use strict';

  var isNode = typeof process !== "undefined" &&
    process.versions &&
    !!process.versions.node;

  var buildMap = {};

  function getSourceMapConfig(config) {
    var fallback = config.isBuild ? false : 'inline';

    if (config && config.babel && 'sourceMaps' in config.babel) {
      return config.babel.sourceMaps;
    } else {
      return fallback;
    }
  }

  function babelSync(name, parentRequire, onLoadNative, config) {
    var babel = require.nodeRequire('babel');
    var path = parentRequire.toUrl(ensureJSXFileExtension(name, config));

    try {
      var result = babel.transformFileSync(path, {
        sourceFileName: config.baseUrl + name,
        sourceMaps: getSourceMapConfig(config),
        filename: config.baseUrl + name
      });

      var compiled = result.code;

      if (process.env.running_under_istanbul) {
        var istanbul = require.nodeRequire('istanbul');
        var coverageVariable = Object.keys(global).filter(function (key) { return key.indexOf('$$cov_') === 0 })[0];
        var instrumenter = new istanbul.Instrumenter({
          coverageVariable: coverageVariable,
          noCompact: true,
          embedSource: true
        });

        compiled = instrumenter.instrumentSync(compiled, path);
      }

      buildMap[name] = compiled;

      onLoadNative.fromText(compiled);
    } catch (err) {
      onLoadNative.error(err);
    }
  }

  function babelAsync(name, parentRequire, onLoadNative, config) {
    name = ensureJSXFileExtension(name, config);

    parentRequire(['babel', 'text'], function (babel, text) {
      text.load(name, parentRequire, function (content) {

        try {
          var result = babel.transform(content, {
            sourceFileName: config.baseUrl + name,
            sourceMaps: getSourceMapConfig(config),
            filename: config.baseUrl + name
          });

          onLoadNative.fromText(result.code);
        } catch (err) {
          onLoadNative.error(err);
        }
      });
    });
  }

  function ensureJSXFileExtension(name, config) {
    var fileExtension = config && config.jsx && config.jsx.fileExtension || '.jsx';

    if (name.indexOf(fileExtension) === -1) {
      name = name + fileExtension;
    }

    return name;
  }

  var jsx = {
    load: isNode ? babelSync : babelAsync,

    write: function (pluginName, name, write) {
      if (typeof buildMap[name] === 'string') {
        var text = buildMap[name];

        write.asModule(pluginName + "!" + name, text);
      } else {
        throw new Error('Module not found in build map: ' + name);
      }
    }
  };

  return jsx;
});
