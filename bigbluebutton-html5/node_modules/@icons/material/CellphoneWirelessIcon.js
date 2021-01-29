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
    _react2.default.createElement('path', { d: 'M20.07,4.93C21.88,6.74 23,9.24 23,12C23,14.76 21.88,17.26 20.07,19.07L18.66,17.66C20.11,16.22 21,14.22 21,12C21,9.79 20.11,7.78 18.66,6.34L20.07,4.93M17.24,7.76C18.33,8.85 19,10.35 19,12C19,13.65 18.33,15.15 17.24,16.24L15.83,14.83C16.55,14.11 17,13.11 17,12C17,10.89 16.55,9.89 15.83,9.17L17.24,7.76M13,10C14.1,10 15,10.9 15,12C15,13.1 14.1,14 13,14C11.9,14 11,13.1 11,12C11,10.9 11.9,10 13,10M11.5,1C12.88,1 14,2.12 14,3.5V8H12V4H3V19H12V16H14V20.5C14,21.88 12.88,23 11.5,23H3.5C2.12,23 1,21.88 1,20.5V3.5C1,2.12 2.12,1 3.5,1H11.5Z' })
  );
};