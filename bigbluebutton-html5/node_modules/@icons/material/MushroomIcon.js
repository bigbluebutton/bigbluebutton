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
    _react2.default.createElement('path', { d: 'M12,2C17.52,2 22,6.48 22,12C22,13.1 21.1,14 20,14H4C2.9,14 2,13.1 2,12C2,6.48 6.48,2 12,2M12,8C13.1,8 14,7.1 14,6C14,4.9 13.1,4 12,4C10.9,4 10,4.9 10,6C10,7.1 10.9,8 12,8M17,12C18.1,12 19,11.1 19,10C19,8.9 18.1,8 17,8C15.9,8 15,8.9 15,10C15,11.1 15.9,12 17,12M7,12C8.1,12 9,11.1 9,10C9,8.9 8.1,8 7,8C5.9,8 5,8.9 5,10C5,11.1 5.9,12 7,12M15,15L16.27,19.45L16.35,20C16.35,21.1 15.45,22 14.35,22H9.65C8.55,22 7.65,21.1 7.65,20L7.73,19.45L9,15H15Z' })
  );
};