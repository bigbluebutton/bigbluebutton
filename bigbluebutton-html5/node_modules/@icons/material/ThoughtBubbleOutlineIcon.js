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
    _react2.default.createElement('path', { d: 'M3.5,19C4.33,19 5,19.67 5,20.5C5,21.33 4.33,22 3.5,22C2.67,22 2,21.33 2,20.5C2,19.67 2.67,19 3.5,19M8.5,16C9.88,16 11,17.12 11,18.5C11,19.88 9.88,21 8.5,21C7.12,21 6,19.88 6,18.5C6,17.12 7.12,16 8.5,16M14.5,15C13.31,15 12.23,14.5 11.5,13.65C10.77,14.5 9.69,15 8.5,15C6.54,15 4.91,13.59 4.57,11.74C3.07,11.16 2,9.7 2,8C2,5.79 3.79,4 6,4L6.77,4.07C7.5,3.41 8.45,3 9.5,3C10.69,3 11.77,3.5 12.5,4.35C13.23,3.5 14.31,3 15.5,3C17.46,3 19.09,4.41 19.43,6.26C20.93,6.84 22,8.3 22,10C22,12.21 20.21,14 18,14L17.23,13.93C16.5,14.59 15.55,15 14.5,15M6,6C4.9,6 4,6.9 4,8C4,9.1 4.9,10 6,10C6.33,10 6.64,9.92 6.92,9.78C6.66,10.12 6.5,10.54 6.5,11C6.5,12.1 7.4,13 8.5,13C9.1,13 9.64,12.73 10,12.31V12.31L11.47,10.63L13,12.34V12.34C13.38,12.74 13.91,13 14.5,13C15.5,13 16.33,12.26 16.5,11.3C16.84,11.73 17.39,12 18,12C19.1,12 20,11.1 20,10C20,8.9 19.1,8 18,8C17.67,8 17.36,8.08 17.08,8.22C17.34,7.88 17.5,7.46 17.5,7C17.5,5.9 16.6,5 15.5,5C14.91,5 14.38,5.26 14,5.66L12.47,7.37L11,5.69V5.69C10.64,5.27 10.1,5 9.5,5C8.5,5 7.67,5.74 7.5,6.7C7.16,6.27 6.61,6 6,6M8.5,17.5C7.95,17.5 7.5,17.95 7.5,18.5C7.5,19.05 7.95,19.5 8.5,19.5C9.05,19.5 9.5,19.05 9.5,18.5C9.5,17.95 9.05,17.5 8.5,17.5Z' })
  );
};