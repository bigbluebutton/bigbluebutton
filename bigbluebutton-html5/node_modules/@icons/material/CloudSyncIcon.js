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
    _react2.default.createElement('path', { d: 'M12,4C15.64,4 18.67,6.59 19.35,10.04C21.95,10.22 24,12.36 24,15C24,17.76 21.76,20 19,20H6C2.69,20 0,17.31 0,14C0,10.91 2.34,8.36 5.35,8.04C6.6,5.64 9.11,4 12,4M7.5,9.69C6.06,11.5 6.2,14.06 7.82,15.68C8.66,16.5 9.81,17 11,17V18.86L13.83,16.04L11,13.21V15C10.34,15 9.7,14.74 9.23,14.27C8.39,13.43 8.26,12.11 8.92,11.12L7.5,9.69M9.17,8.97L10.62,10.42L12,11.79V10C12.66,10 13.3,10.26 13.77,10.73C14.61,11.57 14.74,12.89 14.08,13.88L15.5,15.31C16.94,13.5 16.8,10.94 15.18,9.32C14.34,8.5 13.19,8 12,8V6.14L9.17,8.97Z' })
  );
};