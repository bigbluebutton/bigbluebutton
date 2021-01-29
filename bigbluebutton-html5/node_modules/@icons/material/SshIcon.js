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
    _react2.default.createElement('path', { d: 'M4.5,9C3.9,9 3.5,9.5 3.5,10V11.75C3.5,12.25 3.9,12.75 4.5,12.75H7V13.5H3.5V15H7.5C8.1,15 8.5,14.5 8.5,14V12.25C8.5,11.75 8.1,11.25 7.5,11.25H5V10.5H8.5V9H4.5M10.5,9C9.9,9 9.5,9.5 9.5,10V11.75C9.5,12.25 9.9,12.75 10.5,12.75H13V13.5H9.5V15H13.5C14.1,15 14.5,14.5 14.5,14V12.25C14.5,11.75 14.1,11.25 13.5,11.25H11V10.5H14.5V9H10.5M15.5,9V15H17V12.5H19V15H20.5V9H19V11H17V9H15.5Z' })
  );
};