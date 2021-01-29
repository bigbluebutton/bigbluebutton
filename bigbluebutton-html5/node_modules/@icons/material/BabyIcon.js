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
    _react2.default.createElement('path', { d: 'M18.5,4C19.88,4 21,5.12 21,6.5C21,7.88 19.88,9 18.5,9C17.12,9 16,7.88 16,6.5C16,5.12 17.12,4 18.5,4M4.5,20C3.67,20 3,19.33 3,18.5C3,17.67 3.67,17 4.5,17H11.5C12.33,17 13,17.67 13,18.5C13,19.33 12.33,20 11.5,20H4.5M16.09,19L14.69,15H11L6.75,10.75C6.75,10.75 9,8.25 12.5,8.25C15.5,8.25 15.85,9.25 16.06,9.87L18.92,18C19.2,18.78 18.78,19.64 18,19.92C17.22,20.19 16.36,19.78 16.09,19Z' })
  );
};