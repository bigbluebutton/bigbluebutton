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
    _react2.default.createElement('path', { d: 'M12,9C10.9,9 10,8.1 10,7C10,5.89 10.9,5 12,5C13.11,5 14,5.89 14,7C14,8.1 13.1,9 12,9M12,14C10.9,14 10,13.1 10,12C10,10.89 10.9,10 12,10C13.11,10 14,10.89 14,12C14,13.1 13.1,14 12,14M12,19C10.9,19 10,18.1 10,17C10,15.89 10.9,15 12,15C13.11,15 14,15.89 14,17C14,18.1 13.1,19 12,19M20,10H17V8.86C18.72,8.41 20,6.86 20,5H17V4C17,3.45 16.55,3 16,3H8C7.45,3 7,3.45 7,4V5H4C4,6.86 5.28,8.41 7,8.86V10H4C4,11.86 5.28,13.41 7,13.86V15H4C4,16.86 5.28,18.41 7,18.86V20C7,20.55 7.45,21 8,21H16C16.55,21 17,20.55 17,20V18.86C18.72,18.41 20,16.86 20,15H17V13.86C18.72,13.41 20,11.86 20,10Z' })
  );
};