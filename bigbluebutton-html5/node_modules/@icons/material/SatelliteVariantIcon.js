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
    _react2.default.createElement('path', { d: 'M11.62,1L17.28,6.67L15.16,8.79L13.04,6.67L11.62,8.09L13.95,10.41L12.79,11.58L13.24,12.04C14.17,11.61 15.31,11.77 16.07,12.54L12.54,16.07C11.77,15.31 11.61,14.17 12.04,13.24L11.58,12.79L10.41,13.95L8.09,11.62L6.67,13.04L8.79,15.16L6.67,17.28L1,11.62L3.14,9.5L5.26,11.62L6.67,10.21L3.84,7.38C3.06,6.6 3.06,5.33 3.84,4.55L4.55,3.84C5.33,3.06 6.6,3.06 7.38,3.84L10.21,6.67L11.62,5.26L9.5,3.14L11.62,1M18,14C18,16.21 16.21,18 14,18V16C15.1,16 16,15.1 16,14H18M22,14C22,18.42 18.42,22 14,22V20C17.31,20 20,17.31 20,14H22Z' })
  );
};