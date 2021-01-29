'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReadabilityIcon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_SIZE = 24;

var ReadabilityIcon = function ReadabilityIcon(_ref) {
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
    _react2.default.createElement('path', { d: 'M12,4C15.15,4 17.81,6.38 18.69,9.65C18,10.15 17.58,10.93 17.5,11.81L17.32,13.91C15.55,13 13.78,12.17 12,12.17C10.23,12.17 8.45,13 6.68,13.91L6.5,11.77C6.42,10.89 6,10.12 5.32,9.61C6.21,6.36 8.86,4 12,4M17.05,17H6.95L6.73,14.47C8.5,13.59 10.24,12.75 12,12.75C13.76,12.75 15.5,13.59 17.28,14.47L17.05,17M5,19V18L3.72,14.5H3.5C2.12,14.5 1,13.38 1,12C1,10.62 2.12,9.5 3.5,9.5C4.82,9.5 5.89,10.5 6,11.81L6.5,18V19H5M19,19H17.5V18L18,11.81C18.11,10.5 19.18,9.5 20.5,9.5C21.88,9.5 23,10.62 23,12C23,13.38 21.88,14.5 20.5,14.5H20.28L19,18V19Z' })
  );
};
exports.ReadabilityIcon = ReadabilityIcon;