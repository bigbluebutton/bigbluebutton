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
    _react2.default.createElement('path', { d: 'M19,13V7H20V4H4V7H5V13H2C2,13.93 2.5,14.71 3.5,14.93V20C3.5,20.55 3.95,21 4.5,21H5.5C6.05,21 6.5,20.55 6.5,20V19H17.5V20C17.5,20.55 17.95,21 18.5,21H19.5C20.05,21 20.5,20.55 20.5,20V14.93C21.5,14.7 22,13.93 22,13H19M8,15C7.17,15 6.5,14.33 6.5,13.5C6.5,12.67 7.17,12 8,12C8.83,12 9.5,12.67 9.5,13.5C9.5,14.33 8.83,15 8,15M16,15C15.17,15 14.5,14.33 14.5,13.5C14.5,12.67 15.17,12 16,12C16.83,12 17.5,12.67 17.5,13.5C17.5,14.33 16.83,15 16,15M17.5,10.5C15.92,10.18 14.03,10 12,10C9.97,10 8,10.18 6.5,10.5V7H17.5V10.5Z' })
  );
};