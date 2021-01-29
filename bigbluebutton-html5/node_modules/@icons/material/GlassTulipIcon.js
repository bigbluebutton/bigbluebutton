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
    _react2.default.createElement('path', { d: 'M8,2H16C15.67,2.67 15.33,3.33 15.58,5C15.83,6.67 16.67,9.33 16.25,10.74C15.83,12.14 14.17,12.28 13.33,13.86C12.5,15.44 12.5,18.47 13.08,19.9C13.67,21.33 14.83,21.17 15.42,21.25C16,21.33 16,21.67 16,22H8C8,21.67 8,21.33 8.58,21.25C9.17,21.17 10.33,21.33 10.92,19.9C11.5,18.47 11.5,15.44 10.67,13.86C9.83,12.28 8.17,12.14 7.75,10.74C7.33,9.33 8.17,6.67 8.42,5C8.67,3.33 8.33,2.67 8,2M10,4C10,5.19 9.83,6.17 9.64,7H14.27C14.13,6.17 14,5.19 14,4H10Z' })
  );
};