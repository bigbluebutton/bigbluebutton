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
    _react2.default.createElement('path', { d: 'M5,3H7L10,5L7,7V8.33C8.47,8.12 10.18,8 12,8C13.82,8 15.53,8.12 17,8.33V3H19L22,5L19,7V8.71C20.85,9.17 22,9.8 22,10.5C22,11.88 17.5,13 12,13C6.5,13 2,11.88 2,10.5C2,9.8 3.15,9.17 5,8.71V3M12,9.5C8.69,9.5 7,9.67 7,10.5C7,11.33 8.69,11.5 12,11.5C15.31,11.5 17,11.33 17,10.5C17,9.67 15.31,9.5 12,9.5M12,14.75C15.81,14.75 19.2,14.08 21.4,13.05L20,21H15V19C15,17.9 14.1,17 13,17H11C9.9,17 9,17.9 9,19V21H4L2.6,13.05C4.8,14.08 8.19,14.75 12,14.75Z' })
  );
};