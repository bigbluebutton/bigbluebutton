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
    _react2.default.createElement('path', { d: 'M20.47,14.65C20.47,15.29 20.25,16.36 19.83,17.1C19.4,17.85 19.08,18.06 18.44,18.06C17.7,17.95 16.31,15.82 15.36,15.72C14.18,15.72 11.73,18.17 9.71,18.17C8.54,18.17 8.11,17.95 7.79,17.74C7.15,17.31 6.94,16.67 6.94,15.82C6.94,14.22 8.43,12.84 10.24,12.84C12.59,12.84 14.18,15.18 15.36,15.08C16.31,15.08 18.23,13.16 19.19,13.16C20.15,12.95 20.47,14 20.47,14.65M16.63,5.28C15.57,4.64 14.61,4.32 13.54,3.68C12.91,3.25 12.05,2.3 11.31,1.44C11,2.83 10.78,3.36 10.24,3.79C9.18,4.53 8.64,4.85 7.69,5.28C6.94,5.7 3,8.05 3,13.16C3,18.27 7.37,22 12.05,22C16.85,22 21,18.5 21,13.27C21.21,8.05 17.27,5.7 16.63,5.28Z' })
  );
};