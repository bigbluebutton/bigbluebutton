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
    _react2.default.createElement('path', { d: 'M19,14.5C19,14.5 21,16.67 21,18C21,19.1 20.1,20 19,20C17.9,20 17,19.1 17,18C17,16.67 19,14.5 19,14.5M5,18V9C3.9,9 3,8.1 3,7C3,5.9 3.9,5 5,5V4C5,2.9 5.9,2 7,2H9C10.1,2 11,2.9 11,4V5H19C20.1,5 21,5.9 21,7V9L21,11C21.55,11 22,11.45 22,12C22,12.55 21.55,13 21,13H17C16.45,13 16,12.55 16,12C16,11.45 16.45,11 17,11V9H11V18H12C13.1,18 14,18.9 14,20V22H2V20C2,18.9 2.9,18 4,18H5Z' })
  );
};