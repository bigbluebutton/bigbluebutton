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
    _react2.default.createElement('path', { d: 'M5.5,2C4.12,2 3,3.12 3,4.5V5C2.45,5 2,5.45 2,6V10C2,10.55 2.45,11 3,11H8C8.55,11 9,10.55 9,10V6C9,5.45 8.55,5 8,5V4.5C8,3.12 6.88,2 5.5,2M5.5,3C6.33,3 7,3.67 7,4.5V5H4V4.5C4,3.67 4.67,3 5.5,3M19.66,3C19.4,3 19.16,3.09 18.97,3.28L17.13,5.13L20.88,8.88L22.72,7.03C23.11,6.64 23.11,6 22.72,5.63L20.38,3.28C20.18,3.09 19.91,3 19.66,3M16.06,6.19L5,17.25V21H8.75L19.81,9.94L16.06,6.19Z' })
  );
};