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
    _react2.default.createElement('path', { d: 'M11,23C9.9,23 9,22.1 9,21V19H15V21C15,22.1 14.1,23 13,23H11M12,1C12.71,1 13.39,1.09 14.05,1.26C15.22,2.83 16,5.71 16,9C16,11.28 15.62,13.37 15,16C15,17.1 14.1,18 13,18H11C9.9,18 9,17.1 9,16C8.38,13.37 8,11.28 8,9C8,5.71 8.78,2.83 9.95,1.26C10.61,1.09 11.29,1 12,1M20,8C20,11.18 18.15,15.92 15.46,17.21C16.41,15.39 17,11.83 17,9C17,6.17 16.41,3.61 15.46,1.79C18.15,3.08 20,4.82 20,8M4,8C4,4.82 5.85,3.08 8.54,1.79C7.59,3.61 7,6.17 7,9C7,11.83 7.59,15.39 8.54,17.21C5.85,15.92 4,11.18 4,8Z' })
  );
};