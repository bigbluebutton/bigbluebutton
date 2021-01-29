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
    _react2.default.createElement('path', { d: 'M16,12V16C16,16.55 15.55,17 15,17C14.83,17 14.67,17 14.06,16.5C13.44,16 12.39,15 11.31,14.5C10.31,14.04 9.28,14 8.26,14L9.47,17.32L9.5,17.5C9.5,17.78 9.28,18 9,18H7C6.78,18 6.59,17.86 6.53,17.66L5.19,14H5C4.45,14 4,13.55 4,13C2.9,13 2,12.1 2,11C2,9.9 2.9,9 4,9C4,8.45 4.45,8 5,8H8C9.11,8 10.22,8 11.31,7.5C12.39,7 13.44,6 14.06,5.5C14.67,5 14.83,5 15,5C15.55,5 16,5.45 16,6V10C16.55,10 17,10.45 17,11C17,11.55 16.55,12 16,12M21,11C21,12.38 20.44,13.63 19.54,14.54L18.12,13.12C18.66,12.58 19,11.83 19,11C19,10.17 18.66,9.42 18.12,8.88L19.54,7.46C20.44,8.37 21,9.62 21,11Z' })
  );
};