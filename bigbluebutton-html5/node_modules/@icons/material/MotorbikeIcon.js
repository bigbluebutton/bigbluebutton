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
    _react2.default.createElement('path', { d: 'M16.36,4.27H18.55V2.13H16.36V1.07H18.22C17.89,0.43 17.13,0 16.36,0C15.16,0 14.18,0.96 14.18,2.13C14.18,3.31 15.16,4.27 16.36,4.27M10.04,9.39L13,6.93L17.45,9.6H10.25M19.53,12.05L21.05,10.56C21.93,9.71 21.93,8.43 21.05,7.57L19.2,9.39L13.96,4.27C13.64,3.73 13,3.41 12.33,3.41C11.78,3.41 11.35,3.63 11,3.95L7,7.89C6.65,8.21 6.44,8.64 6.44,9.17V9.71H5.13C4.04,9.71 3.16,10.67 3.16,11.84V12.27C3.5,12.16 3.93,12.16 4.25,12.16C7.09,12.16 9.5,14.4 9.5,17.28C9.5,17.6 9.5,18.03 9.38,18.35H14.5C14.4,18.03 14.4,17.6 14.4,17.28C14.4,14.29 16.69,12.05 19.53,12.05M4.36,19.73C2.84,19.73 1.64,18.56 1.64,17.07C1.64,15.57 2.84,14.4 4.36,14.4C5.89,14.4 7.09,15.57 7.09,17.07C7.09,18.56 5.89,19.73 4.36,19.73M4.36,12.8C1.96,12.8 0,14.72 0,17.07C0,19.41 1.96,21.33 4.36,21.33C6.76,21.33 8.73,19.41 8.73,17.07C8.73,14.72 6.76,12.8 4.36,12.8M19.64,19.73C18.11,19.73 16.91,18.56 16.91,17.07C16.91,15.57 18.11,14.4 19.64,14.4C21.16,14.4 22.36,15.57 22.36,17.07C22.36,18.56 21.16,19.73 19.64,19.73M19.64,12.8C17.24,12.8 15.27,14.72 15.27,17.07C15.27,19.41 17.24,21.33 19.64,21.33C22.04,21.33 24,19.41 24,17.07C24,14.72 22.04,12.8 19.64,12.8Z' })
  );
};