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
    _react2.default.createElement('path', { d: 'M19.5,2H4.5C3.12,2 2,3.12 2,4.5V19.5C2,20.88 3.12,22 4.5,22H19.5C20.88,22 22,20.88 22,19.5V4.5C22,3.12 20.88,2 19.5,2M10.7,17.2C10.7,17.86 10.16,18.4 9.5,18.4H5.8C5.14,18.4 4.6,17.86 4.6,17.2V5.8C4.6,5.14 5.14,4.6 5.8,4.6H9.5C10.16,4.6 10.7,5.14 10.7,5.8V17.2M19.4,12.2C19.4,12.86 18.86,13.4 18.2,13.4H14.5C13.84,13.4 13.3,12.86 13.3,12.2V5.8C13.3,5.14 13.84,4.6 14.5,4.6H18.2C18.86,4.6 19.4,5.14 19.4,5.8V12.2Z' })
  );
};