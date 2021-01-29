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
    _react2.default.createElement('path', { d: 'M5,2C5,1.45 4.55,1 4,1C3.45,1 3,1.45 3,2V6H1V12H7V6H5V2M9,16C9,17.3 9.84,18.4 11,18.82V23H13V18.82C14.16,18.41 15,17.31 15,16V14H9V16M1,16C1,17.3 1.84,18.4 3,18.82V23H5V18.82C6.16,18.4 7,17.3 7,16V14H1V16M21,6V2C21,1.45 20.55,1 20,1C19.45,1 19,1.45 19,2V6H17V12H23V6H21M13,2C13,1.45 12.55,1 12,1C11.45,1 11,1.45 11,2V6H9V12H15V6H13V2M17,16C17,17.3 17.84,18.4 19,18.82V23H21V18.82C22.16,18.41 23,17.31 23,16V14H17V16Z' })
  );
};