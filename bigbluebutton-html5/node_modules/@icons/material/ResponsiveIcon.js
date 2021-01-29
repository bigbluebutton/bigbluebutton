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
    _react2.default.createElement('path', { d: 'M4,6V16H9V12C9,10.9 9.9,10 11,10H16C17.1,10 18,10.9 18,12V16H20V6H4M0,20V18H4C2.9,18 2,17.1 2,16V6C2,4.9 2.9,4 4,4H20C21.1,4 22,4.9 22,6V16C22,17.1 21.1,18 20,18H24V20H18V20C18,21.11 17.1,22 16,22H11C9.9,22 9,21.1 9,20H9L0,20M11.5,20C11.22,20 11,20.22 11,20.5C11,20.78 11.22,21 11.5,21C11.78,21 12,20.78 12,20.5C12,20.22 11.78,20 11.5,20M15.5,20C15.22,20 15,20.22 15,20.5C15,20.78 15.22,21 15.5,21C15.78,21 16,20.78 16,20.5C16,20.22 15.78,20 15.5,20M13,20V21H14V20H13M11,12V19H16V12H11Z' })
  );
};