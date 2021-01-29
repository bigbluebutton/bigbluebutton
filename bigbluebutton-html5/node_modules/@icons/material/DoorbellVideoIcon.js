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
    _react2.default.createElement('path', { d: 'M7.97,2C6.86,2 6,2.88 6,4V19.92C6,21.03 6.86,21.91 7.97,21.91H15.94C17.04,21.91 17.93,21.03 17.93,19.92V4C17.93,2.88 17.04,2 15.94,2H7.97M11.95,5.5C12.78,5.5 13.45,6.15 13.45,6.97C13.45,7.8 12.78,8.47 11.95,8.47C11.13,8.47 10.46,7.8 10.46,6.97C10.46,6.15 11.13,5.5 11.95,5.5M7.97,9.96H15.94V19.92H7.97V9.96M12,13C10.9,13 10,13.87 10,14.97C10,16.07 10.9,16.97 12,16.97C13.1,16.97 14,16.07 14,14.97C14,13.87 13.1,13 12,13Z' })
  );
};