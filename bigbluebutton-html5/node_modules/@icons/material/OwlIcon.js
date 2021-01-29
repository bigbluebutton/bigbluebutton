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
    _react2.default.createElement('path', { d: 'M12,16C12.56,16.84 13.31,17.53 14.2,18L12,20.2L9.8,18C10.69,17.53 11.45,16.84 12,16M17,11.2C15.9,11.2 15,12.1 15,13.2C15,14.3 15.9,15.2 17,15.2C18.1,15.2 19,14.3 19,13.2C19,12.09 18.1,11.2 17,11.2M7,11.2C5.9,11.2 5,12.1 5,13.2C5,14.3 5.9,15.2 7,15.2C8.1,15.2 9,14.3 9,13.2C9,12.09 8.1,11.2 7,11.2M17,8.7C19.21,8.7 21,10.49 21,12.7C21,14.91 19.21,16.7 17,16.7C14.79,16.7 13,14.91 13,12.7C13,10.49 14.79,8.7 17,8.7M7,8.7C9.21,8.7 11,10.49 11,12.7C11,14.91 9.21,16.7 7,16.7C4.79,16.7 3,14.91 3,12.7C3,10.49 4.79,8.7 7,8.7M2.24,1C4,4.7 2.73,7.46 1.55,10.2C1.19,11 1,11.83 1,12.7C1,16.01 3.69,18.7 7,18.7C7.21,18.69 7.42,18.68 7.63,18.65L10.59,21.61L12,23L13.41,21.61L16.37,18.65C16.58,18.68 16.79,18.69 17,18.7C20.31,18.7 23,16.01 23,12.7C23,11.83 22.81,11 22.45,10.2C21.27,7.46 20,4.7 21.76,1C19.12,3.06 15.36,4.69 12,4.7C8.64,4.69 4.88,3.06 2.24,1Z' })
  );
};