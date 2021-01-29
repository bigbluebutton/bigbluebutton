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
    _react2.default.createElement('path', { d: 'M8,3C11.31,3 14,5.69 14,9C14,12.31 11.31,15 8,15C4.69,15 2,12.31 2,9C2,5.69 4.69,3 8,3M21,8C21.55,8 22,8.45 22,9C22,9.55 21.55,10 21,10C20.45,10 20,9.55 20,9C20,8.45 20.45,8 21,8M17.5,10C18.88,10 20,11.12 20,12.5C20,13.88 18.88,15 17.5,15C16.12,15 15,13.88 15,12.5C15,11.12 16.12,10 17.5,10M17.5,16C19.16,16 20.5,17.34 20.5,19C20.5,20.66 19.16,22 17.5,22C15.84,22 14.5,20.66 14.5,19C14.5,17.34 15.84,16 17.5,16Z' })
  );
};