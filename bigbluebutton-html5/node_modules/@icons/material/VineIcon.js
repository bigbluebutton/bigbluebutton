'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VineIcon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_SIZE = 24;

var VineIcon = function VineIcon(_ref) {
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
    _react2.default.createElement('path', { d: 'M19.89,11.95C19.43,12.06 19,12.1 18.57,12.1C16.3,12.1 14.55,10.5 14.55,7.76C14.55,6.41 15.08,5.7 15.82,5.7C16.5,5.7 17,6.33 17,7.61C17,8.34 16.79,9.14 16.65,9.61C16.65,9.61 17.35,10.83 19.26,10.46C19.67,9.56 19.89,8.39 19.89,7.36C19.89,4.6 18.5,3 15.91,3C13.26,3 11.71,5.04 11.71,7.72C11.71,10.38 12.95,12.67 15,13.71C14.14,15.43 13.04,16.95 11.9,18.1C9.82,15.59 7.94,12.24 7.17,5.7H4.11C5.53,16.59 9.74,20.05 10.86,20.72C11.5,21.1 12.03,21.08 12.61,20.75C13.5,20.24 16.23,17.5 17.74,14.34C18.37,14.33 19.13,14.26 19.89,14.09V11.95Z' })
  );
};
exports.VineIcon = VineIcon;