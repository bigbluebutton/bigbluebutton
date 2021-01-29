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
    _react2.default.createElement('path', { d: 'M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,14.4 5,16.5 6.7,18C8.1,16.7 10,16 12,16C14,16 15.8,16.7 17.3,18C19,16.5 20,14.4 20,12C20,7.58 16.42,4 12,4M14,6C14.55,6 15,6.45 15,7C15,7.55 14.55,8 14,8C13.45,8 13,7.55 13,7C13,6.45 13.45,6 14,6M10,6C10.55,6 11,6.45 11,7C11,7.55 10.55,8 10,8C9.45,8 9,7.55 9,7C9,6.45 9.45,6 10,6M6.91,8.94C7.04,8.94 7.16,8.97 7.3,9L10.5,10.32L10.77,10.43C11.33,10 12.09,9.88 12.75,10.15C13.77,10.56 14.27,11.73 13.85,12.75C13.44,13.77 12.27,14.27 11.25,13.85C10.59,13.59 10.12,13 10,12.28L9.77,12.18L6.55,10.88L6.53,10.87C6,10.66 5.77,10.08 5.97,9.56C6.13,9.18 6.5,8.93 6.91,8.94V8.94M17,9C17.55,9 18,9.45 18,10C18,10.55 17.55,11 17,11C16.45,11 16,10.55 16,10C16,9.45 16.45,9 17,9Z' })
  );
};