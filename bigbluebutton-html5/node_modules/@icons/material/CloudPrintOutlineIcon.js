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
    _react2.default.createElement('path', { d: 'M19,16C20.66,16 22,14.66 22,13C22,11.34 20.66,10 19,10H17.5V9.5C17.5,6.46 15.04,4 12,4C9.5,4 7.37,5.69 6.71,8H6C3.79,8 2,9.79 2,12C2,14.21 3.79,16 6,16V11H18V16H19M19.36,8.04C21.95,8.22 24,10.36 24,13C24,15.76 21.76,18 19,18H18V22H6V18C2.69,18 0,15.31 0,12C0,8.91 2.34,6.36 5.35,6.04C6.6,3.64 9.11,2 12,2C15.64,2 18.67,4.6 19.36,8.04M8,13V20H16V13H8M9,18H15V19H9V18M15,17H9V16H15V17M9,14H15V15H9V14Z' })
  );
};