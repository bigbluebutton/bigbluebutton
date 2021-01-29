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
    _react2.default.createElement('path', { d: 'M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M5,9V15H6.25V13H7C8.1,13 9,12.1 9,11C9,9.9 8.1,9 7,9H5M6.25,12V10H6.75C7.3,10 7.75,10.45 7.75,11C7.75,11.55 7.3,12 6.75,12H6.25M9.75,9V15H11V13H11.75L12.41,15H13.73L12.94,12.61C13.43,12.25 13.75,11.66 13.75,11C13.75,9.9 12.85,9 11.75,9H9.75M11,12V10H11.5C12.05,10 12.5,10.45 12.5,11C12.5,11.55 12.05,12 11.5,12H11M17,9C15.62,9 14.5,10.34 14.5,12C14.5,13.66 15.62,15 17,15C18.38,15 19.5,13.66 19.5,12C19.5,10.34 18.38,9 17,9M17,10.25C17.76,10.25 18.38,11.03 18.38,12C18.38,12.97 17.76,13.75 17,13.75C16.24,13.75 15.63,12.97 15.63,12C15.63,11.03 16.24,10.25 17,10.25Z' })
  );
};