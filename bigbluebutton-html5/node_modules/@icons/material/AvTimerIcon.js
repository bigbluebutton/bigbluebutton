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
    _react2.default.createElement('path', { d: 'M11,17C11,17.55 11.45,18 12,18C12.55,18 13,17.55 13,17C13,16.45 12.55,16 12,16C11.45,16 11,16.45 11,17M11,3V7H13V5.08C16.39,5.57 19,8.47 19,12C19,15.87 15.87,19 12,19C8.13,19 5,15.87 5,12C5,10.32 5.59,8.78 6.58,7.58L12,13L13.41,11.59L6.61,4.79V4.81C4.42,6.45 3,9.05 3,12C3,16.97 7.03,21 12,21C16.97,21 21,16.97 21,12C21,7.03 16.97,3 12,3M18,12C18,11.45 17.55,11 17,11C16.45,11 16,11.45 16,12C16,12.55 16.45,13 17,13C17.55,13 18,12.55 18,12M6,12C6,12.55 6.45,13 7,13C7.55,13 8,12.55 8,12C8,11.45 7.55,11 7,11C6.45,11 6,11.45 6,12Z' })
  );
};