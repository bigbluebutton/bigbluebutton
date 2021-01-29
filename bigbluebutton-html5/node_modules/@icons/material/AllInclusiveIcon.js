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
    _react2.default.createElement('path', { d: 'M18.6,6.62C17.16,6.62 15.8,7.18 14.83,8.15L7.8,14.39C7.16,15.03 6.31,15.38 5.4,15.38C3.53,15.38 2,13.87 2,12C2,10.13 3.53,8.62 5.4,8.62C6.31,8.62 7.16,8.97 7.84,9.65L8.97,10.65L10.5,9.31L9.22,8.2C8.2,7.18 6.84,6.62 5.4,6.62C2.42,6.62 0,9.04 0,12C0,14.96 2.42,17.38 5.4,17.38C6.84,17.38 8.2,16.82 9.17,15.85L16.2,9.61C16.84,8.97 17.69,8.62 18.6,8.62C20.47,8.62 22,10.13 22,12C22,13.87 20.47,15.38 18.6,15.38C17.7,15.38 16.84,15.03 16.16,14.35L15,13.34L13.5,14.68L14.78,15.8C15.8,16.81 17.15,17.37 18.6,17.37C21.58,17.37 24,14.96 24,12C24,9 21.58,6.62 18.6,6.62Z' })
  );
};