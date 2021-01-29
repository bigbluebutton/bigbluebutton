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
    _react2.default.createElement('path', { d: 'M12,11.18C15.3,8.18 17,6.64 17,4.69C17,3.19 15.75,2 14.25,2C13.39,2 12.57,2.36 12,3C11.43,2.36 10.61,2 9.69,2C8.19,2 7,3.25 7,4.75C7,6.64 8.7,8.18 12,11.18M11.18,12C8.18,8.7 6.64,7 4.69,7C3.19,7 2,8.25 2,9.75C2,10.61 2.36,11.43 3,12C2.36,12.57 2,13.39 2,14.31C2,15.81 3.25,17 4.75,17C6.64,17 8.18,15.3 11.18,12M12.83,12C15.82,15.3 17.36,17 19.31,17C20.81,17 22,15.75 22,14.25C22,13.39 21.64,12.57 21,12C21.64,11.43 22,10.61 22,9.69C22,8.19 20.75,7 19.25,7C17.36,7 15.82,8.7 12.83,12M12,12.82C8.7,15.82 7,17.36 7,19.31C7,20.81 8.25,22 9.75,22C10.61,22 11.43,21.64 12,21C12.57,21.64 13.39,22 14.31,22C15.81,22 17,20.75 17,19.25C17,17.36 15.3,15.82 12,12.82Z' })
  );
};