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
    _react2.default.createElement('path', { d: 'M18.5,2C19.33,2 20,2.67 20,3.5C20,4.33 19.33,5 18.5,5C18.27,5 18.05,4.95 17.85,4.85L14.16,8.55L14.5,9C16.69,7.74 19.26,7 22,7L23,7.03V9.04L22,9C19.42,9 17,9.75 15,11.04C15,13.23 13.23,15 11.04,15C9.75,17 9,19.42 9,22L9.04,23H7.03L7,22C7,19.26 7.74,16.69 9,14.5L8.55,14.16L4.85,17.85C4.95,18.05 5,18.27 5,18.5C5,19.33 4.33,20 3.5,20C2.67,20 2,19.33 2,18.5C2,17.67 2.67,17 3.5,17C3.73,17 3.95,17.05 4.15,17.15L7.84,13.45C7.31,12.78 7,11.92 7,11C7,8.79 8.79,7 11,7C11.92,7 12.78,7.31 13.45,7.84L17.15,4.15C17.05,3.95 17,3.73 17,3.5C17,2.67 17.67,2 18.5,2M11,9C9.9,9 9,9.9 9,11C9,12.1 9.9,13 11,13C12.1,13 13,12.1 13,11C13,9.9 12.1,9 11,9Z' })
  );
};