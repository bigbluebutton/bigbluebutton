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
    _react2.default.createElement('path', { d: 'M7.97,16L5,19C4.67,19.3 4.23,19.5 3.75,19.5C2.78,19.5 2,18.72 2,17.75V17.5L3,10.12C3.21,7.81 5.14,6 7.5,6H16.5C18.86,6 20.79,7.81 21,10.12L22,17.5V17.75C22,18.72 21.22,19.5 20.25,19.5C19.77,19.5 19.33,19.3 19,19L16.03,16H7.97M7,8V10H5V11H7V13H8V11H10V10H8V8H7M16.5,8C16.09,8 15.75,8.34 15.75,8.75C15.75,9.16 16.09,9.5 16.5,9.5C16.91,9.5 17.25,9.16 17.25,8.75C17.25,8.34 16.91,8 16.5,8M14.75,9.75C14.34,9.75 14,10.09 14,10.5C14,10.91 14.34,11.25 14.75,11.25C15.16,11.25 15.5,10.91 15.5,10.5C15.5,10.09 15.16,9.75 14.75,9.75M18.25,9.75C17.84,9.75 17.5,10.09 17.5,10.5C17.5,10.91 17.84,11.25 18.25,11.25C18.66,11.25 19,10.91 19,10.5C19,10.09 18.66,9.75 18.25,9.75M16.5,11.5C16.09,11.5 15.75,11.84 15.75,12.25C15.75,12.66 16.09,13 16.5,13C16.91,13 17.25,12.66 17.25,12.25C17.25,11.84 16.91,11.5 16.5,11.5Z' })
  );
};