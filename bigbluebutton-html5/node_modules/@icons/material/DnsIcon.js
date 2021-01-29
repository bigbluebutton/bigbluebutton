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
    _react2.default.createElement('path', { d: 'M7,9C5.9,9 5,8.1 5,7C5,5.9 5.9,5 7,5C8.1,5 9,5.9 9,7C9,8.1 8.1,9 7,9M20,3H4C3.45,3 3,3.45 3,4V10C3,10.55 3.45,11 4,11H20C20.55,11 21,10.55 21,10V4C21,3.45 20.55,3 20,3M7,19C5.9,19 5,18.1 5,17C5,15.9 5.9,15 7,15C8.1,15 9,15.9 9,17C9,18.1 8.1,19 7,19M20,13H4C3.45,13 3,13.45 3,14V20C3,20.55 3.45,21 4,21H20C20.55,21 21,20.55 21,20V14C21,13.45 20.55,13 20,13Z' })
  );
};