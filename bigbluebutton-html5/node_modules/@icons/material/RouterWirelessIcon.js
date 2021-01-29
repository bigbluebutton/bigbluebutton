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
    _react2.default.createElement('path', { d: 'M4,13H20C20.55,13 21,13.45 21,14V18C21,18.55 20.55,19 20,19H4C3.45,19 3,18.55 3,18V14C3,13.45 3.45,13 4,13M9,17H10V15H9V17M5,15V17H7V15H5M19,6.93L17.6,8.34C16.15,6.89 14.15,6 11.93,6C9.72,6 7.72,6.89 6.27,8.34L4.87,6.93C6.68,5.12 9.18,4 11.93,4C14.69,4 17.19,5.12 19,6.93M16.17,9.76L14.77,11.17C14.04,10.45 13.04,10 11.93,10C10.82,10 9.82,10.45 9.1,11.17L7.7,9.76C8.78,8.67 10.28,8 11.93,8C13.58,8 15.08,8.67 16.17,9.76Z' })
  );
};