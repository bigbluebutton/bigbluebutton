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
    _react2.default.createElement('path', { d: 'M3,13.5L2.25,12H7.5L6.9,10.5H2L1.25,9H9.05L8.45,7.5H1.11L0.25,6H4C4,4.9 4.9,4 6,4H18V8H21L24,12V17H22C22,18.66 20.66,20 19,20C17.34,20 16,18.66 16,17H12C12,18.66 10.66,20 9,20C7.34,20 6,18.66 6,17H4V13.5H3M19,18.5C19.83,18.5 20.5,17.83 20.5,17C20.5,16.17 19.83,15.5 19,15.5C18.17,15.5 17.5,16.17 17.5,17C17.5,17.83 18.17,18.5 19,18.5M20.5,9.5H18V12H22.46L20.5,9.5M9,18.5C9.83,18.5 10.5,17.83 10.5,17C10.5,16.17 9.83,15.5 9,15.5C8.17,15.5 7.5,16.17 7.5,17C7.5,17.83 8.17,18.5 9,18.5Z' })
  );
};