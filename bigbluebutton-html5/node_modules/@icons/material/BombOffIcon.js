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
    _react2.default.createElement('path', { d: 'M14.5,2.75C12.7,2.75 11.25,4.2 11.25,6H10V7.29C9.31,7.5 8.67,7.81 8.08,8.2L17.79,17.91C18.58,16.76 19,15.39 19,14C19,10.83 16.89,8.15 14,7.29V6H12.75C12.75,5.03 13.53,4.25 14.5,4.25C15.47,4.25 16.25,5.03 16.25,6C16.25,7.24 17.26,8.25 18.5,8.25C19.74,8.25 20.74,7.24 20.74,6V5.25H19.25V6C19.25,6.42 18.91,6.75 18.5,6.75C18.08,6.75 17.75,6.42 17.75,6C17.75,4.2 16.29,2.75 14.5,2.75M3.41,6.36L2,7.77L5.55,11.32C5.2,12.14 5,13.04 5,14C5,17.86 8.13,21 12,21C12.92,21 13.83,20.81 14.68,20.45L18.23,24L19.64,22.59L3.41,6.36Z' })
  );
};