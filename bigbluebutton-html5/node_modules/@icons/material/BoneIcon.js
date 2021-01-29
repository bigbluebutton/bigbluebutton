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
    _react2.default.createElement('path', { d: 'M8,14C8,15.66 6.66,17 5,17C3.34,17 2,15.66 2,14C2,13.23 2.29,12.53 2.76,12C2.29,11.47 2,10.77 2,10C2,8.34 3.34,7 5,7C6.66,7 8,8.34 8,10C9.33,10.08 10.67,10.17 12,10.17C13.33,10.17 14.67,10.08 16,10C16,8.34 17.34,7 19,7C20.66,7 22,8.34 22,10C22,10.77 21.71,11.47 21.24,12C21.71,12.53 22,13.23 22,14C22,15.66 20.66,17 19,17C17.34,17 16,15.66 16,14C14.67,13.92 13.33,13.83 12,13.83C10.67,13.83 9.33,13.92 8,14Z' })
  );
};