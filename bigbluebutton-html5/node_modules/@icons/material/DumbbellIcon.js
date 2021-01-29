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
    _react2.default.createElement('path', { d: 'M4.22,14.12L3.5,13.41C2.73,12.63 2.73,11.37 3.5,10.59C4.3,9.8 5.56,9.8 6.34,10.59L8.92,13.16L13.16,8.92L10.59,6.34C9.8,5.56 9.8,4.3 10.59,3.5C11.37,2.73 12.63,2.73 13.41,3.5L14.12,4.22L19.78,9.88L20.5,10.59C21.27,11.37 21.27,12.63 20.5,13.41C19.7,14.2 18.44,14.2 17.66,13.41L15.08,10.84L10.84,15.08L13.41,17.66C14.2,18.44 14.2,19.7 13.41,20.5C12.63,21.27 11.37,21.27 10.59,20.5L9.88,19.78L4.22,14.12M3.16,19.42L4.22,18.36L2.81,16.95C2.42,16.56 2.42,15.93 2.81,15.54C3.2,15.15 3.83,15.15 4.22,15.54L8.46,19.78C8.85,20.17 8.85,20.8 8.46,21.19C8.07,21.58 7.44,21.58 7.05,21.19L5.64,19.78L4.58,20.84L3.16,19.42M19.42,3.16L20.84,4.58L19.78,5.64L21.19,7.05C21.58,7.44 21.58,8.07 21.19,8.46C20.8,8.86 20.17,8.86 19.78,8.46L15.54,4.22C15.15,3.83 15.15,3.2 15.54,2.81C15.93,2.42 16.56,2.42 16.95,2.81L18.36,4.22L19.42,3.16Z' })
  );
};