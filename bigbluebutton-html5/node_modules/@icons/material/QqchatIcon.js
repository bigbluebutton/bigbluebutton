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
    _react2.default.createElement('path', { d: 'M3.18,13.54C3.76,12.16 4.57,11.14 5.17,10.92C5.16,10.12 5.31,9.62 5.56,9.22C5.56,9.19 5.5,8.86 5.72,8.45C5.87,4.85 8.21,2 12,2C15.79,2 18.13,4.85 18.28,8.45C18.5,8.86 18.44,9.19 18.44,9.22C18.69,9.62 18.84,10.12 18.83,10.92C19.43,11.14 20.24,12.16 20.82,13.55C21.57,15.31 21.69,17 21.09,17.3C20.68,17.5 20.03,17 19.42,16.12C19.18,17.1 18.58,18 17.73,18.71C18.63,19.04 19.21,19.58 19.21,20.19C19.21,21.19 17.63,22 15.69,22C13.93,22 12.5,21.34 12.21,20.5H11.79C11.5,21.34 10.07,22 8.31,22C6.37,22 4.79,21.19 4.79,20.19C4.79,19.58 5.37,19.04 6.27,18.71C5.42,18 4.82,17.1 4.58,16.12C3.97,17 3.32,17.5 2.91,17.3C2.31,17 2.43,15.31 3.18,13.54Z' })
  );
};