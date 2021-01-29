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
    _react2.default.createElement('path', { d: 'M7.75,13C7.74,12.65 7.9,12.31 8.17,12.08C8.92,12.24 9.62,12.55 10.25,13C10.25,13.68 9.69,14.24 9,14.24C8.31,14.24 7.76,13.69 7.75,13M13.75,13C14.38,12.56 15.08,12.25 15.83,12.09C16.1,12.32 16.26,12.66 16.25,13C16.25,13.7 15.69,14.26 15,14.26C14.31,14.26 13.75,13.7 13.75,13V13M12,9C9.23,8.96 6.5,9.65 4.07,11L4,12C4,13.23 4.29,14.44 4.84,15.54C7.21,15.18 9.6,15 12,15C14.4,15 16.79,15.18 19.16,15.54C19.71,14.44 20,13.23 20,12L19.93,11C17.5,9.65 14.77,8.96 12,9M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2Z' })
  );
};