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
    _react2.default.createElement('path', { d: 'M5,4V11.26C3.2,11.9 2,13.6 2,15.5C2,18 4,20 6.5,20C8.79,20 10.71,18.28 10.97,16H15.17C15.06,16.32 15,16.66 15,17C15,18.66 16.34,20 18,20C19.66,20 21,18.66 21,17C21,16.66 20.94,16.32 20.82,16H22V13C22,11.89 21.11,11 20,11H15.04L13.65,4H5M7,6H12L13,11V14H10.74C10.16,12.38 8.71,11.23 7,11.03V6M6.5,13.25C7.74,13.25 8.75,14.26 8.75,15.5C8.75,16.74 7.74,17.75 6.5,17.75C5.26,17.75 4.25,16.74 4.25,15.5C4.25,14.26 5.26,13.25 6.5,13.25M18,15.5C18.83,15.5 19.5,16.17 19.5,17C19.5,17.83 18.83,18.5 18,18.5C17.17,18.5 16.5,17.83 16.5,17C16.5,16.17 17.17,15.5 18,15.5Z' })
  );
};