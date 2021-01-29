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
    _react2.default.createElement('path', { d: 'M2,6L9,13H2V16H12L19,23L20.25,21.75L3.25,4.75L2,6M20.5,13H22V16H20.5V13M18,13H19.5V16H18V13M18.85,4.88C19.47,4.27 19.85,3.43 19.85,2.5H18.35C18.35,3.5 17.5,4.35 16.5,4.35V5.85C18.74,5.85 20.5,7.68 20.5,9.92V12H22V9.92C22,7.69 20.72,5.77 18.85,4.88M14.5,8.7H16.03C17.08,8.7 18,9.44 18,10.75V12H19.5V10.41C19.5,8.61 17.9,7.25 16.03,7.25H14.5C13.5,7.25 12.65,6.27 12.65,5.25C12.65,4.23 13.5,3.5 14.5,3.5V2C12.65,2 11.15,3.5 11.15,5.35C11.15,7.2 12.65,8.7 14.5,8.7M17,15.93V13H14.07L17,15.93Z' })
  );
};