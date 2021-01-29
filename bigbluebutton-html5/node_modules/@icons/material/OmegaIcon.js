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
    _react2.default.createElement('path', { d: 'M19.15,19H13.39V16.87C15.5,15.25 16.59,13.24 16.59,10.84C16.59,9.34 16.16,8.16 15.32,7.29C14.47,6.42 13.37,6 12.03,6C10.68,6 9.57,6.42 8.71,7.3C7.84,8.17 7.41,9.37 7.41,10.88C7.41,13.26 8.5,15.26 10.61,16.87V19H4.85V16.87H8.41C6.04,15.32 4.85,13.23 4.85,10.6C4.85,8.5 5.5,6.86 6.81,5.66C8.12,4.45 9.84,3.85 11.97,3.85C14.15,3.85 15.89,4.45 17.19,5.64C18.5,6.83 19.15,8.5 19.15,10.58C19.15,13.21 17.95,15.31 15.55,16.87H19.15V19Z' })
  );
};