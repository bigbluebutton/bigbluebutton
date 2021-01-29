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
    _react2.default.createElement('path', { d: 'M16,17V10.5C16,8 14,6 11.5,6C9,6 7,8 7,10.5V17H16M18,16L20,18V19H3V18L5,16V10.5C5,7.43 7.13,4.86 10,4.18V3.5C10,2.67 10.67,2 11.5,2C12.33,2 13,2.67 13,3.5V4.18C15.86,4.86 18,7.43 18,10.5V16M11.5,22C10.4,22 9.5,21.1 9.5,20H13.5C13.5,21.1 12.6,22 11.5,22M19.97,10C19.82,7.35 18.46,5 16.42,3.58L17.85,2.15C20.24,3.97 21.82,6.79 21.97,10H19.97M6.58,3.58C4.54,5 3.18,7.35 3,10H1C1.18,6.79 2.76,3.97 5.15,2.15L6.58,3.58Z' })
  );
};