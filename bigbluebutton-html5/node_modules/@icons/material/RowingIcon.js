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
    _react2.default.createElement('path', { d: 'M8.5,14.5L4,19L5.5,20.5L9,17H11L8.5,14.5M15,1C13.9,1 13,1.9 13,3C13,4.1 13.9,5 15,5C16.1,5 17,4.1 17,3C17,1.9 16.1,1 15,1M21,21L18,24L15,21V19.5L7.91,12.41C7.6,12.46 7.3,12.5 7,12.5V10.32C8.66,10.35 10.61,9.45 11.67,8.28L13.07,6.73C13.26,6.5 13.5,6.35 13.76,6.23C14.05,6.09 14.38,6 14.72,6H14.75C16,6 17,7 17,8.26V14C17,14.85 16.65,15.62 16.08,16.17L12.5,12.59V10.32C11.87,10.84 11.07,11.34 10.21,11.71L16.5,18H18L21,21Z' })
  );
};