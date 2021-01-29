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
    _react2.default.createElement('path', { d: 'M3,3C2.45,3 2,3.45 2,4V8L2,9.5C2,11.19 3.03,12.63 4.5,13.22V19.5C4.5,20.33 5.17,21 6,21C6.83,21 7.5,20.33 7.5,19.5V13.22C8.97,12.63 10,11.19 10,9.5V8L10,4C10,3.45 9.55,3 9,3C8.45,3 8,3.45 8,4V8C8,8.28 7.78,8.5 7.5,8.5C7.22,8.5 7,8.28 7,8V4C7,3.45 6.55,3 6,3C5.45,3 5,3.45 5,4V8C5,8.28 4.78,8.5 4.5,8.5C4.22,8.5 4,8.28 4,8V4C4,3.45 3.55,3 3,3M19.88,3C19.75,3 19.62,3.09 19.5,3.16L16,5.25V9H12V11H13L14,21H20L21,11H22V9H18V6.34L20.5,4.84C21,4.56 21.13,4 20.84,3.5C20.63,3.14 20.26,2.95 19.88,3Z' })
  );
};