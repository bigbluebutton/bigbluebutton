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
    _react2.default.createElement('path', { d: 'M4,12H20C20,8.27 17.44,5.13 14,4.25C13.86,5.24 13,6 12,6C11,6 10.14,5.24 10,4.25C6.56,5.13 4,8.27 4,12M12,2C17.52,2 22,6.48 22,12C22,13.1 21.1,14 20,14H4C2.9,14 2,13.1 2,12C2,6.48 6.48,2 12,2M13.5,17H10.5L9.92,19L9.65,20H14.35L14.08,19L13.5,17M15,15L16,18.5L16.27,19.45L16.35,20C16.35,21.1 15.45,22 14.35,22H9.65L9.17,21.94C8.1,21.66 7.45,20.57 7.73,19.5L8,18.5L9,15H15M16,7C17.1,7 18,7.9 18,9C18,10.1 17.1,11 16,11C14.9,11 14,10.1 14,9C14,7.9 14.9,7 16,7M8,7C9.1,7 10,7.9 10,9C10,10.1 9.1,11 8,11C6.9,11 6,10.1 6,9C6,7.9 6.9,7 8,7Z' })
  );
};