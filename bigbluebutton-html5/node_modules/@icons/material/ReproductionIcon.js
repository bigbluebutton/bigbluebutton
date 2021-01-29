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
    _react2.default.createElement('path', { d: 'M12.72,13.15L13.62,12.26C13.6,11 14.31,9.44 15.62,8.14C17.57,6.18 20.11,5.55 21.28,6.72C22.45,7.89 21.82,10.43 19.86,12.38C18.56,13.69 17,14.4 15.74,14.38L14.85,15.28C14.5,15.61 14,15.66 13.6,15.41C12.76,15.71 12,16.08 11.56,16.8C11.03,17.68 11.03,19.1 10.47,19.95C9.91,20.81 8.79,21.1 7.61,21.1C6.43,21.1 5,21 3.95,19.5L6.43,19.92C7,20 8.5,19.39 9.05,18.54C9.61,17.68 9.61,16.27 10.14,15.38C10.61,14.6 11.5,14.23 12.43,13.91C12.42,13.64 12.5,13.36 12.72,13.15M7,2C9.76,2 12,4.24 12,7C12,9.76 9.76,12 7,12C4.24,12 2,9.76 2,7C2,4.24 4.24,2 7,2M7,4C5.34,4 4,5.34 4,7C4,8.66 5.34,10 7,10C8.66,10 10,8.66 10,7C10,5.34 8.66,4 7,4Z' })
  );
};