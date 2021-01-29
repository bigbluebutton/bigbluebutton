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
    _react2.default.createElement('path', { d: 'M13,16.2C12.2,16.2 11.43,15.86 10.88,15.28L9.93,18.5L9.86,18.69L9.83,18.67C9.64,19 9.29,19.2 8.9,19.2C8.29,19.2 7.8,18.71 7.8,18.1C7.8,18.05 7.81,18 7.81,17.95H7.8L7.85,17.77L9.7,12.21C9.7,12.21 9.5,11.59 9.5,10.73C9.5,9 10.42,8.5 11.16,8.5C11.91,8.5 12.58,8.76 12.58,9.81C12.58,11.15 11.69,11.84 11.69,12.81C11.69,13.55 12.29,14.16 13.03,14.16C15.37,14.16 16.2,12.4 16.2,10.75C16.2,8.57 14.32,6.8 12,6.8C9.68,6.8 7.8,8.57 7.8,10.75C7.8,11.42 8,12.09 8.34,12.68C8.43,12.84 8.5,13 8.5,13.2C8.5,13.75 8.05,14.2 7.5,14.2C7.13,14.2 6.79,14 6.62,13.7C6.08,12.81 5.8,11.79 5.8,10.75C5.8,7.47 8.58,4.8 12,4.8C15.42,4.8 18.2,7.47 18.2,10.75C18.2,13.37 16.57,16.2 13,16.2M20,2H4C2.89,2 2,2.89 2,4V20C2,21.1 2.9,22 4,22H20C21.1,22 22,21.1 22,20V4C22,2.89 21.1,2 20,2Z' })
  );
};