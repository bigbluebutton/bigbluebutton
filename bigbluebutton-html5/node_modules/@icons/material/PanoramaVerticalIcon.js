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
    _react2.default.createElement('path', { d: 'M6.54,20C7.31,17.4 7.7,14.72 7.7,12C7.7,9.28 7.31,6.6 6.54,4H17.45C16.68,6.6 16.29,9.28 16.29,12C16.29,14.72 16.68,17.4 17.45,20M19.94,21.12C18.84,18.18 18.3,15.09 18.3,12C18.3,8.91 18.85,5.82 19.94,2.88C20,2.77 20,2.66 20,2.57C20,2.23 19.77,2 19.37,2H4.63C4.23,2 4,2.23 4,2.57C4,2.67 4,2.77 4.06,2.88C5.16,5.82 5.71,8.91 5.71,12C5.71,15.09 5.16,18.18 4.07,21.12C4,21.23 4,21.34 4,21.43C4,21.76 4.23,22 4.63,22H19.38C19.77,22 20,21.76 20,21.43C20,21.33 20,21.23 19.94,21.12Z' })
  );
};