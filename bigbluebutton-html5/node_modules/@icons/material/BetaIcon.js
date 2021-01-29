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
    _react2.default.createElement('path', { d: 'M9.23,17.59V23.12H6.88V6.72C6.88,5.27 7.31,4.13 8.16,3.28C9,2.43 10.17,2 11.61,2C13,2 14.07,2.34 14.87,3C15.66,3.68 16.05,4.62 16.05,5.81C16.05,6.63 15.79,7.4 15.27,8.11C14.75,8.82 14.08,9.31 13.25,9.58V9.62C14.5,9.82 15.47,10.27 16.13,11C16.79,11.71 17.12,12.62 17.12,13.74C17.12,15.06 16.66,16.14 15.75,16.97C14.83,17.8 13.63,18.21 12.13,18.21C11.07,18.21 10.1,18 9.23,17.59M10.72,10.75V8.83C11.59,8.72 12.3,8.4 12.87,7.86C13.43,7.31 13.71,6.7 13.71,6C13.71,4.62 13,3.92 11.6,3.92C10.84,3.92 10.25,4.16 9.84,4.65C9.43,5.14 9.23,5.82 9.23,6.71V15.5C10.14,16.03 11.03,16.29 11.89,16.29C12.73,16.29 13.39,16.07 13.86,15.64C14.33,15.2 14.56,14.58 14.56,13.79C14.56,12 13.28,11 10.72,10.75Z' })
  );
};