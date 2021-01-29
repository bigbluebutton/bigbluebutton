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
    _react2.default.createElement('path', { d: 'M6,2C4.9,2 4,2.9 4,4V20C4,21.1 4.9,22 6,22H18C19.1,22 20,21.1 20,20V4C20,2.9 19.1,2 18,2H6M12,5C14.76,5 17,7.24 17,10C17,12.76 14.76,15 12,15C9.24,15 7,12.76 7,10C7,7.24 9.24,5 12,5M12,6C11.59,6.62 11.25,7.29 11.04,8H12.96C12.75,7.29 12.42,6.62 12,6M10.7,6.22C9.78,6.53 9,7.17 8.54,8H10C10.18,7.38 10.4,6.78 10.7,6.22M13.29,6.22C13.59,6.78 13.82,7.38 14,8H15.46C15,7.17 14.21,6.54 13.29,6.22M8.13,9C8.05,9.32 8,9.65 8,10C8,10.35 8.05,10.68 8.13,11H9.82C9.78,10.67 9.75,10.34 9.75,10C9.75,9.66 9.78,9.33 9.82,9H8.13M10.83,9C10.78,9.32 10.75,9.66 10.75,10C10.75,10.34 10.78,10.67 10.83,11H13.17C13.21,10.67 13.25,10.34 13.25,10C13.25,9.66 13.21,9.32 13.17,9H10.83M14.18,9C14.22,9.33 14.25,9.66 14.25,10C14.25,10.34 14.22,10.67 14.18,11H15.87C15.95,10.68 16,10.35 16,10C16,9.65 15.95,9.32 15.87,9H14.18M8.54,12C9,12.83 9.78,13.46 10.7,13.78C10.4,13.22 10.18,12.63 10,12H8.54M11.04,12C11.25,12.72 11.59,13.38 12,14C12.42,13.38 12.75,12.72 12.96,12H11.04M14,12C13.82,12.63 13.59,13.22 13.29,13.78C14.21,13.46 15,12.83 15.46,12H14M7,17H17V19H7V17Z' })
  );
};