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
    _react2.default.createElement('path', { d: 'M13.25,17.25C12.25,17.25 11.29,16.82 10.6,16.1L9.41,20.1L9.33,20.36L9.29,20.34C9.04,20.75 8.61,21 8.12,21C7.37,21 6.75,20.38 6.75,19.62C6.75,19.56 6.76,19.5 6.77,19.44L6.75,19.43L6.81,19.21L9.12,12.26C9.12,12.26 8.87,11.5 8.87,10.42C8.87,8.27 10.03,7.62 10.95,7.62C11.88,7.62 12.73,7.95 12.73,9.26C12.73,10.94 11.61,11.8 11.61,13C11.61,13.94 12.37,14.69 13.29,14.69C16.21,14.69 17.25,12.5 17.25,10.44C17.25,7.71 14.89,5.5 12,5.5C9.1,5.5 6.75,7.71 6.75,10.44C6.75,11.28 7,12.12 7.43,12.85C7.54,13.05 7.6,13.27 7.6,13.5C7.6,14.19 7.04,14.75 6.35,14.75C5.91,14.75 5.5,14.5 5.27,14.13C4.6,13 4.25,11.73 4.25,10.44C4.25,6.33 7.73,3 12,3C16.27,3 19.75,6.33 19.75,10.44C19.75,13.72 17.71,17.25 13.25,17.25Z' })
  );
};