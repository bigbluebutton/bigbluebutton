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
    _react2.default.createElement('path', { d: 'M21,6V11H19.5V7.5H13.87L16.3,9.93L15.24,11L11,6.75L15.24,2.5L16.3,3.57L13.87,6H21M8.82,8.58C9.08,8.32 9.17,7.93 9.06,7.58C8.69,6.42 8.5,5.22 8.5,4C8.5,3.45 8.05,3 7.5,3H4C3.45,3 3,3.45 3,4C3,13.39 10.61,21 20,21C20.55,21 21,20.55 21,20V16.5C21,15.95 20.55,15.5 20,15.5C18.79,15.5 17.58,15.31 16.43,14.93C16.08,14.82 15.69,14.91 15.43,15.17L13.23,17.37C10.39,15.92 8.09,13.62 6.64,10.78L8.82,8.58Z' })
  );
};