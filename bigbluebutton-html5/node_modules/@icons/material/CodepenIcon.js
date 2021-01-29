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
    _react2.default.createElement('path', { d: 'M15.09,12L12,14.08V14.09L8.91,12L12,9.92V9.92L15.09,12M12,2C11.84,2 11.68,2.06 11.53,2.15L2.5,8.11C2.27,8.22 2.09,8.43 2,8.67V14.92C2,15.33 2,15.33 2.15,15.53L11.53,21.86C11.67,21.96 11.84,22 12,22C12.16,22 12.33,21.95 12.47,21.85L21.85,15.5C22,15.33 22,15.33 22,14.92V8.67C21.91,8.42 21.73,8.22 21.5,8.1L12.47,2.15C12.32,2.05 12.16,2 12,2M16.58,13L19.59,15.04L12.83,19.6V15.53L16.58,13M19.69,8.9L16.58,11L12.83,8.47V4.38L19.69,8.9M20.33,10.47V13.53L18.07,12L20.33,10.47M7.42,13L11.17,15.54V19.6L4.41,15.04L7.42,13M4.31,8.9L11.17,4.39V8.5L7.42,11L4.31,8.9M3.67,10.5L5.93,12L3.67,13.54V10.5Z' })
  );
};