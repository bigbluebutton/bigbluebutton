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
    _react2.default.createElement('path', { d: 'M8,3.28L6.6,1.86L5.74,2.57L7.16,4M16.47,18.39C15.26,19.39 13.7,20 12,20C8.13,20 5,16.87 5,13C5,11.3 5.61,9.74 6.61,8.53M2.92,2.29L1.65,3.57L3,4.9L1.87,5.83L3.29,7.25L4.4,6.31L5.2,7.11C3.83,8.69 3,10.75 3,13C3,17.97 7.03,22 12,22C14.25,22 16.31,21.17 17.89,19.8L20.09,22L21.36,20.73L3.89,3.27L2.92,2.29M22,5.72L17.4,1.86L16.11,3.39L20.71,7.25L22,5.72M12,6C15.87,6 19,9.13 19,13C19,13.84 18.84,14.65 18.57,15.4L20.09,16.92C20.67,15.73 21,14.41 21,13C21,8.03 16.97,4 12,4C10.59,4 9.27,4.33 8.08,4.91L9.6,6.43C10.35,6.16 11.16,6 12,6Z' })
  );
};