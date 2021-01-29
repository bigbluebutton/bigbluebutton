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
    _react2.default.createElement('path', { d: 'M7,5L5,7V8H3C2.45,8 2,8.45 2,9V17C2,17.55 2.45,18 3,18H21C21.55,18 22,17.55 22,17V9C22,8.45 21.55,8 21,8H19V7L17,5H7M7,7H17V8H7V7M11,9H13C13.28,9 13.5,9.22 13.5,9.5C13.5,9.78 13.28,10 13,10H11C10.72,10 10.5,9.78 10.5,9.5C10.5,9.22 10.72,9 11,9M7.5,10.5C9.16,10.5 10.5,11.84 10.5,13.5C10.5,15.16 9.16,16.5 7.5,16.5C5.84,16.5 4.5,15.16 4.5,13.5C4.5,11.84 5.84,10.5 7.5,10.5M16.5,10.5C18.16,10.5 19.5,11.84 19.5,13.5C19.5,15.16 18.16,16.5 16.5,16.5C14.84,16.5 13.5,15.16 13.5,13.5C13.5,11.84 14.84,10.5 16.5,10.5M7.5,12C6.67,12 6,12.67 6,13.5C6,14.33 6.67,15 7.5,15C8.33,15 9,14.33 9,13.5C9,12.67 8.33,12 7.5,12M16.5,12C15.67,12 15,12.67 15,13.5C15,14.33 15.67,15 16.5,15C17.33,15 18,14.33 18,13.5C18,12.67 17.33,12 16.5,12Z' })
  );
};