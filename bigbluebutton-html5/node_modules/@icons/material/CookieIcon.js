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
    _react2.default.createElement('path', { d: 'M12,3C7.03,3 3,7.03 3,12C3,16.97 7.03,21 12,21C16.97,21 21,16.97 21,12C21,11.5 20.96,11 20.87,10.5C20.6,10 20,10 20,10H18V9C18,8 17,8 17,8H15V7C15,6 14,6 14,6H13V4C13,3 12,3 12,3M9.5,6C10.33,6 11,6.67 11,7.5C11,8.33 10.33,9 9.5,9C8.67,9 8,8.33 8,7.5C8,6.67 8.67,6 9.5,6M6.5,10C7.33,10 8,10.67 8,11.5C8,12.33 7.33,13 6.5,13C5.67,13 5,12.33 5,11.5C5,10.67 5.67,10 6.5,10M11.5,11C12.33,11 13,11.67 13,12.5C13,13.33 12.33,14 11.5,14C10.67,14 10,13.33 10,12.5C10,11.67 10.67,11 11.5,11M16.5,13C17.33,13 18,13.67 18,14.5C18,15.33 17.33,16 16.5,16H16.5C15.67,16 15,15.33 15,14.5H15C15,13.67 15.67,13 16.5,13M11,16C11.83,16 12.5,16.67 12.5,17.5C12.5,18.33 11.83,19 11,19C10.17,19 9.5,18.33 9.5,17.5C9.5,16.67 10.17,16 11,16Z' })
  );
};