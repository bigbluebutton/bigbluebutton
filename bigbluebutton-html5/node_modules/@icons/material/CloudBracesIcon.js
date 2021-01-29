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
    _react2.default.createElement('path', { d: 'M6,20C2.69,20 0,17.31 0,14C0,10.91 2.34,8.36 5.35,8.04C6.6,5.64 9.11,4 12,4C15.63,4 18.66,6.58 19.35,10C21.95,10.19 24,12.36 24,15C24,17.76 21.76,20 19,20H6M18.5,12H18C17.45,12 17,11.55 17,11V10C17,8.9 16.1,8 15,8H13.5V10H15V11C15,12.1 15.9,13 17,13C15.9,13 15,13.9 15,15V16H13.5V18H15C16.1,18 17,17.1 17,16V15C17,14.45 17.45,14 18,14H18.5V12M5.5,12V14H6C6.55,14 7,14.45 7,15V16C7,17.1 7.9,18 9,18H10.5V16H9V15C9,13.9 8.1,13 7,13C8.1,13 9,12.1 9,11V10H10.5V8H9C7.9,8 7,8.9 7,10V11C7,11.55 6.55,12 6,12H5.5Z' })
  );
};