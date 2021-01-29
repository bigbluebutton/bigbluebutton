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
    _react2.default.createElement('path', { d: 'M12,8.25C13.31,8.25 14.38,9.2 14.38,10.38C14.38,11.07 14,11.68 13.44,12.07C14.14,12.46 14.6,13.13 14.6,13.9C14.6,15.12 13.44,16.1 12,16.1C10.56,16.1 9.4,15.12 9.4,13.9C9.4,13.13 9.86,12.46 10.56,12.07C10,11.68 9.63,11.07 9.63,10.38C9.63,9.2 10.69,8.25 12,8.25M12,12.65C11.39,12.65 10.9,13.14 10.9,13.75C10.9,14.36 11.39,14.85 12,14.85C12.61,14.85 13.1,14.36 13.1,13.75C13.1,13.14 12.61,12.65 12,12.65M12,9.5C11.5,9.5 11.1,9.95 11.1,10.5C11.1,11.05 11.5,11.5 12,11.5C12.5,11.5 12.9,11.05 12.9,10.5C12.9,9.95 12.5,9.5 12,9.5M21.54,10.8C22.14,11.5 22.14,12.5 21.54,13.2L13.24,21.5C12.54,22.2 11.54,22.2 10.84,21.5L2.54,13.2C1.84,12.5 1.84,11.5 2.54,10.8L10.84,2.5C11.54,1.8 12.54,1.8 13.24,2.5L21.54,10.8M20.34,12L12.04,3.7L3.74,12L12.04,20.3L20.34,12Z' })
  );
};