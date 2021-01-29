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
    _react2.default.createElement('path', { d: 'M10,10C10,11.1 9.1,12 8,12C6.9,12 6,11.1 6,10V8C6,7.37 6.1,6.77 6.27,6.2L10,9.93V10M12,2C12.74,2 13.44,2.13 14.09,2.38L11.97,6C11.14,6 10.44,6.5 10.15,7.25L7.24,4.34C8.34,2.92 10.06,2 12,2M17.76,6.31L14,10.07V8C14,7.62 13.9,7.27 13.72,6.97L15.83,3.38C16.74,4.13 17.42,5.15 17.76,6.31M18,13.09L14,17.09V12.9L18,8.9V13.09M18,20C18,21.1 17.1,22 16,22C14.9,22 14,21.1 14,20V19.91L18,15.91V20Z' })
  );
};