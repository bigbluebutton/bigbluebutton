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
    _react2.default.createElement('path', { d: 'M18.4,11.2L14.3,11.4L16.6,8.8C16.8,8.5 16.9,8 16.8,7.5C16.7,7.2 16.6,6.9 16.3,6.7L10.9,3.5C10.5,3.2 9.9,3.3 9.5,3.6L6.8,6.1C6.3,6.6 6.2,7.3 6.7,7.8C7.1,8.3 7.9,8.3 8.4,7.9L10.4,6.1L12.3,7.2L8.1,11.5C8,11.6 8,11.7 7.9,11.7C7.4,11.9 6.9,12.1 6.5,12.4L8,13.9C8.5,13.7 9,13.5 9.5,13.5C11.4,13.5 13,15.1 13,17C13,17.6 12.9,18.1 12.6,18.5L14.1,20C14.7,19.1 15,18.1 15,17C15,15.8 14.6,14.6 13.9,13.7L17.2,13.4L17,18.2C16.9,18.9 17.4,19.4 18.1,19.5H18.2C18.8,19.5 19.3,19 19.4,18.4L19.6,12.5C19.6,12.2 19.5,11.8 19.3,11.6C19,11.3 18.7,11.2 18.4,11.2M18,5.5C19.1,5.5 20,4.6 20,3.5C20,2.4 19.1,1.5 18,1.5C16.9,1.5 16,2.4 16,3.5C16,4.6 16.9,5.5 18,5.5M12.5,21.6C11.6,22.2 10.6,22.5 9.5,22.5C6.5,22.5 4,20 4,17C4,15.9 4.3,14.9 4.9,14L6.4,15.5C6.2,16 6,16.5 6,17C6,18.9 7.6,20.5 9.5,20.5C10.1,20.5 10.6,20.4 11,20.1L12.5,21.6Z' })
  );
};