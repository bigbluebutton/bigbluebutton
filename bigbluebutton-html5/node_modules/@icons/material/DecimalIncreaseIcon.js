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
    _react2.default.createElement('path', { d: 'M22,17L19,20V18H13V16H19V14L22,17M9,5C10.66,5 12,6.34 12,8V11C12,12.66 10.66,14 9,14C7.34,14 6,12.66 6,11V8C6,6.34 7.34,5 9,5M9,7C8.45,7 8,7.45 8,8V11C8,11.55 8.45,12 9,12C9.55,12 10,11.55 10,11V8C10,7.45 9.55,7 9,7M16,5C17.66,5 19,6.34 19,8V11C19,12.66 17.66,14 16,14C14.34,14 13,12.66 13,11V8C13,6.34 14.34,5 16,5M16,7C15.45,7 15,7.45 15,8V11C15,11.55 15.45,12 16,12C16.55,12 17,11.55 17,11V8C17,7.45 16.55,7 16,7M4,12C4.55,12 5,12.45 5,13C5,13.55 4.55,14 4,14C3.45,14 3,13.55 3,13C3,12.45 3.45,12 4,12Z' })
  );
};