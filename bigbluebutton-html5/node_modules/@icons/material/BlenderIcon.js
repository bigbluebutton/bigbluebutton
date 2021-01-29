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
    _react2.default.createElement('path', { d: 'M8,3C8,3.34 8.17,3.69 8.5,3.88L12,6H2.5C1.67,6 1,6.67 1,7.5C1,8.33 1.67,9 2.5,9H8.41L2,13C1.16,13.5 1,14.22 1,15C1,16 1.77,17 3,17C3.69,17 4.39,16.5 5,16L7,14.38C7.2,18.62 10.71,22 15,22C19.42,22 23,18.42 23,14C23,11.08 21.43,8.5 19.09,7.13C19.06,7.11 19.03,7.08 19,7.06C19,7.06 18.92,7 18.86,6.97C15.76,4.88 13.03,3.72 9.55,2.13C9.34,2.04 9.16,2 9,2C8.4,2 8,2.46 8,3M15,9C17.76,9 20,11.24 20,14C20,16.76 17.76,19 15,19C12.24,19 10,16.76 10,14C10,11.24 12.24,9 15,9M15,10.5C13.07,10.5 11.5,12.07 11.5,14C11.5,15.93 13.07,17.5 15,17.5C16.93,17.5 18.5,15.93 18.5,14C18.5,12.07 16.93,10.5 15,10.5Z' })
  );
};