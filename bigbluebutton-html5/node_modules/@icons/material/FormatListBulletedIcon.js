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
    _react2.default.createElement('path', { d: 'M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5C4.83,4.5 5.5,5.17 5.5,6C5.5,6.83 4.83,7.5 4,7.5C3.17,7.5 2.5,6.83 2.5,6C2.5,5.17 3.17,4.5 4,4.5M4,10.5C4.83,10.5 5.5,11.17 5.5,12C5.5,12.83 4.83,13.5 4,13.5C3.17,13.5 2.5,12.83 2.5,12C2.5,11.17 3.17,10.5 4,10.5M7,19V17H21V19H7M4,16.5C4.83,16.5 5.5,17.17 5.5,18C5.5,18.83 4.83,19.5 4,19.5C3.17,19.5 2.5,18.83 2.5,18C2.5,17.17 3.17,16.5 4,16.5Z' })
  );
};