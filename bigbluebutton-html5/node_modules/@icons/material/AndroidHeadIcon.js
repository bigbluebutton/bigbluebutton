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
    _react2.default.createElement('path', { d: 'M8,11.5C7.31,11.5 6.75,12.06 6.75,12.75C6.75,13.44 7.31,14 8,14C8.69,14 9.25,13.44 9.25,12.75C9.25,12.06 8.69,11.5 8,11.5M16,11.5C15.31,11.5 14.75,12.06 14.75,12.75C14.75,13.44 15.31,14 16,14C16.69,14 17.25,13.44 17.25,12.75C17.25,12.06 16.69,11.5 16,11.5M12,7C13.5,7 14.9,7.33 16.18,7.91L18.34,5.75C18.73,5.36 19.36,5.36 19.75,5.75C20.14,6.14 20.14,6.77 19.75,7.16L17.95,8.96C20.41,10.79 22,13.71 22,17H2C2,13.71 3.59,10.79 6.05,8.96L4.25,7.16C3.86,6.77 3.86,6.14 4.25,5.75C4.64,5.36 5.27,5.36 5.66,5.75L7.82,7.91C9.1,7.33 10.5,7 12,7Z' })
  );
};