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
    _react2.default.createElement('path', { d: 'M2,5.27L3.28,4L20,20.72L18.73,22L16,19.26C15.86,21.35 14.12,23 12,23C9.79,23 8,21.21 8,19V18H7L6.16,9.82C5.82,9.47 5.53,9.06 5.33,8.6L2,5.27M9,3C11.21,3 13,4.79 13,7H8.82L6.08,4.26C6.81,3.5 7.85,3 9,3M11.84,9.82L11.82,10L9.82,8H12.87C12.69,8.7 12.33,9.32 11.84,9.82M11,18H10V19C10,20.1 10.9,21 12,21C13.1,21 14,20.1 14,19V17.27L11.35,14.62L11,18M18,10H20L19,11L20,12H18C16.9,12 16,12.9 16,14V14.18L14.3,12.5C14.9,11 16.33,10 18,10M8,12C8,12.55 8.45,13 9,13C9.21,13 9.4,12.94 9.56,12.83L8.17,11.44C8.06,11.6 8,11.79 8,12Z' })
  );
};