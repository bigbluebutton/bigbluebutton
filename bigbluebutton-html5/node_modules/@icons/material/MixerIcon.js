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
    _react2.default.createElement('path', { d: 'M5.68,3.96L11.41,11.65C11.55,11.84 11.55,12.1 11.41,12.29L5.65,20L5.5,20.18C4.76,21 3.47,21.07 2.64,20.31C1.85,19.59 1.79,18.37 2.43,17.5L6.56,11.97L2.46,6.47C1.83,5.62 1.88,4.39 2.67,3.67L2.82,3.54C3.73,2.87 5,3.05 5.68,3.96M18.32,3.96C19,3.05 20.27,2.87 21.18,3.54L21.33,3.67C22.12,4.39 22.17,5.61 21.54,6.47L17.44,11.97L21.57,17.5C22.21,18.36 22.15,19.59 21.36,20.31C20.53,21.07 19.24,21 18.5,20.18L18.35,20L12.59,12.29C12.45,12.1 12.45,11.84 12.59,11.65L18.32,3.96Z' })
  );
};