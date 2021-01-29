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
    _react2.default.createElement('path', { d: 'M6,14H8L11,17H9L6,14M4,4H5V3C5,2.45 5.45,2 6,2H10C10.55,2 11,2.45 11,3V4H13V3C13,2.45 13.45,2 14,2H18C18.55,2 19,2.45 19,3V4H20C21.1,4 22,4.9 22,6V19C22,20.1 21.1,21 20,21V22H17V21H7V22H4V21C2.9,21 2,20.1 2,19V6C2,4.9 2.9,4 4,4M18,7C18.55,7 19,7.45 19,8C19,8.55 18.55,9 18,9C17.45,9 17,8.55 17,8C17,7.45 17.45,7 18,7M14,7C14.55,7 15,7.45 15,8C15,8.55 14.55,9 14,9C13.45,9 13,8.55 13,8C13,7.45 13.45,7 14,7M20,6H4V10H20V6M4,19H20V12H4V19M6,7C6.55,7 7,7.45 7,8C7,8.55 6.55,9 6,9C5.45,9 5,8.55 5,8C5,7.45 5.45,7 6,7M13,14H15L18,17H16L13,14Z' })
  );
};