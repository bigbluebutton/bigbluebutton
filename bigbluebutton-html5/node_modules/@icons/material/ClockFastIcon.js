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
    _react2.default.createElement('path', { d: 'M15,4C19.42,4 23,7.58 23,12C23,16.42 19.42,20 15,20C10.58,20 7,16.42 7,12C7,7.58 10.58,4 15,4M15,6C11.69,6 9,8.69 9,12C9,15.31 11.69,18 15,18C18.31,18 21,15.31 21,12C21,8.69 18.31,6 15,6M14,8H15.5V11.78L17.83,14.11L16.77,15.17L14,12.4V8M2,18C1.45,18 1,17.55 1,17C1,16.45 1.45,16 2,16H5.83C6.14,16.71 6.54,17.38 7,18H2M3,13C2.45,13 2,12.55 2,12C2,11.45 2.45,11 3,11H5.05L5,12L5.05,13H3M4,8C3.45,8 3,7.55 3,7C3,6.45 3.45,6 4,6H7C6.54,6.62 6.14,7.29 5.83,8H4Z' })
  );
};