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
    _react2.default.createElement('path', { d: 'M22,11.5C22,10.1 20.9,9 19.5,9C18.9,9 18.3,9.2 17.9,9.6C16.4,8.7 14.6,8.1 12.5,8L13.6,4L17,5C17,6.1 17.9,7 19,7C20.1,7 21,6.1 21,5C21,3.9 20.1,3 19,3C18.3,3 17.6,3.4 17.3,4L13.3,3C13,2.9 12.8,3.1 12.7,3.4L11.5,8C9.5,8.1 7.6,8.7 6.1,9.6C5.7,9.2 5.1,9 4.5,9C3.1,9 2,10.1 2,11.5C2,12.4 2.4,13.1 3.1,13.6L3,14.5C3,18.1 7,21 12,21C17,21 21,18.1 21,14.5L20.9,13.6C21.6,13.1 22,12.4 22,11.5M9,11.8C9.7,11.8 10.2,12.4 10.2,13C10.2,13.6 9.7,14.2 9,14.2C8.3,14.2 7.8,13.7 7.8,13C7.8,12.3 8.3,11.8 9,11.8M15.8,17.2C14,18.3 10,18.3 8.2,17.2C8,17 7.9,16.7 8.1,16.5C8.3,16.3 8.6,16.2 8.8,16.4C10,17.3 14,17.3 15.2,16.4C15.4,16.2 15.7,16.3 15.9,16.5C16.1,16.7 16,17 15.8,17.2M15,14.2C14.3,14.2 13.8,13.6 13.8,13C13.8,12.3 14.4,11.8 15,11.8C15.7,11.8 16.2,12.4 16.2,13C16.2,13.7 15.7,14.2 15,14.2Z' })
  );
};