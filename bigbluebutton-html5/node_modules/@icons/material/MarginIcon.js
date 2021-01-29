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
    _react2.default.createElement('path', { d: 'M20,4V9L18.5,7.5L5.5,20.5L3.5,18.5L16.5,5.5L15,4H20M17,20C15.34,20 14,18.66 14,17V15C14,13.34 15.34,12 17,12C18.66,12 20,13.34 20,15V17C20,18.66 18.66,20 17,20M17,14C16.45,14 16,14.45 16,15V17C16,17.55 16.45,18 17,18C17.55,18 18,17.55 18,17V15C18,14.45 17.55,14 17,14M7,12C5.34,12 4,10.66 4,9V7C4,5.34 5.34,4 7,4C8.66,4 10,5.34 10,7V9C10,10.66 8.66,12 7,12M7,6C6.45,6 6,6.45 6,7V9C6,9.55 6.45,10 7,10C7.55,10 8,9.55 8,9V7C8,6.45 7.55,6 7,6Z' })
  );
};