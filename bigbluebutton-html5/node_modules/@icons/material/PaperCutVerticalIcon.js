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
    _react2.default.createElement('path', { d: 'M11.43,3.23L12,4L12.57,3.23V3.24C13.12,2.5 14,2 15,2C16.66,2 18,3.34 18,5C18,5.35 17.94,5.69 17.83,6H20C21.1,6 22,6.9 22,8V20C22,21.1 21.1,22 20,22H4C2.9,22 2,21.1 2,20V8C2,6.9 2.9,6 4,6H6.17C6.06,5.69 6,5.35 6,5C6,3.34 7.34,2 9,2C10,2 10.88,2.5 11.43,3.24V3.23M4,8V20H11C11,19.45 11.45,19 12,19C12.55,19 13,19.45 13,20H20V8H15L14.9,8L17,10.92L15.4,12.1L12.42,8H11.58L8.6,12.1L7,10.92L9.1,8H9L4,8M9,4C8.45,4 8,4.45 8,5C8,5.55 8.45,6 9,6C9.55,6 10,5.55 10,5C10,4.45 9.55,4 9,4M15,4C14.45,4 14,4.45 14,5C14,5.55 14.45,6 15,6C15.55,6 16,5.55 16,5C16,4.45 15.55,4 15,4M12,16C12.55,16 13,16.45 13,17C13,17.55 12.55,18 12,18C11.45,18 11,17.55 11,17C11,16.45 11.45,16 12,16M12,13C12.55,13 13,13.45 13,14C13,14.55 12.55,15 12,15C11.45,15 11,14.55 11,14C11,13.45 11.45,13 12,13M12,10C12.55,10 13,10.45 13,11C13,11.55 12.55,12 12,12C11.45,12 11,11.55 11,11C11,10.45 11.45,10 12,10Z' })
  );
};