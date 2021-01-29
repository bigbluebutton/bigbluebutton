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
    _react2.default.createElement('path', { d: 'M19.59,3H22V5H20.41L15.12,10.29L13.71,8.9L19.59,3M12,9C12.26,9 12.5,9.1 12.71,9.3L14.71,11.3C14.89,11.5 15,11.73 15,12L14.9,12.4L10.9,20.4C10.71,20.75 10.36,20.93 10,20.93C9.65,20.93 9.29,20.75 9.11,20.4L7.25,16.7L3.55,14.9C3.18,14.7 3,14.35 3,14C3,13.65 3.18,13.3 3.55,13.1L11.55,9.1C11.69,9 11.84,9 12,9M9.35,11.82L8.65,12.5L11.5,15.35L12.18,14.65L9.35,11.82M7.94,13.23L7.23,13.94L10.06,16.77L10.77,16.06L7.94,13.23Z' })
  );
};