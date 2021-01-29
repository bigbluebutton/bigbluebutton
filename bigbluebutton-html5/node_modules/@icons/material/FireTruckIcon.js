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
    _react2.default.createElement('path', { d: 'M17.04,2C16.85,2 16.66,2.04 16.5,2.14L5.59,8.5H9.55L17.5,3.86C18,3.58 18.13,2.97 17.85,2.5C17.68,2.2 17.38,2 17.04,2M16,8V10H3C1.9,10 1,10.9 1,12H2V15H1V19H3C3,20.66 4.34,22 6,22C7.66,22 9,20.66 9,19H15C15,20.66 16.34,22 18,22C19.66,22 21,20.66 21,19H23V12.5L19.5,8H16M18,9.5H19L21.5,12.5V13.5H18V9.5M4,12H7V15H4V12M9,12H12V15H9V12M14,12H16V15H14V12M6,17.5C6.83,17.5 7.5,18.17 7.5,19C7.5,19.83 6.83,20.5 6,20.5C5.17,20.5 4.5,19.83 4.5,19C4.5,18.17 5.17,17.5 6,17.5M18,17.5C18.83,17.5 19.5,18.17 19.5,19C19.5,19.83 18.83,20.5 18,20.5C17.17,20.5 16.5,19.83 16.5,19C16.5,18.17 17.17,17.5 18,17.5Z' })
  );
};