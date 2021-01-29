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
    _react2.default.createElement('path', { d: 'M18,14C20.21,14 22,15.79 22,18C22,20.21 20.21,22 18,22C15.79,22 14,20.21 14,18L14.09,17.15C14.05,16.45 13.92,15.84 13.55,15.5C13.35,15.3 13.07,15.19 12.75,15.13C11.79,15.68 10.68,16 9.5,16C5.91,16 3,13.09 3,9.5C3,5.91 5.91,3 9.5,3C13.09,3 16,5.91 16,9.5C16,10.68 15.68,11.79 15.13,12.75C15.19,13.07 15.3,13.35 15.5,13.55C15.84,13.92 16.45,14.05 17.15,14.09L18,14M7.5,10C8.33,10 9,10.67 9,11.5C9,12.33 8.33,13 7.5,13C6.67,13 6,12.33 6,11.5C6,10.67 6.67,10 7.5,10M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z' })
  );
};