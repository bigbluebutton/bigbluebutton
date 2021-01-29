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
    _react2.default.createElement('path', { d: 'M4,1H20C20.55,1 21,1.45 21,2V6C21,6.55 20.55,7 20,7H8.82L6.82,5H7V3H5V3.18L3.21,1.39C3.39,1.15 3.68,1 4,1M22,22.72L20.73,24L19.73,23H4C3.45,23 3,22.55 3,22V18C3,17.45 3.45,17 4,17H13.73L11.73,15H4C3.45,15 3,14.55 3,14V10C3,9.45 3.45,9 4,9H5.73L3.68,6.95C3.38,6.85 3.15,6.62 3.05,6.32L1,4.27L2.28,3L22,22.72M20,9C20.55,9 21,9.45 21,10V14C21,14.55 20.55,15 20,15H16.82L10.82,9H20M20,17C20.55,17 21,17.45 21,18V19.18L18.82,17H20M9,5H10V3H9V5M9,13H9.73L9,12.27V13M9,21H10V19H9V21M5,11V13H7V11H5M5,19V21H7V19H5Z' })
  );
};