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
    _react2.default.createElement('path', { d: 'M16.8,2.5C16.8,1.56 17.56,0.8 18.5,0.8C19.44,0.8 20.2,1.56 20.2,2.5V3H16.8V2.5M16,9H21C21.55,9 22,8.55 22,8V4C22,3.45 21.55,3 21,3V2.5C21,1.12 19.88,0 18.5,0C17.12,0 16,1.12 16,2.5V3C15.45,3 15,3.45 15,4V8C15,8.55 15.45,9 16,9M8.47,20.5C5.2,18.94 2.86,15.76 2.5,12H1C1.5,18.16 6.66,23 12.95,23L13.61,22.97L9.8,19.15L8.47,20.5M23.25,12.77L20.68,10.2L19.27,11.61L21.5,13.83L15.83,19.5L4.5,8.17L10.17,2.5L12.27,4.61L13.68,3.2L11.23,0.75C10.64,0.16 9.69,0.16 9.11,0.75L2.75,7.11C2.16,7.7 2.16,8.65 2.75,9.23L14.77,21.25C15.36,21.84 16.31,21.84 16.89,21.25L23.25,14.89C23.84,14.3 23.84,13.35 23.25,12.77Z' })
  );
};