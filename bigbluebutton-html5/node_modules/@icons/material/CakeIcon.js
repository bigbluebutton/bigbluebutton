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
    _react2.default.createElement('path', { d: 'M11.5,0.5C12,0.75 13,2.4 13,3.5C13,4.6 12.33,5 11.5,5C10.67,5 10,4.85 10,3.75C10,2.65 11,2 11.5,0.5M18.5,9C21,9 23,11 23,13.5C23,15.06 22.21,16.43 21,17.24V23H12L3,23V17.24C1.79,16.43 1,15.06 1,13.5C1,11 3,9 5.5,9H10V6H13V9H18.5M12,16C13.38,16 14.5,14.88 14.5,13.5H16C16,14.88 17.12,16 18.5,16C19.88,16 21,14.88 21,13.5C21,12.12 19.88,11 18.5,11H5.5C4.12,11 3,12.12 3,13.5C3,14.88 4.12,16 5.5,16C6.88,16 8,14.88 8,13.5H9.5C9.5,14.88 10.62,16 12,16Z' })
  );
};