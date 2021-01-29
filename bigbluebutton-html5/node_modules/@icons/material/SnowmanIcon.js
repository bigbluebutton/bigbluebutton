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
    _react2.default.createElement('path', { d: 'M17,17C17,19.76 14.76,22 12,22C9.24,22 7,19.76 7,17C7,15.5 7.65,14.17 8.69,13.25C8.26,12.61 8,11.83 8,11C8,10.86 8,10.73 8,10.59L5.04,8.87L4.83,8.71L2.29,9.39L2.03,8.43L4.24,7.84L2.26,6.69L2.76,5.82L4.74,6.97L4.15,4.75L5.11,4.5L5.8,7.04L6.04,7.14L8.73,8.69C9.11,8.15 9.62,7.71 10.22,7.42C9.5,6.87 9,6 9,5C9,3.34 10.34,2 12,2C13.66,2 15,3.34 15,5C15,6 14.5,6.87 13.78,7.42C14.38,7.71 14.89,8.15 15.27,8.69L17.96,7.14L18.2,7.04L18.89,4.5L19.85,4.75L19.26,6.97L21.24,5.82L21.74,6.69L19.76,7.84L21.97,8.43L21.71,9.39L19.17,8.71L18.96,8.87L16,10.59V11C16,11.83 15.74,12.61 15.31,13.25C16.35,14.17 17,15.5 17,17Z' })
  );
};