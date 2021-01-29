'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArrowRightCircleIcon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_SIZE = 24;

var ArrowRightCircleIcon = function ArrowRightCircleIcon(_ref) {
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
    _react2.default.createElement('path', { d: 'M6,12H14.25L11,8.75L11.67,8L16.17,12.5L11.67,17L11,16.25L14.25,13H6V12M21,12.5C21,17.75 16.75,22 11.5,22C6.26,22 2,17.75 2,12.5C2,7.25 6.25,3 11.5,3C16.75,3 21,7.25 21,12.5M20,12.5C20,7.81 16.19,4 11.5,4C6.81,4 3,7.81 3,12.5C3,17.19 6.81,21 11.5,21C16.2,21 20,17.19 20,12.5Z' })
  );
};
exports.ArrowRightCircleIcon = ArrowRightCircleIcon;