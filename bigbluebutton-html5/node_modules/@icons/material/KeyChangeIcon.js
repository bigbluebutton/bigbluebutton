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
    _react2.default.createElement('path', { d: 'M6.5,2C8.46,2 10.13,3.25 10.74,5H22V8H18V11H15V8H10.74C10.13,9.75 8.46,11 6.5,11C4,11 2,9 2,6.5C2,4 4,2 6.5,2M6.5,5C5.67,5 5,5.67 5,6.5C5,7.33 5.67,8 6.5,8C7.33,8 8,7.33 8,6.5C8,5.67 7.33,5 6.5,5M6.5,13C8.46,13 10.13,14.25 10.74,16H22V19H20V22H18V19H16V22H13V19H10.74C10.13,20.75 8.46,22 6.5,22C4,22 2,20 2,17.5C2,15 4,13 6.5,13M6.5,16C5.67,16 5,16.67 5,17.5C5,18.33 5.67,19 6.5,19C7.33,19 8,18.33 8,17.5C8,16.67 7.33,16 6.5,16Z' })
  );
};