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
    _react2.default.createElement('path', { d: 'M7.85,17.07C7.03,17.17 3.5,17.67 4.06,20.26C4.69,23.3 9.87,22.59 9.83,19C9.81,16.57 9.83,9.2 9.83,9.2C9.83,9.2 9.76,8.53 10.43,8.39L18.19,6.79C18.19,6.79 18.83,6.65 18.83,7.29C18.83,7.89 18.83,14.2 18.83,14.2C18.83,14.2 18.9,14.83 18.12,15C17.34,15.12 13.91,15.4 14.19,18C14.5,21.07 20,20.65 20,17.07V2.61C20,2.61 20.04,1.62 18.9,1.87L9.5,3.78C9.5,3.78 8.66,3.96 8.66,4.77C8.66,5.5 8.66,16.11 8.66,16.11C8.66,16.11 8.66,16.96 7.85,17.07Z' })
  );
};