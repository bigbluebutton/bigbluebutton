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
    _react2.default.createElement('path', { d: 'M17.09,19.72C14.73,21.08 11.5,21.22 8.23,19.82C5.59,18.7 3.4,16.74 2,14.5C2.67,15.05 3.46,15.5 4.3,15.9C7.67,17.47 11.03,17.36 13.4,15.9C10.03,13.31 7.16,9.94 5.03,7.19C4.58,6.74 4.25,6.18 3.91,5.68C12.19,11.73 11.83,13.27 6.32,4.67C11.21,9.61 15.75,12.41 15.75,12.41C15.91,12.5 16,12.57 16.11,12.63C16.21,12.38 16.3,12.12 16.37,11.85C17.16,9 16.26,5.73 14.29,3.04C18.84,5.79 21.54,10.95 20.41,15.28C20.38,15.39 20.35,15.5 20.36,15.67C22.6,18.5 22,21.45 21.71,20.89C20.5,18.5 18.23,19.24 17.09,19.72V19.72Z' })
  );
};