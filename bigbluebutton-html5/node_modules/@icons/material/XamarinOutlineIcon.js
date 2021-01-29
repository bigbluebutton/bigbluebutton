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
    _react2.default.createElement('path', { d: 'M12,12L12.03,11.9L14.58,7.1L14.75,7H16.34L16.5,7.1V7.3L14,12L16.5,16.7V16.9L16.34,17H14.75L14.58,16.9L12.03,12.1L12,12V12.1L9.42,16.9L9.25,17H7.66L7.5,16.9V16.7L10,12L7.5,7.3V7.1L7.66,7H9.25L9.42,7.1L12,11.9V12M22.75,11.07C22.91,11.35 23,11.67 23,12C23,12.33 22.91,12.65 22.75,12.93L18.08,21C17.72,21.62 17.06,22 16.35,22H7.65C6.94,22 6.28,21.62 5.92,21L1.25,12.93C1.09,12.65 1,12.33 1,12C1,11.67 1.09,11.35 1.25,11.07L5.92,3C6.28,2.38 6.94,2 7.65,2H16.35C17.06,2 17.72,2.38 18.08,3L22.75,11.07M20.8,11.25L16.97,4.8C16.68,4.3 16.14,4 15.56,4H8.44C7.86,4 7.32,4.3 7.03,4.8L3.2,11.25C3.07,11.5 3,11.74 3,12C3,12.26 3.07,12.5 3.2,12.75L7.03,19.2C7.32,19.7 7.86,20 8.44,20H15.56C16.14,20 16.68,19.7 16.97,19.2L20.8,12.75C20.93,12.5 21,12.26 21,12C21,11.74 20.93,11.5 20.8,11.25Z' })
  );
};