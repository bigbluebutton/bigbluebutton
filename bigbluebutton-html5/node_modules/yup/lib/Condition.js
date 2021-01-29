"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _has = _interopRequireDefault(require("lodash/has"));

var _isSchema = _interopRequireDefault(require("./util/isSchema"));

function callOrConcat(schema) {
  if (typeof schema === 'function') return schema;
  return function (base) {
    return base.concat(schema);
  };
}

var Conditional =
/*#__PURE__*/
function () {
  function Conditional(refs, options) {
    var is = options.is,
        then = options.then,
        otherwise = options.otherwise;
    this.refs = [].concat(refs);
    then = callOrConcat(then);
    otherwise = callOrConcat(otherwise);
    if (typeof options === 'function') this.fn = options;else {
      if (!(0, _has.default)(options, 'is')) throw new TypeError('`is:` is required for `when()` conditions');
      if (!options.then && !options.otherwise) throw new TypeError('either `then:` or `otherwise:` is required for `when()` conditions');
      var isFn = typeof is === 'function' ? is : function () {
        for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
          values[_key] = arguments[_key];
        }

        return values.every(function (value) {
          return value === is;
        });
      };

      this.fn = function () {
        for (var _len2 = arguments.length, values = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          values[_key2] = arguments[_key2];
        }

        var currentSchema = values.pop();
        var option = isFn.apply(void 0, values) ? then : otherwise;
        return option(currentSchema);
      };
    }
  }

  var _proto = Conditional.prototype;

  _proto.getValue = function getValue(parent, context) {
    var values = this.refs.map(function (r) {
      return r.getValue(parent, context);
    });
    return values;
  };

  _proto.resolve = function resolve(ctx, values) {
    var schema = this.fn.apply(ctx, values.concat(ctx));
    if (schema !== undefined && !(0, _isSchema.default)(schema)) throw new TypeError('conditions must return a schema object');
    return schema || ctx;
  };

  return Conditional;
}();

var _default = Conditional;
exports.default = _default;
module.exports = exports["default"];