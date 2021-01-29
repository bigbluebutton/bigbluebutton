"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CloseButton(_ref) {
  var closeToast = _ref.closeToast,
      type = _ref.type,
      ariaLabel = _ref.ariaLabel;
  return _react.default.createElement("button", {
    className: "Toastify__close-button Toastify__close-button--" + type,
    type: "button",
    onClick: closeToast,
    "aria-label": ariaLabel
  }, "\u2716");
}

CloseButton.propTypes = {
  closeToast: _propTypes.default.func,
  arialLabel: _propTypes.default.string
};
CloseButton.defaultProps = {
  ariaLabel: 'close'
};
var _default = CloseButton;
exports.default = _default;