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
    _react2.default.createElement('path', { d: 'M6,14C6.55,14 7,14.45 7,15C7,15.55 6.55,16 6,16C3.24,16 1,13.76 1,11C1,8.24 3.24,6 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8C21.21,8 23,9.79 23,12C23,14.21 21.21,16 19,16H18C17.45,16 17,15.55 17,15C17,14.45 17.45,14 18,14H19C20.1,14 21,13.1 21,12C21,10.9 20.1,10 19,10H17V9C17,6.24 14.76,4 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8C4.34,8 3,9.34 3,11C3,12.66 4.34,14 6,14M10,18C11.1,18 12,18.9 12,20C12,21.1 11.1,22 10,22C8.9,22 8,21.1 8,20C8,18.9 8.9,18 10,18M14.5,16C15.33,16 16,16.67 16,17.5C16,18.33 15.33,19 14.5,19C13.67,19 13,18.33 13,17.5C13,16.67 13.67,16 14.5,16M10.5,12C11.33,12 12,12.67 12,13.5C12,14.33 11.33,15 10.5,15C9.67,15 9,14.33 9,13.5C9,12.67 9.67,12 10.5,12Z' })
  );
};