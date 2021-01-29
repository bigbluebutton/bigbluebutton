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
    _react2.default.createElement('path', { d: 'M13.5,12C12.67,12 12,12.67 12,13.5C12,14.33 12.67,15 13.5,15C14.33,15 15,14.33 15,13.5C15,12.67 14.33,12 13.5,12M13.5,3C18.19,3 22,6.58 22,11C22,12.62 22,14 21.09,16C17,16 16,20 12.5,20C10.32,20 9.27,18.28 9.05,16H9L8.24,16L6.96,20.3C6.81,20.79 6.33,21.08 5.84,21H3C2.45,21 2,20.55 2,20C2,19.45 2.45,19 3,19V16C2.45,16 2,15.55 2,15C2,14.45 2.45,14 3,14H6.75L7.23,12.39C6.72,12.14 6.13,12 5.5,12H5.07L5,11C5,6.58 8.81,3 13.5,3M5,16V19H5.26L6.15,16H5Z' })
  );
};