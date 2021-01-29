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
    _react2.default.createElement('path', { d: 'M5,3H7V5H5V10C5,11.1 4.1,12 3,12C4.1,12 5,12.9 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15C3,13.9 2.1,13 1,13H0V11H1C2.1,11 3,10.1 3,9V5C3,3.9 3.9,3 5,3M19,3C20.1,3 21,3.9 21,5V9C21,10.1 21.9,11 23,11H24V13H23C21.9,13 21,13.9 21,15V19C21,20.1 20.1,21 19,21H17V19H19V14C19,12.9 19.9,12 21,12C19.9,12 19,11.1 19,10V5H17V3H19M12,15C12.55,15 13,15.45 13,16C13,16.55 12.55,17 12,17C11.45,17 11,16.55 11,16C11,15.45 11.45,15 12,15M8,15C8.55,15 9,15.45 9,16C9,16.55 8.55,17 8,17C7.45,17 7,16.55 7,16C7,15.45 7.45,15 8,15M16,15C16.55,15 17,15.45 17,16C17,16.55 16.55,17 16,17C15.45,17 15,16.55 15,16C15,15.45 15.45,15 16,15Z' })
  );
};