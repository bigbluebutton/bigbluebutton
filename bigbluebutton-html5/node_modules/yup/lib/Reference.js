"use strict";

exports.__esModule = true;
exports.default = void 0;

var _propertyExpr = require("property-expr");

var validateName = function validateName(d) {
  if (typeof d !== 'string') throw new TypeError("ref's must be strings, got: " + d);
};

var Reference =
/*#__PURE__*/
function () {
  Reference.isRef = function isRef(value) {
    return !!(value && (value.__isYupRef || value instanceof Reference));
  };

  var _proto = Reference.prototype;

  _proto.toString = function toString() {
    return "Ref(" + this.key + ")";
  };

  function Reference(key, mapFn, options) {
    if (options === void 0) {
      options = {};
    }

    validateName(key);
    var prefix = options.contextPrefix || '$';

    if (typeof key === 'function') {
      key = '.';
    }

    this.key = key.trim();
    this.prefix = prefix;
    this.isContext = this.key.indexOf(prefix) === 0;
    this.isSelf = this.key === '.';
    this.path = this.isContext ? this.key.slice(this.prefix.length) : this.key;
    this._get = (0, _propertyExpr.getter)(this.path, true);

    this.map = mapFn || function (value) {
      return value;
    };
  }

  _proto.resolve = function resolve() {
    return this;
  };

  _proto.cast = function cast(value, _ref) {
    var parent = _ref.parent,
        context = _ref.context;
    return this.getValue(parent, context);
  };

  _proto.getValue = function getValue(parent, context) {
    var isContext = this.isContext;

    var value = this._get(isContext ? context : parent || context || {});

    return this.map(value);
  };

  return Reference;
}();

exports.default = Reference;
Reference.prototype.__isYupRef = true;
module.exports = exports["default"];