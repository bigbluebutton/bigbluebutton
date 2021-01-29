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
    _react2.default.createElement('path', { d: 'M3,2H6C6.28,2 6.53,2.11 6.71,2.29L8.79,4.38L9.59,3.59C10,3.2 10.5,3 11,3H17C17.5,3 18,3.2 18.41,3.59L19.41,4.59C19.8,5 20,5.5 20,6V19C20,20.1 19.1,21 18,21H8C6.9,21 6,20.1 6,19V13L6,12V8C6,7.5 6.2,7 6.59,6.59L7.38,5.79L5.59,4H3V2M11,5V7H17V5H11M11.41,11L9.41,9H8V10.41L10,12.41V15.59L8,17.59V19H9.41L11.41,17H14.59L16.59,19H18V17.59L16,15.59V12.41L18,10.41V9H16.59L14.59,11H11.41M12,13H14V15H12V13Z' })
  );
};