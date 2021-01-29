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
    _react2.default.createElement('path', { d: 'M13,9.86V11.18L15,13.18V9.86C17.14,9.31 18.43,7.13 17.87,5C17.32,2.85 15.14,1.56 13,2.11C10.86,2.67 9.57,4.85 10.13,7C10.5,8.4 11.59,9.5 13,9.86M14,4C15.1,4 16,4.9 16,6C16,7.1 15.1,8 14,8C12.9,8 12,7.1 12,6C12,4.9 12.9,4 14,4M18.73,22L14.86,18.13C14.21,20.81 11.5,22.46 8.83,21.82C6.6,21.28 5,19.29 5,17V12L10,17H7C7,18.66 8.34,20 10,20C11.66,20 13,18.66 13,17V16.27L2,5.27L3.28,4L13,13.72L15,15.72L20,20.72L18.73,22Z' })
  );
};