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
    _react2.default.createElement('path', { d: 'M9.29,3.25L5.16,6.72L4,5.34L8.14,1.87L9.29,3.25M22,5.35L20.84,6.73L16.7,3.25L17.86,1.87L22,5.35M13,4C17.42,4 21,7.58 21,12C21,16.42 17.42,20 13,20C8.58,20 5,16.42 5,12C5,7.58 8.58,4 13,4M13,6C9.69,6 7,8.69 7,12C7,15.31 9.69,18 13,18C16.31,18 19,15.31 19,12C19,8.69 16.31,6 13,6M12,7.5H13.5V12.03L16.72,13.5L16.1,14.86L12,13V7.5M1,14C1,11.5 2.13,9.3 3.91,7.83C3.33,9.1 3,10.5 3,12L3.06,13.13L3,14C3,16.28 4.27,18.26 6.14,19.28C7.44,20.5 9.07,21.39 10.89,21.78C10.28,21.92 9.65,22 9,22C4.58,22 1,18.42 1,14Z' })
  );
};