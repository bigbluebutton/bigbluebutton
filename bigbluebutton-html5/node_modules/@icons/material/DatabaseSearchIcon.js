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
    _react2.default.createElement('path', { d: 'M10,1C5.58,1 2,2.79 2,5C2,7.06 5.13,8.74 9.15,8.96C10.45,7.7 12.19,7 14,7C14.8,7 15.59,7.14 16.34,7.41C17.37,6.74 18,5.91 18,5C18,2.79 14.42,1 10,1M2,7V10C2,11.68 4.08,13.11 7,13.71C7.06,12.7 7.32,11.72 7.77,10.82C4.44,10.34 2,8.82 2,7M13.93,8.94C12.75,8.95 11.53,9.4 10.46,10.46C6.21,14.71 11.71,21.5 16.75,18.17L21.29,22.71L22.71,21.29L18.17,16.75C20.66,12.97 17.47,8.93 13.93,8.94M13.9,11C15.47,10.95 17,12.16 17,14C17,15.66 15.66,17 14,17C11.33,17 10,13.77 11.88,11.88C12.47,11.29 13.19,11 13.9,11M2,12V15C2,17.05 5.09,18.72 9.06,18.95C8.17,18.07 7.54,16.95 7.22,15.74C4.18,15.17 2,13.72 2,12Z' })
  );
};