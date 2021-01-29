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
    _react2.default.createElement('path', { d: 'M7,4C8.1,4 9,4.9 9,6C9,7.1 8.1,8 7,8C5.9,8 5,7.1 5,6C5,4.9 5.9,4 7,4M11.15,12H22V20C22,21.1 21.1,22 20,22H4C2.9,22 2,21.1 2,20V12H5V11.25C5,10 6,9 7.25,9H7.28C7.62,9 7.95,9.09 8.24,9.23C8.5,9.35 8.74,9.5 8.93,9.73L10.33,11.28C10.56,11.54 10.84,11.78 11.15,12M7,20V14H5V20H7M11,20V14H9V20H11M15,20V14H13V20H15M19,20V14H17V20H19M18.65,5.86C19.68,6.86 20.16,8.21 19.95,9.57L19.89,10H18L18.09,9.41C18.24,8.62 18,7.83 17.42,7.21L17.35,7.15C16.32,6.14 15.85,4.79 16.05,3.43L16.11,3H18L17.91,3.59C17.76,4.38 18,5.17 18.58,5.79L18.65,5.86M14.65,5.86C15.68,6.86 16.16,8.21 15.95,9.57L15.89,10H14L14.09,9.41C14.24,8.62 14,7.83 13.42,7.21L13.35,7.15C12.32,6.14 11.85,4.79 12.05,3.43L12.11,3H14L13.91,3.59C13.76,4.38 14,5.17 14.58,5.79L14.65,5.86Z' })
  );
};