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
    _react2.default.createElement('path', { d: 'M20,14H4V8H9.08L7,10.83L8.62,12L11,8.76L12,7.4L13,8.76L15.38,12L17,10.83L14.92,8H20M20,19H4V17H20M9,4C9.55,4 10,4.45 10,5C10,5.55 9.55,6 9,6C8.45,6 8,5.55 8,5C8,4.45 8.45,4 9,4M15,4C15.55,4 16,4.45 16,5C16,5.55 15.55,6 15,6C14.45,6 14,5.55 14,5C14,4.45 14.45,4 15,4M20,6H17.82C17.93,5.69 18,5.35 18,5C18,3.34 16.66,2 15,2C13.95,2 13.04,2.54 12.5,3.35L12,4L11.5,3.34C10.96,2.54 10.05,2 9,2C7.34,2 6,3.34 6,5C6,5.35 6.07,5.69 6.18,6H4C2.89,6 2,6.89 2,8V19C2,20.11 2.89,21 4,21H20C21.11,21 22,20.11 22,19V8C22,6.89 21.11,6 20,6Z' })
  );
};