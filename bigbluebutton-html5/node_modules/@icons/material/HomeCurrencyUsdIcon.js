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
    _react2.default.createElement('path', { d: 'M12,3L22,12H19V20H5V12H2L12,3M9.22,8.93C8.75,9.4 8.5,10.03 8.5,10.75C8.5,12.43 10.54,13.07 11.76,13.46C13.26,13.93 13.47,14.21 13.5,14.25C13.5,15 12.15,15 12,15V15C11.37,15 11.03,14.88 10.86,14.78C10.67,14.67 10.5,14.5 10.5,14H8.5C8.5,15.43 9.24,16.16 9.85,16.5C10.18,16.7 10.57,16.84 11,16.92V18H13V16.91C14.53,16.61 15.5,15.62 15.5,14.25C15.5,12.67 13.88,12.03 12.36,11.55C10.8,11.06 10.53,10.77 10.5,10.75C10.5,10.5 10.57,10.41 10.64,10.34C10.85,10.13 11.36,10 12,10V10C12.68,10 13.5,10.13 13.5,10.75H15.5C15.5,9.34 14.56,8.37 13,8.09V7H11V8.08C10.26,8.21 9.65,8.5 9.22,8.93Z' })
  );
};