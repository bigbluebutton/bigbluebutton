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
    _react2.default.createElement('path', { d: 'M20,5H15C13.9,5 13,5.9 13,7V12C13,13.1 13.9,14 15,14H20C21.1,14 22,13.1 22,12V7C22,5.9 21.1,5 20,5M17.5,12.5C15.84,12.5 14.5,11.16 14.5,9.5C14.5,7.84 15.84,6.5 17.5,6.5C19.16,6.5 20.5,7.84 20.5,9.5C20.5,11.16 19.16,12.5 17.5,12.5M17.5,11C16.67,11 16,10.33 16,9.5C16,8.67 16.67,8 17.5,8C18.33,8 19,8.67 19,9.5C19,10.33 18.33,11 17.5,11M12,15V5H4C2.9,5 2,5.9 2,7V17C2,18.1 2.9,19 4,19H20C21.1,19 22,18.1 22,17V15H12M10,12H4V7H10V12Z' })
  );
};