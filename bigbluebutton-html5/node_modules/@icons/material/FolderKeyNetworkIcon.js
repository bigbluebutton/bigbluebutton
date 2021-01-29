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
    _react2.default.createElement('path', { d: 'M6,4C4.89,4 4,4.89 4,6V14C4,15.1 4.9,16 6,16H11V18H10C9.45,18 9,18.45 9,19H2V21H9C9,21.55 9.45,22 10,22H14C14.55,22 15,21.55 15,21H22V19H15C15,18.45 14.55,18 14,18H13V16H18C19.1,16 20,15.1 20,14V8C20,6.9 19.1,6 18,6H12L10,4H6M9,8C10.31,8 11.42,8.83 11.83,10H17V12H16V14H14V12H11.83C11.42,13.17 10.31,14 9,14C7.34,14 6,12.66 6,11C6,9.34 7.34,8 9,8M9,10C8.45,10 8,10.45 8,11C8,11.56 8.45,12 9,12C9.55,12 10,11.55 10,11C10,10.45 9.55,10 9,10Z' })
  );
};