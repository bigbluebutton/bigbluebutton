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
    _react2.default.createElement('path', { d: 'M8.46,15.06L7.05,16.47L5.68,15.1C4.82,16.21 4.24,17.54 4.06,19H6V21H2V20C2,15.16 5.44,11.13 10,10.2V8.2L2,5V3H22V5L14,8.2V10.2C18.56,11.13 22,15.16 22,20V21H18V19H19.94C19.76,17.54 19.18,16.21 18.32,15.1L16.95,16.47L15.54,15.06L16.91,13.68C15.8,12.82 14.46,12.24 13,12.06V14H11V12.06C9.54,12.24 8.2,12.82 7.09,13.68L8.46,15.06M12,18C13.1,18 14,18.9 14,20C14,21.1 13.1,22 12,22C11.68,22 11.38,21.93 11.12,21.79L7.27,20L11.12,18.21C11.38,18.07 11.68,18 12,18Z' })
  );
};