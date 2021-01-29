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
    _react2.default.createElement('path', { d: 'M18,10H13V7.59L22.12,6.07L21.88,4.59L16.41,5.5C16.46,5.35 16.5,5.18 16.5,5C16.5,4.17 15.83,3.5 15,3.5C14.17,3.5 13.5,4.17 13.5,5C13.5,5.35 13.63,5.68 13.84,5.93L13,6.07V5H11V6.41L10.41,6.5C10.46,6.35 10.5,6.18 10.5,6C10.5,5.17 9.83,4.5 9,4.5C8.17,4.5 7.5,5.17 7.5,6C7.5,6.36 7.63,6.68 7.83,6.93L1.88,7.93L2.12,9.41L11,7.93V10H6C4.89,10 4,10.9 4,12V18C4,19.1 4.9,20 6,20H18C19.1,20 20,19.1 20,18V12C20,10.9 19.1,10 18,10M6,12H8.25V16H6V12M9.75,16V12H14.25V16H9.75M18,16H15.75V12H18V16Z' })
  );
};