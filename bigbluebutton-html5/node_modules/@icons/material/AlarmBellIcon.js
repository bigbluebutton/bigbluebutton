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
    _react2.default.createElement('path', { d: 'M15,18.66V22H5V18.66C8.09,20.45 11.91,20.45 15,18.66M22,4C22,2.9 21.1,2 20,2C19.69,2 19.39,2.07 19.12,2.21C18.82,2.36 18.56,2.58 18.36,2.85C17.72,3.75 17.94,5 18.85,5.64C19.18,5.87 19.59,6 20,6C20.08,6 20.16,6 20.24,6C21.97,10.43 20.66,15.46 17,18.5C16.68,18.75 16.35,19 16,19.22V21H17V19.74C20.14,17.5 22,13.86 22,10C22,8.5 21.72,7 21.17,5.62C21.69,5.24 22,4.64 22,4M18,10C18,14.42 14.42,18 10,18C5.58,18 2,14.42 2,10C2,5.58 5.58,2 10,2C14.42,2 18,5.58 18,10Z' })
  );
};