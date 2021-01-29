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
    _react2.default.createElement('path', { d: 'M21,13C21,17.97 16.97,22 12,22C7.03,22 3,17.97 3,13L3.03,4.43C5.68,2.88 8.76,2 12.05,2C15.3,2 18.36,2.87 21,4.38V13M13,19.93C16.39,19.44 19,16.5 19,13V5.59C16.9,4.57 14.54,4 12.05,4C9.5,4 7.08,4.6 4.94,5.66L5,13C5,16.5 7.63,19.44 11,19.93V18H13V19.93M11,16H8L6,13L9,14H10L11,13H13L14,14H15L18,13L16,16H13L12,15L11,16M6,9.03C6.64,8.4 7.5,8.05 8.5,8.05C9.45,8.05 10.34,8.4 11,9.03C10.34,9.65 9.45,10 8.5,10C7.5,10 6.64,9.65 6,9.03M13,9.03C13.64,8.4 14.5,8.05 15.5,8.05C16.45,8.05 17.34,8.4 18,9.03C17.34,9.65 16.45,10 15.5,10C14.5,10 13.64,9.65 13,9.03Z' })
  );
};