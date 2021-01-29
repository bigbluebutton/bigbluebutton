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
    _react2.default.createElement('path', { d: 'M18.5,15C16.57,15 15,13.43 15,11.5C15,9.57 16.57,8 18.5,8C20.43,8 22,9.57 22,11.5C22,13.43 20.43,15 18.5,15M5.5,15C3.57,15 2,13.43 2,11.5C2,9.57 3.57,8 5.5,8C7.43,8 9,9.57 9,11.5C9,13.43 7.43,15 5.5,15M18.5,6C15.46,6 13,8.46 13,11.5C13,12.83 13.47,14.05 14.26,15H9.74C10.53,14.05 11,12.83 11,11.5C11,8.46 8.54,6 5.5,6C2.46,6 0,8.46 0,11.5C0,14.54 2.46,17 5.5,17H18.5C21.54,17 24,14.54 24,11.5C24,8.46 21.54,6 18.5,6Z' })
  );
};