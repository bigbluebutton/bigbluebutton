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
    _react2.default.createElement('path', { d: 'M6.5,21V19.75C7.44,19.29 8.24,18.57 8.81,17.7C9.38,16.83 9.67,15.85 9.68,14.75L9.66,13.77L9.57,13H7V11H9.4C9.25,10.17 9.16,9.31 9.13,8.25C9.16,6.61 9.64,5.33 10.58,4.41C11.5,3.5 12.77,3 14.32,3C15.03,3 15.64,3.07 16.13,3.2C16.63,3.32 17,3.47 17.31,3.65L16.76,5.39C16.5,5.25 16.19,5.12 15.79,5C15.38,4.9 14.89,4.85 14.32,4.84C13.25,4.86 12.5,5.19 12,5.83C11.5,6.46 11.29,7.28 11.3,8.28L11.4,9.77L11.6,11H15.5V13H11.79C11.88,14 11.84,15 11.65,15.96C11.35,17.16 10.74,18.18 9.83,19H18V21H6.5Z' })
  );
};