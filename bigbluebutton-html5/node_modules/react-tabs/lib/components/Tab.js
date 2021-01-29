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

var DEFAULT_CLASS = 'react-tabs__tab';

var Tab =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(Tab, _Component);

  function Tab() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = Tab.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.checkFocus();
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this.checkFocus();
  };

  _proto.checkFocus = function checkFocus() {
    var _this$props = this.props,
        selected = _this$props.selected,
        focus = _this$props.focus;

    if (selected && focus) {
      this.node.focus();
    }
  };

  _proto.render = function render() {
    var _cx,
        _this = this;

    var _this$props2 = this.props,
        children = _this$props2.children,
        className = _this$props2.className,
        disabled = _this$props2.disabled,
        disabledClassName = _this$props2.disabledClassName,
        focus = _this$props2.focus,
        id = _this$props2.id,
        panelId = _this$props2.panelId,
        selected = _this$props2.selected,
        selectedClassName = _this$props2.selectedClassName,
        tabIndex = _this$props2.tabIndex,
        tabRef = _this$props2.tabRef,
        attributes = _objectWithoutPropertiesLoose(_this$props2, ["children", "className", "disabled", "disabledClassName", "focus", "id", "panelId", "selected", "selectedClassName", "tabIndex", "tabRef"]);

    return _react.default.createElement("li", _extends({}, attributes, {
      className: (0, _classnames.default)(className, (_cx = {}, _cx[selectedClassName] = selected, _cx[disabledClassName] = disabled, _cx)),
      ref: function ref(node) {
        _this.node = node;
        if (tabRef) tabRef(node);
      },
      role: "tab",
      id: id,
      "aria-selected": selected ? 'true' : 'false',
      "aria-disabled": disabled ? 'true' : 'false',
      "aria-controls": panelId,
      tabIndex: tabIndex || (selected ? '0' : null)
    }), children);
  };

  return Tab;
}(_react.Component);

exports.default = Tab;
Tab.defaultProps = {
  className: DEFAULT_CLASS,
  disabledClassName: DEFAULT_CLASS + "--disabled",
  focus: false,
  id: null,
  panelId: null,
  selected: false,
  selectedClassName: DEFAULT_CLASS + "--selected"
};
Tab.propTypes = process.env.NODE_ENV !== "production" ? {
  children: _propTypes.default.oneOfType([_propTypes.default.array, _propTypes.default.object, _propTypes.default.string]),
  className: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.array, _propTypes.default.object]),
  disabled: _propTypes.default.bool,
  tabIndex: _propTypes.default.string,
  disabledClassName: _propTypes.default.string,
  focus: _propTypes.default.bool,
  // private
  id: _propTypes.default.string,
  // private
  panelId: _propTypes.default.string,
  // private
  selected: _propTypes.default.bool,
  // private
  selectedClassName: _propTypes.default.string,
  tabRef: _propTypes.default.func // private

} : {};
Tab.tabsRole = 'Tab';