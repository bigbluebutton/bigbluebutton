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
    _react2.default.createElement('path', { d: 'M10,2H14C14.55,2 15,2.45 15,3H21V21H19C19,21.55 18.55,22 18,22C17.45,22 17,21.55 17,21H7C7,21.55 6.55,22 6,22C5.45,22 5,21.55 5,21H3V3H9C9,2.45 9.45,2 10,2M5,5V9H19V5H5M7,6C7.55,6 8,6.45 8,7C8,7.55 7.55,8 7,8C6.45,8 6,7.55 6,7C6,6.45 6.45,6 7,6M12,6H14V7H12V6M15,6H16V8H15V6M17,6H18V8H17V6M12,11C9.79,11 8,12.79 8,15C8,17.21 9.79,19 12,19C14.21,19 16,17.21 16,15C16,12.79 14.21,11 12,11M10,6C10.55,6 11,6.45 11,7C11,7.55 10.55,8 10,8C9.45,8 9,7.55 9,7C9,6.45 9.45,6 10,6Z' })
  );
};