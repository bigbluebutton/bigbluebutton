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
    _react2.default.createElement('path', { d: 'M2,16H17V19H2V16M20.5,16H22V19H20.5V16M18,16H19.5V19H18V16M18.85,7.73C19.47,7.12 19.85,6.28 19.85,5.35C19.85,3.5 18.35,2 16.5,2V3.5C17.5,3.5 18.35,4.33 18.35,5.35C18.35,6.37 17.5,7.2 16.5,7.2V8.7C18.74,8.7 20.5,10.53 20.5,12.77V15H22V12.76C22,10.54 20.72,8.62 18.85,7.73M16.03,10.2H14.5C13.5,10.2 12.65,9.22 12.65,8.2C12.65,7.18 13.5,6.45 14.5,6.45V4.95C12.65,4.95 11.15,6.45 11.15,8.3C11.15,10.15 12.65,11.65 14.5,11.65H16.03C17.08,11.65 18,12.39 18,13.7V15H19.5V13.36C19.5,11.55 17.9,10.2 16.03,10.2Z' })
  );
};