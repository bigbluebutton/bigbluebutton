'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_SIZE = 24;

exports.default = function (_ref) {
  var _ref$fill = _ref.fill,
      fill = _ref$fill === undefined ? 'currentColor' : _ref$fill,
      _ref$width = _ref.width,
      width = _ref$width === undefined ? DEFAULT_SIZE : _ref$width,
      _ref$height = _ref.height,
      height = _ref$height === undefined ? DEFAULT_SIZE : _ref$height,
      _ref$style = _ref.style,
      style = _ref$style === undefined ? {} : _ref$style,
      props = _objectWithoutProperties(_ref, ['fill', 'width', 'height', 'style']);

  return _react2.default.createElement(
    'svg',
    _extends({
      viewBox: '0 0 ' + DEFAULT_SIZE + ' ' + DEFAULT_SIZE,
      style: _extends({ fill: fill, width: width, height: height }, style)
    }, props),
    _react2.default.createElement('path', { d: 'M2.2,9.76H4.44V11.94H2.2V9.76H2.2M4.95,9.76H7.2V11.94H4.95V9.76H4.95M4.95,6.96H7.2V9.14H4.95V6.96M7.71,9.76H9.95V11.94H7.71V9.76H7.71M7.71,6.96H9.95V9.14H7.71V6.96M10.46,9.76H12.71V11.94H10.46V9.76H10.46M10.46,6.96H12.71V9.14H10.46V6.96M13.22,9.76H15.46V11.94H13.22V9.76H13.22M10.46,4.16H12.71V6.34H10.46V4.16M5.33,15.09C5.68,15.09 5.96,15.36 5.96,15.7C5.96,16.03 5.68,16.31 5.33,16.31C5,16.31 4.71,16.03 4.71,15.7C4.71,15.36 5,15.09 5.33,15.09M22.69,10.89V10.89L23,11.06L22.84,11.37C22.2,12.58 20.87,12.95 19.57,12.89C17.62,17.6 13.37,19.84 8.23,19.84C5.57,19.84 3.13,18.87 1.74,16.58L1.72,16.54L1.5,16.14C1.05,15.13 0.89,14.03 1,12.92L1.03,12.59H15.8C16.33,12.59 16.87,12.5 17.36,12.34L18.12,12C17.81,11.6 17.64,11.09 17.6,10.59C17.53,9.91 17.67,9 18.15,8.5L18.39,8.22L18.67,8.44C19.38,9 19.97,9.77 20.08,10.65C20.93,10.41 21.94,10.46 22.69,10.89M5.34,16.85V16.85C6,16.85 6.5,16.33 6.5,15.7C6.5,15.06 6,14.54 5.33,14.54C4.68,14.54 4.15,15.06 4.15,15.7C4.15,16.34 4.68,16.85 5.34,16.85Z' })
  );
};