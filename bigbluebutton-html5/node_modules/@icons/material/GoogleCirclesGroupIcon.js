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
    _react2.default.createElement('path', { d: 'M5,10C3.9,10 3,10.9 3,12C3,13.11 3.9,14 5,14C6.11,14 7,13.11 7,12C7,10.9 6.1,10 5,10M5,16C2.79,16 1,14.21 1,12C1,9.79 2.79,8 5,8C7.21,8 9,9.79 9,12C9,14.21 7.21,16 5,16M10.5,11H14V8L18,12L14,16V13H10.5V11M5,6C4.55,6 4.11,6.05 3.69,6.14C5.63,3.05 9.08,1 13,1C19.08,1 24,5.92 24,12C24,18.08 19.08,23 13,23C9.08,23 5.63,20.95 3.69,17.86C4.11,17.95 4.55,18 5,18C5.8,18 6.56,17.84 7.25,17.56C8.71,19.07 10.74,20 13,20C17.42,20 21,16.42 21,12C21,7.58 17.42,4 13,4C10.74,4 8.71,4.93 7.25,6.44C6.56,6.16 5.8,6 5,6Z' })
  );
};