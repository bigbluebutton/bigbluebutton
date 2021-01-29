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
    _react2.default.createElement('path', { d: 'M15.75,9L16.95,8.24C17.58,8.58 18,9.24 18,10V21.75C18,21.75 10,20 10,11V10C10,9.27 10.39,8.63 10.97,8.28L12.43,9L14,8L15.75,9M12,2C13.53,2 14.8,3.15 15,4.64C16,4.93 16.81,5.67 17.22,6.63L15.75,7.5L14,6.5L12.43,7.5L10.76,6.67C11.15,5.72 11.95,5 12.94,4.66C12.8,4.28 12.43,4 12,4V2M8,10C8,18 11.63,19.84 14,21.75C14,21.75 6,20 6,11V10C6,9.27 6.39,8.63 6.97,8.28L8.3,8.94C8.11,9.25 8,9.61 8,10M8.43,7.5L6.76,6.67C7.15,5.72 7.95,5 8.94,4.66C8.8,4.28 8.43,4 8,4V2C8.77,2 9.47,2.29 10,2.76V4C10.43,4 10.8,4.28 10.94,4.66C9.95,5 9.15,5.72 8.43,7.5Z' })
  );
};