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
    _react2.default.createElement('path', { d: 'M4.93,2.93C3.12,4.74 2,7.24 2,10C2,12.76 3.12,15.26 4.93,17.07L6.34,15.66C4.89,14.22 4,12.22 4,10C4,7.79 4.89,5.78 6.34,4.34L4.93,2.93M19.07,2.93L17.66,4.34C19.11,5.78 20,7.79 20,10C20,12.22 19.11,14.22 17.66,15.66L19.07,17.07C20.88,15.26 22,12.76 22,10C22,7.24 20.88,4.74 19.07,2.93M7.76,5.76C6.67,6.85 6,8.35 6,10C6,11.65 6.67,13.15 7.76,14.24L9.17,12.83C8.45,12.11 8,11.11 8,10C8,8.89 8.45,7.89 9.17,7.17L7.76,5.76M16.24,5.76L14.83,7.17C15.55,7.89 16,8.89 16,10C16,11.11 15.55,12.11 14.83,12.83L16.24,14.24C17.33,13.15 18,11.65 18,10C18,8.35 17.33,6.85 16.24,5.76M12,8C10.9,8 10,8.9 10,10C10,11.1 10.9,12 12,12C13.1,12 14,11.1 14,10C14,8.9 13.1,8 12,8M11,14V18H10C9.45,18 9,18.45 9,19H2V21H9C9,21.55 9.45,22 10,22H14C14.55,22 15,21.55 15,21H22V19H15C15,18.45 14.55,18 14,18H13V14H11Z' })
  );
};