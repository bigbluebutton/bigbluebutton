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
    _react2.default.createElement('path', { d: 'M15.39,14.04V14.04C15.39,12.62 14.24,11.47 12.82,11.47C11.41,11.47 10.26,12.62 10.26,14.04V14.04C10.26,15.45 11.41,16.6 12.82,16.6C14.24,16.6 15.39,15.45 15.39,14.04M17.1,14.04C17.1,16.4 15.18,18.31 12.82,18.31C11.19,18.31 9.77,17.39 9.05,16.04C8.33,17.39 6.91,18.31 5.28,18.31C2.94,18.31 1.04,16.43 1,14.11V14.11H1V7H1V7C1,6.56 1.39,6.18 1.86,6.18C2.33,6.18 2.7,6.56 2.71,7V7H2.71V10.62C3.43,10.08 4.32,9.76 5.28,9.76C6.91,9.76 8.33,10.68 9.05,12.03C9.77,10.68 11.19,9.76 12.82,9.76C15.18,9.76 17.1,11.68 17.1,14.04V14.04M7.84,14.04V14.04C7.84,12.62 6.69,11.47 5.28,11.47C3.86,11.47 2.71,12.62 2.71,14.04V14.04C2.71,15.45 3.86,16.6 5.28,16.6C6.69,16.6 7.84,15.45 7.84,14.04M22.84,16.96V16.96C22.95,17.12 23,17.3 23,17.47C23,17.73 22.88,18 22.66,18.15C22.5,18.26 22.33,18.32 22.15,18.32C21.9,18.32 21.65,18.21 21.5,18L19.59,15.47L17.7,18V18C17.53,18.21 17.28,18.32 17.03,18.32C16.85,18.32 16.67,18.26 16.5,18.15C16.29,18 16.17,17.72 16.17,17.46C16.17,17.29 16.23,17.11 16.33,16.96V16.96H16.33V16.96L18.5,14.04L16.33,11.11V11.11H16.33V11.11C16.22,10.96 16.17,10.79 16.17,10.61C16.17,10.35 16.29,10.1 16.5,9.93C16.89,9.65 17.41,9.72 17.7,10.09V10.09L19.59,12.61L21.5,10.09C21.76,9.72 22.29,9.65 22.66,9.93C22.89,10.1 23,10.36 23,10.63C23,10.8 22.95,10.97 22.84,11.11V11.11H22.84V11.11L20.66,14.04L22.84,16.96V16.96H22.84Z' })
  );
};