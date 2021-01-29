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
    _react2.default.createElement('path', { d: 'M6,6L6.69,6.06C7.32,3.72 9.46,2 12,2C15.04,2 17.5,4.46 17.5,7.5L17.42,8.45C17.88,8.16 18.42,8 19,8C20.66,8 22,9.34 22,11C22,12.66 20.66,14 19,14H6C3.79,14 2,12.21 2,10C2,7.79 3.79,6 6,6M6,8C4.9,8 4,8.9 4,10C4,11.1 4.9,12 6,12H19C19.55,12 20,11.55 20,11C20,10.45 19.55,10 19,10H15.5V7.5C15.5,5.57 13.93,4 12,4C10.07,4 8.5,5.57 8.5,7.5V8H6M18,18H4C3.45,18 3,17.55 3,17C3,16.45 3.45,16 4,16H18C19.66,16 21,17.34 21,19C21,20.66 19.66,22 18,22C17.17,22 16.42,21.66 15.88,21.12C15.5,20.73 15.5,20.1 15.88,19.71C16.27,19.32 16.9,19.32 17.29,19.71C17.47,19.89 17.72,20 18,20C18.55,20 19,19.55 19,19C19,18.45 18.55,18 18,18Z' })
  );
};