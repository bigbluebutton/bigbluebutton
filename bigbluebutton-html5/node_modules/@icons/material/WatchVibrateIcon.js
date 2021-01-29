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
    _react2.default.createElement('path', { d: 'M3,17V7H5V17H3M19,17V7H21V17H19M22,9H24V15H22V9M0,15V9H2V15H0M17.96,11.97C17.96,13.87 17.07,15.57 15.68,16.67L14.97,20.95H9L8.27,16.67C6.88,15.57 6,13.87 6,11.97C6,10.07 6.88,8.37 8.27,7.28L9,3H14.97L15.68,7.28C17.07,8.37 17.96,10.07 17.96,11.97M7.5,11.97C7.5,14.45 9.5,16.46 11.97,16.46C14.46,16.46 16.46,14.46 16.46,11.97C16.46,9.5 14.45,7.5 11.97,7.5C9.5,7.5 7.5,9.5 7.5,11.97Z' })
  );
};