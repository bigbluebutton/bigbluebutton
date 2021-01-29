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
    _react2.default.createElement('path', { d: 'M13,18H14C14.55,18 15,18.45 15,19H15.73L13,16.27V18M22,19V20.18L20.82,19H22M21,21.72L19.73,23L17.73,21H15C15,21.55 14.55,22 14,22H10C9.45,22 9,21.55 9,21H2V19H9C9,18.45 9.45,18 10,18H11V16H4C3.45,16 3,15.55 3,15V11C3,10.45 3.45,10 4,10H6.73L4.73,8H4C3.45,8 3,7.55 3,7V6.27L1,4.27L2.28,3L21,21.72M4,2H20C20.55,2 21,2.45 21,3V7C21,7.55 20.55,8 20,8H9.82L7,5.18V4H5.82L3.84,2C3.89,2 3.94,2 4,2M20,10C20.55,10 21,10.45 21,11V15C21,15.55 20.55,16 20,16H17.82L11.82,10H20M9,6H10V4H9V6M9,14H10V13.27L9,12.27V14M5,12V14H7V12H5Z' })
  );
};