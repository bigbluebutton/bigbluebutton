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
    _react2.default.createElement('path', { d: 'M9.5,9C8.67,9 8,9.67 8,10.5C8,11.33 8.67,12 9.5,12C10.33,12 11,11.33 11,10.5C11,9.67 10.33,9 9.5,9M14.5,9C13.67,9 13,9.67 13,10.5C13,11.33 13.67,12 14.5,12C15.33,12 16,11.33 16,10.5C16,9.67 15.33,9 14.5,9M12,4L12.68,4.03C13.62,3.24 14.82,2.59 15.72,2.35C17.59,1.85 20.88,2.23 21.31,3.83C21.62,5 20.6,6.45 19.03,7.38C20.26,8.92 21,10.87 21,13C21,17.97 16.97,22 12,22C7.03,22 3,17.97 3,13C3,10.87 3.74,8.92 4.97,7.38C3.4,6.45 2.38,5 2.69,3.83C3.12,2.23 6.41,1.85 8.28,2.35C9.18,2.59 10.38,3.24 11.32,4.03L12,4M10,16C10.55,16 11,16.45 11,17C11,17.55 10.55,18 10,18C9.45,18 9,17.55 9,17C9,16.45 9.45,16 10,16M14,16C14.55,16 15,16.45 15,17C15,17.55 14.55,18 14,18C13.45,18 13,17.55 13,17C13,16.45 13.45,16 14,16M12,13C9.24,13 7,15.34 7,17C7,18.66 9.24,20 12,20C14.76,20 17,18.66 17,17C17,15.34 14.76,13 12,13M7.76,4.28C7.31,4.16 4.59,4.35 4.59,4.35C4.59,4.35 6.8,6.1 7.24,6.22C7.69,6.34 9.77,6.43 9.91,5.9C10.06,5.36 8.2,4.4 7.76,4.28M16.24,4.28C15.8,4.4 13.94,5.36 14.09,5.9C14.23,6.43 16.31,6.34 16.76,6.22C17.2,6.1 19.41,4.35 19.41,4.35C19.41,4.35 16.69,4.16 16.24,4.28Z' })
  );
};