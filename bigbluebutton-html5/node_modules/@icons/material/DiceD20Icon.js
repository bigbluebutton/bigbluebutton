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
    _react2.default.createElement('path', { d: 'M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L5,8.09V15.91L12,19.85L19,15.91V8.09L12,4.15M14.93,8.27C16.35,8.27 17.5,9.42 17.5,10.84V13.5C17.5,14.9 16.35,16.05 14.93,16.05C13.5,16.05 12.36,14.9 12.36,13.5V10.84C12.36,9.42 13.51,8.27 14.93,8.27M14.92,9.71C14.34,9.71 13.86,10.18 13.86,10.77V13.53C13.86,14.12 14.34,14.6 14.92,14.6C15.5,14.6 16,14.12 16,13.53V10.77C16,10.18 15.5,9.71 14.92,9.71M11.45,14.76V15.96L6.31,15.93V14.91C6.31,14.91 9.74,11.58 9.75,10.57C9.75,9.33 8.73,9.46 8.73,9.46C8.73,9.46 7.75,9.5 7.64,10.71L6.14,10.76C6.14,10.76 6.18,8.26 8.83,8.26C11.2,8.26 11.23,10.04 11.23,10.5C11.23,12.18 8.15,14.77 8.15,14.77L11.45,14.76Z' })
  );
};