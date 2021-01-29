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
    _react2.default.createElement('path', { d: 'M19,15.14V21.5C18.97,22.32 18.32,22.97 17.5,23H11C10.62,23 10.26,22.85 10,22.57L5.1,18.37L5.84,17.6C6.03,17.39 6.3,17.28 6.58,17.28H6.8L10,19V9C10,8.45 10.45,8 11,8C11.55,8 12,8.45 12,9V7C12,6.45 12.45,6 13,6C13.55,6 14,6.45 14,7V12L18.15,13.84C18.66,14.07 19,14.58 19,15.14M13,3C15.21,3 17,4.79 17,7C17,8.5 16.2,9.77 15,10.46V9.24C15.61,8.69 16,7.89 16,7C16,5.34 14.66,4 13,4C11.65,4 10.5,4.9 10.13,6.13C8.9,6.5 8,7.65 8,9C8,9.89 8.39,10.69 9,11.24V12.46C7.8,11.77 7,10.5 7,9C7,7.38 7.97,6 9.35,5.35C10,3.97 11.38,3 13,3M13,1C16.31,1 19,3.69 19,7C19,9.06 17.96,10.88 16.38,11.96L15.26,11.46C16.89,10.64 18,8.95 18,7C18,4.24 15.76,2 13,2C11.11,2 9.46,3.05 8.61,4.61C7.05,5.46 6,7.11 6,9C6,11.05 7.23,12.81 9,13.58V14.66C6.67,13.83 5,11.61 5,9C5,6.83 6.15,4.93 7.88,3.88C8.93,2.15 10.83,1 13,1Z' })
  );
};