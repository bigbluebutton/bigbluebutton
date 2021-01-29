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
    _react2.default.createElement('path', { d: 'M7.93,11.24C7.74,11 7.38,10.94 7.13,11.13C7.06,11.19 7,11.26 6.96,11.34L2.06,21.15C1.91,21.44 2.03,21.79 2.32,21.94C2.4,22 2.5,22 2.59,22H9.41C9.63,22 9.84,21.88 9.94,21.68C11.41,18.63 10.5,14 7.93,11.24M11.53,2.31C9.05,6.14 8.76,11 10.77,15.09L14.06,21.68C14.17,21.88 14.37,22 14.59,22H21.41C21.74,22 22,21.74 22,21.41C22,21.32 22,21.23 21.94,21.15C21.94,21.15 12.76,2.77 12.5,2.31C12.39,2.04 12.06,1.92 11.78,2.06C11.67,2.11 11.58,2.2 11.53,2.31Z' })
  );
};