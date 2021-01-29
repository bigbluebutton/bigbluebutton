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
    _react2.default.createElement('path', { d: 'M7,22H4.75C4.75,22 4,22 3.81,20.65L2.04,3.81L2,3.5C2,2.67 2.9,2 4,2C5.1,2 6,2.67 6,3.5C6,2.67 6.9,2 8,2C9.1,2 10,2.67 10,3.5C10,2.67 10.9,2 12,2C13.09,2 14,2.66 14,3.5V3.5C14,2.67 14.9,2 16,2C17.1,2 18,2.67 18,3.5C18,2.67 18.9,2 20,2C21.1,2 22,2.67 22,3.5L21.96,3.81L20.19,20.65C20,22 19.25,22 19.25,22H17L16.5,22H13.75L10.25,22H7.5L7,22M17.85,4.93C17.55,4.39 16.84,4 16,4C15.19,4 14.36,4.36 14,4.87L13.78,20H16.66L17.85,4.93M10,4.87C9.64,4.36 8.81,4 8,4C7.16,4 6.45,4.39 6.15,4.93L7.34,20H10.22L10,4.87Z' })
  );
};