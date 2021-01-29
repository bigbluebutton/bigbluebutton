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
    _react2.default.createElement('path', { d: 'M6,14C6.55,14 7,14.45 7,15C7,15.55 6.55,16 6,16C3.24,16 1,13.76 1,11C1,8.24 3.24,6 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8C21.21,8 23,9.79 23,12C23,14.21 21.21,16 19,16H18C17.45,16 17,15.55 17,15C17,14.45 17.45,14 18,14H19C20.1,14 21,13.1 21,12C21,10.9 20.1,10 19,10H17V9C17,6.24 14.76,4 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8C4.34,8 3,9.34 3,11C3,12.66 4.34,14 6,14M14.83,15.67C16.39,17.23 16.39,19.5 14.83,21.08C14.05,21.86 13,22 12,22C11,22 9.95,21.86 9.17,21.08C7.61,19.5 7.61,17.23 9.17,15.67L12,11L14.83,15.67M13.41,16.69L12,14.25L10.59,16.69C9.8,17.5 9.8,18.7 10.59,19.5C11,19.93 11.5,20 12,20C12.5,20 13,19.93 13.41,19.5C14.2,18.7 14.2,17.5 13.41,16.69Z' })
  );
};