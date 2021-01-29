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
    _react2.default.createElement('path', { d: 'M11,7.83C9.83,7.42 9,6.3 9,5C9,3.34 10.34,2 12,2C13.66,2 15,3.34 15,5C15,6.31 14.16,7.42 13,7.83V10.64C12.68,10.55 12.35,10.5 12,10.5C11.65,10.5 11.32,10.55 11,10.64V7.83M18.3,21.1C17.16,20.45 16.62,19.18 16.84,17.96L14.4,16.55C14.88,16.09 15.24,15.5 15.4,14.82L17.84,16.23C18.78,15.42 20.16,15.26 21.29,15.91C22.73,16.74 23.22,18.57 22.39,20C21.56,21.44 19.73,21.93 18.3,21.1M2.7,15.9C3.83,15.25 5.21,15.42 6.15,16.22L8.6,14.81C8.76,15.5 9.11,16.08 9.6,16.54L7.15,17.95C7.38,19.17 6.83,20.45 5.7,21.1C4.26,21.93 2.43,21.44 1.6,20C0.77,18.57 1.26,16.73 2.7,15.9M14,14C14,15.1 13.1,16 12,16C10.89,16 10,15.1 10,14C10,12.9 10.9,12 12,12C13.11,12 14,12.9 14,14M17,14L16.97,14.57L15.5,13.71C15.4,12.64 14.83,11.71 14,11.12V9.41C15.77,10.19 17,11.95 17,14M14.97,18.03C14.14,18.64 13.11,19 12,19C10.89,19 9.86,18.64 9.03,18L10.5,17.17C10.96,17.38 11.47,17.5 12,17.5C12.53,17.5 13.03,17.38 13.5,17.17L14.97,18.03M7.03,14.56L7,14C7,11.95 8.23,10.19 10,9.42V11.13C9.17,11.71 8.6,12.64 8.5,13.7L7.03,14.56Z' })
  );
};