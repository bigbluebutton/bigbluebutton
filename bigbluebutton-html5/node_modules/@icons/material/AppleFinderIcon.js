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
    _react2.default.createElement('path', { d: 'M4,4H11.89C12.46,2.91 13.13,1.88 13.93,1L15.04,2.11C14.61,2.7 14.23,3.34 13.89,4H20C21.1,4 22,4.9 22,6V19C22,20.1 21.1,21 20,21H14.93L15.26,22.23L13.43,22.95L12.93,21H4C2.9,21 2,20.1 2,19V6C2,4.9 2.9,4 4,4M4,6V19H12.54C12.5,18.67 12.44,18.34 12.4,18C12.27,18 12.13,18 12,18C9.25,18 6.78,17.5 5.13,16.76L6.04,15.12C7,15.64 9.17,16 12,16C12.08,16 12.16,16 12.24,16C12.21,15.33 12.22,14.66 12.27,14H9C9,14 9.4,9.97 11,6H4M20,19V6H13C12.1,8.22 11.58,10.46 11.3,12H14.17C14,13.28 13.97,14.62 14.06,15.93C15.87,15.8 17.25,15.5 17.96,15.12L18.87,16.76C17.69,17.3 16.1,17.7 14.29,17.89C14.35,18.27 14.41,18.64 14.5,19H20M6,8H8V11H6V8M16,8H18V11H16V8Z' })
  );
};