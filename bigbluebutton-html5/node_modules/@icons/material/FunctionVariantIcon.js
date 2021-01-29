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
    _react2.default.createElement('path', { d: 'M12.42,5.29C11.32,5.19 10.35,6 10.25,7.11L10,10H12.82V12H9.82L9.38,17.07C9.18,19.27 7.24,20.9 5.04,20.7C3.79,20.59 2.66,19.9 2,18.83L3.5,17.33C3.83,18.38 4.96,18.97 6,18.63C6.78,18.39 7.33,17.7 7.4,16.89L7.82,12H4.82V10H8L8.27,6.93C8.46,4.73 10.39,3.1 12.6,3.28C13.86,3.39 15,4.09 15.66,5.17L14.16,6.67C13.91,5.9 13.23,5.36 12.42,5.29M22,13.65L20.59,12.24L17.76,15.07L14.93,12.24L13.5,13.65L16.35,16.5L13.5,19.31L14.93,20.72L17.76,17.89L20.59,20.72L22,19.31L19.17,16.5L22,13.65Z' })
  );
};