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
    _react2.default.createElement('path', { d: 'M18,18.5C18.83,18.5 19.5,17.83 19.5,17C19.5,16.17 18.83,15.5 18,15.5C17.17,15.5 16.5,16.17 16.5,17C16.5,17.83 17.17,18.5 18,18.5M19.5,9.5H17V12H21.46L19.5,9.5M6,18.5C6.83,18.5 7.5,17.83 7.5,17C7.5,16.17 6.83,15.5 6,15.5C5.17,15.5 4.5,16.17 4.5,17C4.5,17.83 5.17,18.5 6,18.5M20,8L23,12V17H21C21,18.66 19.66,20 18,20C16.34,20 15,18.66 15,17H9C9,18.66 7.66,20 6,20C4.34,20 3,18.66 3,17H1V6C1,4.89 1.89,4 3,4H17V8H20M8,6V9H5V11H8V14H10V11H13V9H10V6H8Z' })
  );
};