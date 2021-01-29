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
    _react2.default.createElement('path', { d: 'M14,13H9.95C9.4,13 8.95,13.45 8.95,14C8.95,14.55 9.4,15 9.95,15H14C14.55,15 15,14.55 15,14C15,13.45 14.55,13 14,13M9.95,10H12.55C13.1,10 13.55,9.55 13.55,9C13.55,8.45 13.1,8 12.55,8H9.95C9.4,8 8.95,8.45 8.95,9C8.95,9.55 9.4,10 9.95,10M16,9V10C16,10.55 16.45,11 17,11C17.55,11 18,11.45 18,12V15C18,16.66 16.66,18 15,18H9C7.34,18 6,16.66 6,15V8C6,6.34 7.34,5 9,5H13C14.66,5 16,6.34 16,8M20,2H4C2.89,2 2,2.89 2,4V20C2,21.1 2.9,22 4,22H20C21.1,22 22,21.1 22,20V4C22,2.89 21.1,2 20,2Z' })
  );
};