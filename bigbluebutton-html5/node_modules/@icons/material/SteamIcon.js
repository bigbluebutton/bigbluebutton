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
    _react2.default.createElement('path', { d: 'M20.14,7.79C21.33,7.79 22.29,8.75 22.29,9.93C22.29,11.11 21.33,12.07 20.14,12.07C18.96,12.07 18,11.11 18,9.93C18,8.75 18.96,7.79 20.14,7.79M3,6.93C4.66,6.93 6,8.27 6,9.93V10.24L12.33,13.54C12.84,13.15 13.46,12.93 14.14,12.93L16.29,9.93C16.29,7.8 18,6.07 20.14,6.07C22.27,6.07 24,7.8 24,9.93C24,12.06 22.27,13.79 20.14,13.79L17.14,15.93C17.14,17.59 15.8,18.93 14.14,18.93C12.5,18.93 11.14,17.59 11.14,15.93C11.14,15.89 11.14,15.85 11.14,15.82L4.64,12.44C4.17,12.75 3.6,12.93 3,12.93C1.34,12.93 0,11.59 0,9.93C0,8.27 1.34,6.93 3,6.93M15.03,14.94C15.67,15.26 15.92,16.03 15.59,16.67C15.27,17.3 14.5,17.55 13.87,17.23L12.03,16.27C12.19,17.29 13.08,18.07 14.14,18.07C15.33,18.07 16.29,17.11 16.29,15.93C16.29,14.75 15.33,13.79 14.14,13.79C13.81,13.79 13.5,13.86 13.22,14L15.03,14.94M3,7.79C1.82,7.79 0.86,8.75 0.86,9.93C0.86,11.11 1.82,12.07 3,12.07C3.24,12.07 3.5,12.03 3.7,11.95L2.28,11.22C1.64,10.89 1.39,10.12 1.71,9.5C2.04,8.86 2.81,8.6 3.44,8.93L5.14,9.81C5.08,8.68 4.14,7.79 3,7.79M20.14,6.93C18.5,6.93 17.14,8.27 17.14,9.93C17.14,11.59 18.48,12.93 20.14,12.93C21.8,12.93 23.14,11.59 23.14,9.93C23.14,8.27 21.8,6.93 20.14,6.93Z' })
  );
};