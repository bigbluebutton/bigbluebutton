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
    _react2.default.createElement('path', { d: 'M2,5.27L3.28,4L20,20.72L18.73,22L14.73,18H13V16.27L9.73,13H8V11.27L5.5,8.76C4.5,9.5 3.9,10.68 3.9,12C3.9,14.26 5.74,16.1 8,16.1H11V18H8C4.69,18 2,15.31 2,12C2,10.16 2.83,8.5 4.14,7.41L2,5.27M16,6C19.31,6 22,8.69 22,12C22,14.21 20.8,16.15 19,17.19L17.6,15.77C19.07,15.15 20.1,13.7 20.1,12C20.1,9.73 18.26,7.9 16,7.9H13V6H16M8,6H11V7.9H9.72L7.82,6H8M16,11V13H14.82L12.82,11H16Z' })
  );
};