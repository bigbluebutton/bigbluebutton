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
    _react2.default.createElement('path', { d: 'M22.5,10H15.75C15.13,10 14.6,10.38 14.37,10.91L12.11,16.2C12.04,16.37 12,16.56 12,16.75V18C12,18.55 12.45,19 13,19H18.18L17.5,22.18V22.42C17.5,22.73 17.63,23 17.83,23.22L18.62,24L23.56,19.06C23.83,18.79 24,18.41 24,18V11.5C24,10.67 23.33,10 22.5,10M12,6C12,5.45 11.55,5 11,5H5.82L6.5,1.82V1.59C6.5,1.28 6.37,1 6.17,0.79L5.38,0L0.44,4.94C0.17,5.21 0,5.59 0,6V12.5C0,13.33 0.67,14 1.5,14H8.25C8.87,14 9.4,13.62 9.63,13.09L11.89,7.8C11.96,7.63 12,7.44 12,7.25V6Z' })
  );
};