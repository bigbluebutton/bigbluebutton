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
    _react2.default.createElement('path', { d: 'M20.76,16.34H20.75C21.5,16.77 22,17.58 22,18.5C22,19.88 20.88,21 19.5,21H4.5C3.12,21 2,19.88 2,18.5C2,17.58 2.5,16.77 3.25,16.34H3.24L11,11.86C11,11.86 11,11 12,10C13,10 14,9.1 14,8C14,6.9 13.1,6 12,6C10.9,6 10,6.9 10,8H8C8,5.79 9.79,4 12,4C14.21,4 16,5.79 16,8C16,9.86 14.73,11.42 13,11.87L20.76,16.34M4.5,19V19H19.5V19C19.67,19 19.84,18.91 19.93,18.75C20.07,18.5 20,18.21 19.75,18.07L12,13.59L4.25,18.07C4,18.21 3.93,18.5 4.07,18.75C4.16,18.91 4.33,19 4.5,19Z' })
  );
};