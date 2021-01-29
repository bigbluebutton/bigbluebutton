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
    _react2.default.createElement('path', { d: 'M23,12C23,18.08 18.08,23 12,23C5.92,23 1,18.08 1,12C1,5.92 5.92,1 12,1C18.08,1 23,5.92 23,12M13,4.06C15.13,4.33 17.07,5.45 18.37,7.16L20.11,6.16C18.45,3.82 15.86,2.3 13,2V4.06M3.89,6.16L5.63,7.16C6.93,5.45 8.87,4.33 11,4.06V2C8.14,2.3 5.55,3.82 3.89,6.16M2.89,16.1L4.62,15.1C3.79,13.12 3.79,10.88 4.62,8.9L2.89,7.9C1.7,10.5 1.7,13.5 2.89,16.1M11,19.94C8.87,19.67 6.93,18.55 5.63,16.84L3.89,17.84C5.55,20.18 8.14,21.7 11,22V19.94M20.11,17.84L18.37,16.84C17.07,18.55 15.13,19.67 13,19.94V21.94C15.85,21.65 18.44,20.16 20.11,17.84M21.11,16.1C22.3,13.5 22.3,10.5 21.11,7.9L19.38,8.9C20.21,10.88 20.21,13.12 19.38,15.1L21.11,16.1M15,12L12,7L9,12L12,17L15,12Z' })
  );
};