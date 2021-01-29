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
    _react2.default.createElement('path', { d: 'M4,2C3.45,2 3,2.45 3,3C3,3.55 3.45,4 4,4C5.66,4 7,5.34 7,7V8.66L7,15.5C7,19.1 9.9,22 13.5,22C17.1,22 20,19.1 20,15.5V13C20.55,13 21,12.55 21,12C21,11.45 20.55,11 20,11H14C13.45,11 13,11.45 13,12C13,12.55 13.45,13 14,13V15C14,15.55 13.55,16 13,16C12.45,16 12,15.55 12,15V11C12.55,11 13,10.55 13,10C13,9.45 12.55,9 12,9V8C12.55,8 13,7.55 13,7C13,6.45 12.55,6 12,6V5.5C12,3.57 10.43,2 8.5,2H4Z' })
  );
};