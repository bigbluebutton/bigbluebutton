"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _isSchema = _interopRequireDefault(require("./util/isSchema"));

var Lazy =
/*#__PURE__*/
function () {
  function Lazy(mapFn) {
    this._resolve = function () {
      var schema = mapFn.apply(void 0, arguments);
      if (!(0, _isSchema.default)(schema)) throw new TypeError('lazy() functions must return a valid schema');
      return schema;
    };
  }

  var _proto = Lazy.prototype;

  _proto.resolve = function resolve(_ref) {
    var value = _ref.value,
        rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["value"]);
    return this._resolve(value, rest);
  };

  _proto.cast = function cast(value, options) {
    return this._resolve(value, options).cast(value, options);
  };

  _proto.validate = function validate(value, options) {
    return this._resolve(value, options).validate(value, options);
  };

  _proto.validateSync = function validateSync(value, options) {
    return this._resolve(value, options).validateSync(value, options);
  };

  _proto.validateAt = function validateAt(path, value, options) {
    return this._resolve(value, options).validateAt(path, value, options);
  };

  _proto.validateSyncAt = function validateSyncAt(path, value, options) {
    return this._resolve(value, options).validateSyncAt(path, value, options);
  };

  return Lazy;
}();

Lazy.prototype.__isYupSchema__ = true;
var _default = Lazy;
exports.default = _default;
module.exports = exports["default"];