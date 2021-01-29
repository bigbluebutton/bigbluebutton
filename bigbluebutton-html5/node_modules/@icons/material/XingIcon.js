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
    _react2.default.createElement('path', { d: 'M17.67,2C17.24,2 17.05,2.27 16.9,2.55C16.9,2.55 10.68,13.57 10.5,13.93L14.58,21.45C14.72,21.71 14.94,22 15.38,22H18.26C18.44,22 18.57,21.93 18.64,21.82C18.72,21.69 18.72,21.53 18.64,21.37L14.57,13.92L20.96,2.63C21.04,2.47 21.04,2.31 20.97,2.18C20.89,2.07 20.76,2 20.58,2M5.55,5.95C5.38,5.95 5.23,6 5.16,6.13C5.08,6.26 5.09,6.41 5.18,6.57L7.12,9.97L4.06,15.37C4,15.53 4,15.69 4.06,15.82C4.13,15.94 4.26,16 4.43,16H7.32C7.75,16 7.96,15.72 8.11,15.45C8.11,15.45 11.1,10.16 11.22,9.95L9.24,6.5C9.1,6.24 8.88,5.95 8.43,5.95' })
  );
};