'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RdioIcon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_SIZE = 24;

var RdioIcon = function RdioIcon(_ref) {
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
    _react2.default.createElement('path', { d: 'M19.29,10.84C19.35,11.22 19.38,11.61 19.38,12C19.38,16.61 15.5,20.35 10.68,20.35C5.87,20.35 2,16.61 2,12C2,7.39 5.87,3.65 10.68,3.65C11.62,3.65 12.53,3.79 13.38,4.06V9.11C13.38,9.11 10.79,7.69 8.47,9.35C6.15,11 6.59,12.76 6.59,12.76C6.59,12.76 6.7,15.5 9.97,15.5C13.62,15.5 14.66,12.19 14.66,12.19V4.58C15.36,4.93 16,5.36 16.65,5.85C18.2,6.82 19.82,7.44 21.67,7.39C21.67,7.39 22,7.31 22,8C22,8.4 21.88,8.83 21.5,9.25C21.5,9.25 20.78,10.33 19.29,10.84Z' })
  );
};
exports.RdioIcon = RdioIcon;