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
    _react2.default.createElement('path', { d: 'M10.23,11.16L12.91,10.27L13.77,12.84L11.09,13.73L10.23,11.16M17.69,13.71C18.23,13.53 18.5,12.94 18.34,12.4C18.16,11.86 17.57,11.56 17.03,11.75L15.73,12.18L14.87,9.61L16.17,9.17C16.71,9 17,8.4 16.82,7.86C16.64,7.32 16.05,7 15.5,7.21L14.21,7.64L13.76,6.3C13.58,5.76 13,5.46 12.45,5.65C11.91,5.83 11.62,6.42 11.8,6.96L12.25,8.3L9.57,9.19L9.12,7.85C8.94,7.31 8.36,7 7.81,7.2C7.27,7.38 7,7.97 7.16,8.5L7.61,9.85L6.31,10.29C5.77,10.47 5.5,11.06 5.66,11.6C5.8,12 6.19,12.3 6.61,12.31L6.97,12.25L8.27,11.82L9.13,14.39L7.83,14.83C7.29,15 7,15.6 7.18,16.14C7.32,16.56 7.71,16.84 8.13,16.85L8.5,16.79L9.79,16.36L10.24,17.7C10.38,18.13 10.77,18.4 11.19,18.41L11.55,18.35C12.09,18.17 12.38,17.59 12.2,17.04L11.75,15.7L14.43,14.81L14.88,16.15C15,16.57 15.41,16.84 15.83,16.85L16.19,16.8C16.73,16.62 17,16.03 16.84,15.5L16.39,14.15L17.69,13.71M21.17,9.25C23.23,16.12 21.62,19.1 14.75,21.17C7.88,23.23 4.9,21.62 2.83,14.75C0.77,7.88 2.38,4.9 9.25,2.83C16.12,0.77 19.1,2.38 21.17,9.25Z' })
  );
};