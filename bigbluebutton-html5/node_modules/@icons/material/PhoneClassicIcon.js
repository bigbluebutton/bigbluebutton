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
    _react2.default.createElement('path', { d: 'M12,3C7.46,3 3.34,4.78 0.29,7.67C0.11,7.85 0,8.1 0,8.38C0,8.66 0.11,8.91 0.29,9.09L2.77,11.57C2.95,11.75 3.2,11.86 3.5,11.86C3.75,11.86 4,11.75 4.18,11.58C4.97,10.84 5.87,10.22 6.84,9.73C7.17,9.57 7.4,9.23 7.4,8.83V5.73C8.85,5.25 10.39,5 12,5C13.59,5 15.14,5.25 16.59,5.72V8.82C16.59,9.21 16.82,9.56 17.15,9.72C18.13,10.21 19,10.84 19.82,11.57C20,11.75 20.25,11.85 20.5,11.85C20.8,11.85 21.05,11.74 21.23,11.56L23.71,9.08C23.89,8.9 24,8.65 24,8.37C24,8.09 23.88,7.85 23.7,7.67C20.65,4.78 16.53,3 12,3M9,7V10C9,10 3,15 3,18V22H21V18C21,15 15,10 15,10V7H13V9H11V7H9M12,12C14.21,12 16,13.79 16,16C16,18.21 14.21,20 12,20C9.79,20 8,18.21 8,16C8,13.79 9.79,12 12,12M12,13.5C10.62,13.5 9.5,14.62 9.5,16C9.5,17.38 10.62,18.5 12,18.5C13.38,18.5 14.5,17.38 14.5,16C14.5,14.62 13.38,13.5 12,13.5Z' })
  );
};