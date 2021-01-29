"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = merge;

var _has = _interopRequireDefault(require("lodash/has"));

var _isSchema = _interopRequireDefault(require("./isSchema"));

var isObject = function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

function merge(target, source) {
  for (var key in source) {
    if ((0, _has.default)(source, key)) {
      var targetVal = target[key],
          sourceVal = source[key];
      if (sourceVal === undefined) continue;

      if ((0, _isSchema.default)(sourceVal)) {
        target[key] = (0, _isSchema.default)(targetVal) ? targetVal.concat(sourceVal) : sourceVal;
      } else if (isObject(sourceVal)) {
        target[key] = isObject(targetVal) ? merge(targetVal, sourceVal) : sourceVal;
      } else if (Array.isArray(sourceVal)) {
        target[key] = Array.isArray(targetVal) ? targetVal.concat(sourceVal) : sourceVal;
      } else target[key] = source[key];
    }
  }

  return target;
}

module.exports = exports["default"];