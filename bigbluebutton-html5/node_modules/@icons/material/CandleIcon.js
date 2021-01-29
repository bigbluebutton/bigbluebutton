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
    _react2.default.createElement('path', { d: 'M12.5,2C10.84,2 9.5,5.34 9.5,7C9.5,8.66 10.84,10 12.5,10C14.16,10 15.5,8.66 15.5,7C15.5,5.34 14.16,2 12.5,2M12.5,6.5C13.05,6.5 13.5,6.95 13.5,7.5C13.5,8.05 13.05,8.5 12.5,8.5C11.95,8.5 11.5,8.05 11.5,7.5C11.5,6.95 11.95,6.5 12.5,6.5M10,11C9.45,11 9,11.45 9,12V20H7C6.45,20 6,19.55 6,19V18C6,17.45 5.55,17 5,17C4.45,17 4,17.45 4,18V19C4,20.66 5.34,22 7,22H19C19.55,22 20,21.55 20,21C20,20.45 19.55,20 19,20H16V12C16,11.45 15.55,11 15,11H10Z' })
  );
};