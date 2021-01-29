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
    _react2.default.createElement('path', { d: 'M16.91,18.12C14.09,18.12 18.43,2.13 18.43,2.13H15.53C15.53,2.13 14.34,5.89 13.55,10.07H11.05C11.11,9.21 11.15,8.34 11.13,7.5C11,0.59 7,1.87 5.18,3.45C3.47,4.95 2.03,7.8 2,10C2.27,10 3.35,10 3.35,10C3.35,10 4.25,5.88 7.07,5.88C9.89,5.88 5.54,21.87 5.54,21.87H8.45C8.45,21.87 9.95,17.59 10.7,12.81L13.09,12.8C12.95,14.04 12.91,15.4 12.93,16.67C13.04,23.56 17.06,22.08 18.86,20.5C20.67,18.92 22,15.58 22,14H20.61C20.62,14.12 19.73,18.12 16.91,18.12V18.12Z' })
  );
};