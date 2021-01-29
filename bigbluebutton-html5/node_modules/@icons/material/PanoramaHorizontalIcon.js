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
    _react2.default.createElement('path', { d: 'M21.43,4C21.33,4 21.23,4 21.12,4.06C18.18,5.16 15.09,5.7 12,5.7C8.91,5.7 5.82,5.15 2.88,4.06C2.77,4 2.66,4 2.57,4C2.23,4 2,4.23 2,4.63V19.38C2,19.77 2.23,20 2.57,20C2.67,20 2.77,20 2.88,19.94C5.82,18.84 8.91,18.3 12,18.3C15.09,18.3 18.18,18.85 21.12,19.94C21.23,20 21.33,20 21.43,20C21.76,20 22,19.77 22,19.37V4.63C22,4.23 21.76,4 21.43,4M20,6.54V17.45C17.4,16.68 14.72,16.29 12,16.29C9.28,16.29 6.6,16.68 4,17.45V6.54C6.6,7.31 9.28,7.7 12,7.7C14.72,7.71 17.4,7.32 20,6.54Z' })
  );
};