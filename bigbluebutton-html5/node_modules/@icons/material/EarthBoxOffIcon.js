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
    _react2.default.createElement('path', { d: 'M23,4.27L21,6.27V19C21,20.1 20.1,21 19,21H6.27L4.27,23L3,21.72L21.72,3L23,4.27M5,3H19.18L17.18,5H15.78C15.67,6 14.83,6.79 13.8,6.79H11.8V8.79C11.8,9.35 11.35,9.79 10.8,9.79H8.8V11.79H10.38L8.55,13.62L5,10.29V17.18L3,19.18V5C3,3.89 3.89,3 5,3M11.8,19V17.79C11.17,17.79 10.6,17.5 10.23,17.04L8.27,19H11.8M15.8,12.79V15.79H16.8C17.69,15.79 18.74,16.38 19,17.18V8.27L15.33,11.94C15.61,12.12 15.8,12.43 15.8,12.79Z' })
  );
};