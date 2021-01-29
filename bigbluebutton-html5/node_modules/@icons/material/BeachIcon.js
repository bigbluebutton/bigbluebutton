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
    _react2.default.createElement('path', { d: 'M15,18.54C17.13,18.21 19.5,18 22,18V22H5C5,21.35 8.2,19.86 13,18.9V12.4C12.16,12.65 11.45,13.21 11,13.95C10.39,12.93 9.27,12.25 8,12.25C6.73,12.25 5.61,12.93 5,13.95C5.03,10.37 8.5,7.43 13,7.04V7C13,6.45 13.45,6 14,6C14.55,6 15,6.45 15,7V7.04C19.5,7.43 22.96,10.37 23,13.95C22.39,12.93 21.27,12.25 20,12.25C18.73,12.25 17.61,12.93 17,13.95C16.55,13.21 15.84,12.65 15,12.39V18.54M7,2C7,4.76 4.76,7 2,7V2H7Z' })
  );
};