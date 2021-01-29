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
    _react2.default.createElement('path', { d: 'M2.8,3L19.67,18.82C19.67,18.82 20,19.27 19.58,19.71C19.17,20.15 18.63,19.77 18.63,19.77L2.8,3M7.81,4.59L20.91,16.64C20.91,16.64 21.23,17.08 20.82,17.5C20.4,17.97 19.86,17.59 19.86,17.59L7.81,4.59M4.29,8L17.39,20.03C17.39,20.03 17.71,20.47 17.3,20.91C16.88,21.36 16.34,21 16.34,21L4.29,8M12.05,5.96L21.2,14.37C21.2,14.37 21.42,14.68 21.13,15C20.85,15.3 20.47,15.03 20.47,15.03L12.05,5.96M5.45,11.91L14.6,20.33C14.6,20.33 14.82,20.64 14.54,20.95C14.25,21.26 13.87,21 13.87,21L5.45,11.91M16.38,7.92L20.55,11.74C20.55,11.74 20.66,11.88 20.5,12.03C20.38,12.17 20.19,12.05 20.19,12.05L16.38,7.92M7.56,16.1L11.74,19.91C11.74,19.91 11.85,20.06 11.7,20.2C11.56,20.35 11.37,20.22 11.37,20.22L7.56,16.1Z' })
  );
};