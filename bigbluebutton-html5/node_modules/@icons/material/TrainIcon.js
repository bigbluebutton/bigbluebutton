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
    _react2.default.createElement('path', { d: 'M12,2C8,2 4,2.5 4,6V15.5C4,17.43 5.57,19 7.5,19L6,20.5V21H8.23L10.23,19H14L16,21H18V20.5L16.5,19C18.43,19 20,17.43 20,15.5V6C20,2.5 16.42,2 12,2M7.5,17C6.67,17 6,16.33 6,15.5C6,14.67 6.67,14 7.5,14C8.33,14 9,14.67 9,15.5C9,16.33 8.33,17 7.5,17M11,10H6V6H11V10M13,10V6H18V10H13M16.5,17C15.67,17 15,16.33 15,15.5C15,14.67 15.67,14 16.5,14C17.33,14 18,14.67 18,15.5C18,16.33 17.33,17 16.5,17Z' })
  );
};