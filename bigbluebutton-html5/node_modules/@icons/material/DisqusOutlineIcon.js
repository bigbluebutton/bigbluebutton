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
    _react2.default.createElement('path', { d: 'M11.9,14.5H10.8V9.5H11.9C13.5,9.5 14.6,10.4 14.6,12C14.6,13.6 13.5,14.5 11.9,14.5M11.9,7H8.1V17H11.8C15.3,17 17.4,14.9 17.4,12V12C17.4,9.1 15.4,7 11.9,7M12,20C10.1,20 8.3,19.3 6.9,18.1L6.2,17.5L4.5,17.7L5.2,16.1L4.9,15.3C4.4,14.2 4.2,13.1 4.2,11.9C4.2,7.5 7.8,3.9 12.1,3.9C16.4,3.9 19.9,7.6 19.9,12C19.9,16.4 16.3,20 12,20M12,2C6.5,2 2.1,6.5 2.1,12C2.1,13.5 2.4,14.9 3,16.2L1.4,20.3L5.7,19.7C7.4,21.2 9.7,22.1 12.1,22.1C17.6,22.1 22,17.6 22,12.1C22,6.6 17.5,2 12,2Z' })
  );
};