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
    _react2.default.createElement('path', { d: 'M14.76,20.83L17.6,18L14.76,15.17L16.17,13.76L19,16.57L21.83,13.76L23.24,15.17L20.43,18L23.24,20.83L21.83,22.24L19,19.4L16.17,22.24L14.76,20.83M12,12V19.88C12.04,20.18 11.94,20.5 11.71,20.71C11.32,21.1 10.69,21.1 10.3,20.71L8.29,18.7C8.06,18.47 7.96,18.16 8,17.87V12H7.97L2.21,4.62C1.87,4.19 1.95,3.56 2.38,3.22C2.57,3.08 2.78,3 3,3V3H17V3C17.22,3 17.43,3.08 17.62,3.22C18.05,3.56 18.13,4.19 17.79,4.62L12.03,12H12Z' })
  );
};