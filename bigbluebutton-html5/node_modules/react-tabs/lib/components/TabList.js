"use strict";

exports.__esModule = true;
exports.default = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var TabList =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(TabList, _Component);

  function TabList() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = TabList.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        children = _this$props.children,
        className = _this$props.className,
        attributes = _objectWithoutPropertiesLoose(_this$props, ["children", "className"]);

    return _react.default.createElement("ul", _extends({}, attributes, {
      className: (0, _classnames.default)(className),
      role: "tablist"
    }), children);
  };

  return TabList;
}(_react.Component);

exports.default = TabList;
TabList.defaultProps = {
  className: 'react-tabs__tab-list'
};
TabList.propTypes = process.env.NODE_ENV !== "production" ? {
  children: _propTypes.default.oneOfType([_propTypes.default.object, _propTypes.default.array]),
  className: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.array, _propTypes.default.object])
} : {};
TabList.tabsRole = 'TabList';