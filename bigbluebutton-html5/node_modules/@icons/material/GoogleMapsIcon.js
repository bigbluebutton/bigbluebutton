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
    _react2.default.createElement('path', { d: 'M5,4C3.9,4 3,4.9 3,6V16.29L11.18,8.11C11.06,7.59 11,7.07 11,6.53C11,5.62 11.2,4.76 11.59,4H5M18,21C19.1,21 20,20.1 20,19V11.86C19.24,13 18.31,14.21 17.29,15.5L16.5,16.5L15.72,15.5C14.39,13.85 13.22,12.32 12.39,10.91C12.05,10.33 11.76,9.76 11.53,9.18L7.46,13.25L15.21,21H18M3,19C3,20.1 3.9,21 5,21H13.79L6.75,13.96L3,17.71V19M16.5,15C19.11,11.63 21,9.1 21,6.57C21,4.05 19,2 16.5,2C14,2 12,4.05 12,6.57C12,9.1 13.87,11.63 16.5,15M18.5,6.5C18.5,7.6 17.6,8.5 16.5,8.5C15.4,8.5 14.5,7.6 14.5,6.5C14.5,5.4 15.4,4.5 16.5,4.5C17.6,4.5 18.5,5.4 18.5,6.5Z' })
  );
};