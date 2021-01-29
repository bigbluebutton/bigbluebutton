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
    _react2.default.createElement('path', { d: 'M12,2C7.58,2 4,5.58 4,10C4,14.03 7,17.42 11,17.93V19H10C9.45,19 9,19.45 9,20H2V22H9C9,22.55 9.45,23 10,23H14C14.55,23 15,22.55 15,22H22V20H15C15,19.45 14.55,19 14,19H13V17.93C17,17.43 20,14.03 20,10C20,5.58 16.42,2 12,2M12,4C12,4 12.74,5.28 13.26,7H10.74C11.26,5.28 12,4 12,4M9.77,4.43C9.5,4.93 9.09,5.84 8.74,7H6.81C7.5,5.84 8.5,4.93 9.77,4.43M14.23,4.44C15.5,4.94 16.5,5.84 17.19,7H15.26C14.91,5.84 14.5,4.93 14.23,4.44M6.09,9H8.32C8.28,9.33 8.25,9.66 8.25,10C8.25,10.34 8.28,10.67 8.32,11H6.09C6.03,10.67 6,10.34 6,10C6,9.66 6.03,9.33 6.09,9M10.32,9H13.68C13.72,9.33 13.75,9.66 13.75,10C13.75,10.34 13.72,10.67 13.68,11H10.32C10.28,10.67 10.25,10.34 10.25,10C10.25,9.66 10.28,9.33 10.32,9M15.68,9H17.91C17.97,9.33 18,9.66 18,10C18,10.34 17.97,10.67 17.91,11H15.68C15.72,10.67 15.75,10.34 15.75,10C15.75,9.66 15.72,9.33 15.68,9M6.81,13H8.74C9.09,14.16 9.5,15.07 9.77,15.56C8.5,15.06 7.5,14.16 6.81,13M10.74,13H13.26C12.74,14.72 12,16 12,16C12,16 11.26,14.72 10.74,13M15.26,13H17.19C16.5,14.16 15.5,15.07 14.23,15.57C14.5,15.07 14.91,14.16 15.26,13Z' })
  );
};