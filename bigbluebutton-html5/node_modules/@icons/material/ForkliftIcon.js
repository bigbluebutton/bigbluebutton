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
    _react2.default.createElement('path', { d: 'M6,4V11H4C2.89,11 2,11.89 2,13V17C2,18.66 3.34,20 5,20C6.66,20 8,18.66 8,17H10C10,18.66 11.34,20 13,20C14.66,20 16,18.66 16,17V13L12,4H6M17,5V19H22V17.5H18.5V5H17M7.5,5.5H11.2L14.5,13H7.5V5.5M5,15.5C5.83,15.5 6.5,16.17 6.5,17C6.5,17.83 5.83,18.5 5,18.5C4.17,18.5 3.5,17.83 3.5,17C3.5,16.17 4.17,15.5 5,15.5M13,15.5C13.83,15.5 14.5,16.17 14.5,17C14.5,17.83 13.83,18.5 13,18.5C12.17,18.5 11.5,17.83 11.5,17C11.5,16.17 12.17,15.5 13,15.5Z' })
  );
};