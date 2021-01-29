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
    _react2.default.createElement('path', { d: 'M3,1H5V3H3V5H1V3C1,1.9 1.9,1 3,1M14,1C15.1,1 16,1.9 16,3V5H14V3H12V1H14M20,7C21.1,7 22,7.9 22,9V11H20V9H18V7H20M22,20C22,21.1 21.1,22 20,22H18V20H20V18H22V20M20,13H22V16H20V13M13,9V7H16V10H14V9H13M13,22V20H16V22H13M9,22C7.9,22 7,21.1 7,20V18H9V20H11V22H9M7,16V13H9V14H10V16H7M7,3V1H10V3H7M3,16C1.9,16 1,15.1 1,14V12H3V14H5V16H3M1,7H3V10H1V7M9,7H11V9H9V11H7V9C7,7.9 7.9,7 9,7M16,14C16,15.1 15.1,16 14,16H12V14H14V12H16V14Z' })
  );
};