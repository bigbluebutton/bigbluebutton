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
    _react2.default.createElement('path', { d: 'M18,19C16.89,19 16,18.1 16,17C16,15.89 16.89,15 18,15C19.1,15 20,15.9 20,17C20,18.1 19.1,19 18,19M18,13C15.79,13 14,14.79 14,17C14,19.21 15.79,21 18,21C20.21,21 22,19.21 22,17C22,14.79 20.21,13 18,13M12,11.1C10.95,11.1 10.1,11.95 10.1,13C10.1,14.05 10.95,14.9 12,14.9C13.05,14.9 13.9,14.05 13.9,13C13.9,11.95 13.05,11.1 12,11.1M6,19C4.89,19 4,18.1 4,17C4,15.89 4.89,15 6,15C7.1,15 8,15.9 8,17C8,18.1 7.1,19 6,19M6,13C3.79,13 2,14.79 2,17C2,19.21 3.79,21 6,21C8.21,21 10,19.21 10,17C10,14.79 8.21,13 6,13M12,4C13.1,4 14,4.9 14,6C14,7.1 13.1,8 12,8C10.89,8 10,7.1 10,6C10,4.89 10.89,4 12,4M12,10C14.21,10 16,8.21 16,6C16,3.79 14.21,2 12,2C9.79,2 8,3.79 8,6C8,8.21 9.79,10 12,10Z' })
  );
};