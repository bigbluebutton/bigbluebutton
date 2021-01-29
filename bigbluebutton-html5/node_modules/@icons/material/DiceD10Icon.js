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
    _react2.default.createElement('path', { d: 'M21.5,10.8C22.1,11.5 22.1,12.5 21.5,13.2L13.2,21.5C12.5,22.2 11.5,22.2 10.8,21.5L2.5,13.2C1.8,12.5 1.8,11.5 2.5,10.8L10.8,2.5C11.5,1.8 12.5,1.8 13.2,2.5L21.5,10.8M20.3,12L12,3.7L3.7,12L12,20.3L20.3,12M10.38,15.79H8.88V10L7.08,10.55V9.32L10.22,8.2H10.38V15.79M13.93,8C15.35,8 16.5,9.15 16.5,10.57V13.21C16.5,14.63 15.35,15.78 13.93,15.78C12.5,15.78 11.36,14.63 11.36,13.21V10.57C11.36,9.15 12.51,8 13.93,8M13.92,9.44C13.33,9.44 12.86,9.91 12.86,10.5V13.27C12.86,13.86 13.33,14.33 13.92,14.33C14.5,14.33 15,13.85 15,13.27V10.5C15,9.91 14.5,9.44 13.92,9.44Z' })
  );
};