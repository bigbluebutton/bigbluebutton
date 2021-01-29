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
    _react2.default.createElement('path', { d: 'M10,3L8,16H16L14,3H10M11.5,5.75C11.91,5.75 12.25,6.09 12.25,6.5C12.25,6.91 11.91,7.25 11.5,7.25C11.09,7.25 10.75,6.91 10.75,6.5C10.75,6.09 11.09,5.75 11.5,5.75M12.5,8.5C13.05,8.5 13.5,8.95 13.5,9.5C13.5,10.05 13.05,10.5 12.5,10.5C11.95,10.5 11.5,10.05 11.5,9.5C11.5,8.95 11.95,8.5 12.5,8.5M11.5,12C12.33,12 13,12.67 13,13.5C13,14.33 12.33,15 11.5,15C10.67,15 10,14.33 10,13.5C10,12.67 10.67,12 11.5,12M8,17L10,19L8,21H16L14,19L16,17H8Z' })
  );
};