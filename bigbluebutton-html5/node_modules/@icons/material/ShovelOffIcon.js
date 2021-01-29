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
    _react2.default.createElement('path', { d: 'M15.1,1.81L12.27,4.65C11.5,5.43 11.5,6.69 12.27,7.47L13.68,8.89L13,9.62L14.44,11.06L15.17,10.33L16.56,11.72C17.34,12.5 18.61,12.5 19.39,11.72L22.22,8.88L15.1,1.81M17.93,10.28L13.7,6.06L15.11,4.65L19.34,8.88L17.93,10.28M20.7,20.24L19.29,21.65L11.5,13.88L10.5,14.88L13.33,17.69L12,19.09C7,24 3.5,20.5 3.5,20.5C3.5,20.5 -0.06,17 4.89,12L6.31,10.6L9.13,13.43L10.13,12.43L2.35,4.68L3.77,3.26L20.7,20.24Z' })
  );
};