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
    _react2.default.createElement('path', { d: 'M10.59,7.66C10.59,7.66 11.19,7.39 11.57,7.82C11.95,8.26 12.92,9.94 12.92,11.62C12.92,13.3 12.5,15.09 12.05,15.68C11.62,16.28 11.19,16.28 10.86,16.06C10.54,15.85 5.5,12 5.23,11.89C4.95,11.78 4.85,12.05 5.12,13.5C5.39,15 4.95,15.41 4.57,15.47C4.2,15.5 3.06,15.2 3,12.16C2.95,9.13 3.76,8.64 4.14,8.64C4.85,8.64 10.27,13.5 10.64,13.46C10.97,13.41 11.13,11.35 10.5,9.72C9.78,7.96 10.59,7.66 10.59,7.66M19.3,4.63C21.12,8.24 21,11.66 21,12C21,12.34 21.12,15.76 19.3,19.37C19.3,19.37 18.83,19.92 18.12,19.59C17.42,19.26 17.66,18.4 17.66,18.4C17.66,18.4 19.14,15.55 19.1,12.05V12C19.14,8.5 17.66,5.6 17.66,5.6C17.66,5.6 17.42,4.74 18.12,4.41C18.83,4.08 19.3,4.63 19.3,4.63M15.77,6.25C17.26,8.96 17.16,11.66 17.14,12C17.16,12.34 17.26,14.92 15.77,17.85C15.77,17.85 15.3,18.4 14.59,18.07C13.89,17.74 14.13,16.88 14.13,16.88C14.13,16.88 15.09,15.5 15.24,12.05V12C15.14,8.53 14.13,7.23 14.13,7.23C14.13,7.23 13.89,6.36 14.59,6.04C15.3,5.71 15.77,6.25 15.77,6.25Z' })
  );
};