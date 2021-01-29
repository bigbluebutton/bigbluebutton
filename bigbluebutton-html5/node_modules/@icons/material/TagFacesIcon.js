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
    _react2.default.createElement('path', { d: 'M15,18C11.68,18 9,15.31 9,12C9,8.68 11.68,6 15,6C18.31,6 21,8.69 21,12C21,15.31 18.31,18 15,18M4,13C3.45,13 3,12.55 3,12C3,11.45 3.45,11 4,11C4.55,11 5,11.45 5,12C5,12.55 4.55,13 4,13M22,3H7.63C6.97,3 6.38,3.32 6,3.81L0,12L6,20.18C6.38,20.68 6.97,21 7.63,21H22C23.1,21 24,20.1 24,19V5C24,3.89 23.1,3 22,3M13,11C13.55,11 14,10.55 14,10C14,9.45 13.55,9 13,9C12.45,9 12,9.45 12,10C12,10.55 12.45,11 13,11M15,16C16.86,16 18.35,14.72 18.8,13H11.2C11.65,14.72 13.14,16 15,16M17,11C17.55,11 18,10.55 18,10C18,9.45 17.55,9 17,9C16.45,9 16,9.45 16,10C16,10.55 16.45,11 17,11Z' })
  );
};