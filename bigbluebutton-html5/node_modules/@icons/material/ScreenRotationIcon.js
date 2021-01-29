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
    _react2.default.createElement('path', { d: 'M7.5,21.5C4.25,19.94 1.91,16.76 1.55,13H0.05C0.56,19.16 5.71,24 12,24L12.66,23.97L8.85,20.16M14.83,21.19L2.81,9.17L9.17,2.81L21.19,14.83M10.23,1.75C9.64,1.16 8.69,1.16 8.11,1.75L1.75,8.11C1.16,8.7 1.16,9.65 1.75,10.23L13.77,22.25C14.36,22.84 15.31,22.84 15.89,22.25L22.25,15.89C22.84,15.3 22.84,14.35 22.25,13.77L10.23,1.75M16.5,2.5C19.75,4.07 22.09,7.24 22.45,11H23.95C23.44,4.84 18.29,0 12,0L11.34,0.03L15.15,3.84L16.5,2.5Z' })
  );
};