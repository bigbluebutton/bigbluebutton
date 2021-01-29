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
    _react2.default.createElement('path', { d: 'M3,13.5C2.72,13.5 2.5,13.72 2.5,14C2.5,14.28 2.72,14.5 3,14.5C3.28,14.5 3.5,14.28 3.5,14C3.5,13.72 3.28,13.5 3,13.5M6,17C5.45,17 5,17.45 5,18C5,18.55 5.45,19 6,19C6.55,19 7,18.55 7,18C7,17.45 6.55,17 6,17M10,20.5C9.72,20.5 9.5,20.72 9.5,21C9.5,21.28 9.72,21.5 10,21.5C10.28,21.5 10.5,21.28 10.5,21C10.5,20.72 10.28,20.5 10,20.5M3,9.5C2.72,9.5 2.5,9.72 2.5,10C2.5,10.28 2.72,10.5 3,10.5C3.28,10.5 3.5,10.28 3.5,10C3.5,9.72 3.28,9.5 3,9.5M6,13C5.45,13 5,13.45 5,14C5,14.55 5.45,15 6,15C6.55,15 7,14.55 7,14C7,13.45 6.55,13 6,13M21,13.5C20.72,13.5 20.5,13.72 20.5,14C20.5,14.28 20.72,14.5 21,14.5C21.28,14.5 21.5,14.28 21.5,14C21.5,13.72 21.28,13.5 21,13.5M10,17C9.45,17 9,17.45 9,18C9,18.55 9.45,19 10,19C10.55,19 11,18.55 11,18C11,17.45 10.55,17 10,17M2.5,5.27L6.28,9.05L6,9C5.45,9 5,9.45 5,10C5,10.55 5.45,11 6,11C6.55,11 7,10.55 7,10C7,9.9 6.97,9.81 6.94,9.72L9.75,12.53C9.04,12.64 8.5,13.26 8.5,14C8.5,14.83 9.17,15.5 10,15.5C10.74,15.5 11.36,14.96 11.47,14.25L14.28,17.06C14.19,17.03 14.1,17 14,17C13.45,17 13,17.45 13,18C13,18.55 13.45,19 14,19C14.55,19 15,18.55 15,18C15,17.9 14.97,17.81 14.94,17.72L18.72,21.5L20,20.23L3.77,4L2.5,5.27M14,20.5C13.72,20.5 13.5,20.72 13.5,21C13.5,21.28 13.72,21.5 14,21.5C14.28,21.5 14.5,21.28 14.5,21C14.5,20.72 14.28,20.5 14,20.5M18,7C18.55,7 19,6.55 19,6C19,5.45 18.55,5 18,5C17.45,5 17,5.45 17,6C17,6.55 17.45,7 18,7M18,11C18.55,11 19,10.55 19,10C19,9.45 18.55,9 18,9C17.45,9 17,9.45 17,10C17,10.55 17.45,11 18,11M18,15C18.55,15 19,14.55 19,14C19,13.45 18.55,13 18,13C17.45,13 17,13.45 17,14C17,14.55 17.45,15 18,15M10,7C10.55,7 11,6.55 11,6C11,5.45 10.55,5 10,5C9.45,5 9,5.45 9,6C9,6.55 9.45,7 10,7M21,10.5C21.28,10.5 21.5,10.28 21.5,10C21.5,9.72 21.28,9.5 21,9.5C20.72,9.5 20.5,9.72 20.5,10C20.5,10.28 20.72,10.5 21,10.5M10,3.5C10.28,3.5 10.5,3.28 10.5,3C10.5,2.72 10.28,2.5 10,2.5C9.72,2.5 9.5,2.72 9.5,3C9.5,3.28 9.72,3.5 10,3.5M14,3.5C14.28,3.5 14.5,3.28 14.5,3C14.5,2.72 14.28,2.5 14,2.5C13.72,2.5 13.5,2.72 13.5,3C13.5,3.28 13.72,3.5 14,3.5M13.8,11.5H14C14.83,11.5 15.5,10.83 15.5,10C15.5,9.17 14.83,8.5 14,8.5C13.17,8.5 12.5,9.17 12.5,10V10.2C12.61,10.87 13.13,11.39 13.8,11.5M14,7C14.55,7 15,6.55 15,6C15,5.45 14.55,5 14,5C13.45,5 13,5.45 13,6C13,6.55 13.45,7 14,7Z' })
  );
};