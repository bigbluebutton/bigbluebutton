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
    _react2.default.createElement('path', { d: 'M4.8,3C3.8,3 3,3.8 3,4.8V19.2C3,20.2 3.8,21 4.8,21H19.2C20.2,21 21,20.2 21,19.2V4.8C21,3.8 20.2,3 19.2,3M16.07,5H18.11C18.23,5 18.33,5.04 18.37,5.13C18.43,5.22 18.43,5.33 18.37,5.44L13.9,13.36L16.75,18.56C16.81,18.67 16.81,18.78 16.75,18.87C16.7,18.95 16.61,19 16.5,19H14.47C14.16,19 14,18.79 13.91,18.61L11.04,13.35C11.18,13.1 15.53,5.39 15.53,5.39C15.64,5.19 15.77,5 16.07,5M7.09,7.76H9.1C9.41,7.76 9.57,7.96 9.67,8.15L11.06,10.57C10.97,10.71 8.88,14.42 8.88,14.42C8.77,14.61 8.63,14.81 8.32,14.81H6.3C6.18,14.81 6.09,14.76 6.04,14.67C6,14.59 6,14.47 6.04,14.36L8.18,10.57L6.82,8.2C6.77,8.09 6.75,8 6.81,7.89C6.86,7.81 6.96,7.76 7.09,7.76Z' })
  );
};