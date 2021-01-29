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
    _react2.default.createElement('path', { d: 'M15,15.5C15,16.88 13.88,18 12.5,18C11.12,18 10,16.88 10,15.5V13.75C10,13.34 10.34,13 10.75,13C11.16,13 11.5,13.34 11.5,13.75V15.5C11.5,16.05 11.95,16.5 12.5,16.5C13.05,16.5 13.5,16.05 13.5,15.5V11.89C12.63,11.61 12,10.87 12,10C12,8.9 13,8 14.25,8C15.5,8 16.5,8.9 16.5,10C16.5,10.87 15.87,11.61 15,11.89V15.5M8.25,8C9.5,8 10.5,8.9 10.5,10C10.5,10.87 9.87,11.61 9,11.89V17.25C9,19.04 10.46,20.5 12.25,20.5C14.04,20.5 15.5,19.04 15.5,17.25V13.75C15.5,13.34 15.84,13 16.25,13C16.66,13 17,13.34 17,13.75V17.25C17,19.87 14.87,22 12.25,22C9.63,22 7.5,19.87 7.5,17.25V11.89C6.63,11.61 6,10.87 6,10C6,8.9 7,8 8.25,8M10.06,6.13L9.63,7.59C9.22,7.37 8.75,7.25 8.25,7.25C7.34,7.25 6.53,7.65 6.03,8.27L4.83,7.37C5.46,6.57 6.41,6 7.5,5.81V5.75C7.5,3.68 9.18,2 11.25,2C13.32,2 15,3.68 15,5.75V5.81C16.09,6 17.04,6.57 17.67,7.37L16.47,8.27C15.97,7.65 15.16,7.25 14.25,7.25C13.75,7.25 13.28,7.37 12.87,7.59L12.44,6.13C12.77,6 13.13,5.87 13.5,5.81V5.75C13.5,4.5 12.5,3.5 11.25,3.5C10,3.5 9,4.5 9,5.75V5.81C9.37,5.87 9.73,6 10.06,6.13M14.25,9.25C13.7,9.25 13.25,9.59 13.25,10C13.25,10.41 13.7,10.75 14.25,10.75C14.8,10.75 15.25,10.41 15.25,10C15.25,9.59 14.8,9.25 14.25,9.25M8.25,9.25C7.7,9.25 7.25,9.59 7.25,10C7.25,10.41 7.7,10.75 8.25,10.75C8.8,10.75 9.25,10.41 9.25,10C9.25,9.59 8.8,9.25 8.25,9.25Z' })
  );
};