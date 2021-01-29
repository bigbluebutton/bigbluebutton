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
    _react2.default.createElement('path', { d: 'M5,13L6.5,8.5H17.5L19,13M17.5,18C16.67,18 16,17.33 16,16.5C16,15.67 16.67,15 17.5,15C18.33,15 19,15.67 19,16.5C19,17.33 18.33,18 17.5,18M6.5,18C5.67,18 5,17.33 5,16.5C5,15.67 5.67,15 6.5,15C7.33,15 8,15.67 8,16.5C8,17.33 7.33,18 6.5,18M18.92,8C18.72,7.42 18.16,7 17.5,7H6.5C5.84,7 5.28,7.42 5.08,8L3,14V22C3,22.55 3.45,23 4,23H5C5.55,23 6,22.55 6,22V21H18V22C18,22.55 18.45,23 19,23H20C20.55,23 21,22.55 21,22V14M7,5C7.83,5 8.5,4.33 8.5,3.5C8.5,2.5 7,0.8 7,0.8C7,0.8 5.5,2.5 5.5,3.5C5.5,4.33 6.17,5 7,5M12,5C12.83,5 13.5,4.33 13.5,3.5C13.5,2.5 12,0.8 12,0.8C12,0.8 10.5,2.5 10.5,3.5C10.5,4.33 11.17,5 12,5M17,5C17.83,5 18.5,4.33 18.5,3.5C18.5,2.5 17,0.8 17,0.8C17,0.8 15.5,2.5 15.5,3.5C15.5,4.33 16.17,5 17,5Z' })
  );
};