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
    _react2.default.createElement('path', { d: 'M20.08,13.64C21.17,13.81 22,14.75 22,15.89C22,16.78 21.5,17.55 20.75,17.92L20.58,18H9.18L9.16,18V18C7.71,18 6.54,16.81 6.54,15.36C6.54,13.9 7.72,12.72 9.18,12.72L9.4,12.73L9.39,12.53C9.39,10.71 10.87,9.23 12.69,9.23C13.97,9.23 15.08,9.96 15.63,11C16.08,10.73 16.62,10.55 17.21,10.55C18.8,10.55 20.09,11.84 20.09,13.43L20.08,13.64M8.82,12.16C7.21,12.34 5.96,13.7 5.96,15.36C5.96,16.04 6.17,16.66 6.5,17.18H4.73C3.22,17.18 2,15.96 2,14.45C2,13 3.12,11.83 4.53,11.73L4.46,11.06C4.46,9.36 5.84,8 7.54,8C8.17,8 8.77,8.18 9.26,8.5C9.95,7.11 11.4,6.15 13.07,6.15C15.27,6.15 17.08,7.83 17.3,9.97H17.21C16.73,9.97 16.27,10.07 15.84,10.25C15.12,9.25 13.96,8.64 12.69,8.64C10.67,8.64 9,10.19 8.82,12.16Z' })
  );
};