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
    _react2.default.createElement('path', { d: 'M2,5.27L3.28,4L21,21.72L19.73,23L17.73,21H4C2.89,21 2,20.11 2,19V9C2,8 2.76,7.14 3.75,7L2,5.27M8.16,3L12,6.84L15.84,3L17.25,4.41L14.66,7H20C21.11,7 22,7.89 22,9V19C22,19.34 21.92,19.66 21.77,19.94L17,15.18V9H10.82L8.82,7H9.34L6.75,4.41L8.16,3M4,9V19H15.73L5.73,9H4M19.5,9C18.95,9 18.5,9.45 18.5,10C18.5,10.55 18.95,11 19.5,11C20.05,11 20.5,10.55 20.5,10C20.5,9.45 20.05,9 19.5,9M19.5,12C18.95,12 18.5,12.45 18.5,13C18.5,13.55 18.95,14 19.5,14C20.05,14 20.5,13.55 20.5,13C20.5,12.45 20.05,12 19.5,12Z' })
  );
};