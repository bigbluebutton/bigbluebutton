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
    _react2.default.createElement('path', { d: 'M5.45,10.28C6.4,10.28 7.5,11.05 7.5,12C7.5,12.95 6.4,13.72 5.45,13.72H2L2.69,10.28H5.45M6.14,4.76C7.09,4.76 8.21,5.53 8.21,6.5C8.21,7.43 7.09,8.21 6.14,8.21H2.69L3.38,4.76H6.14M13.03,4.76C14,4.76 15.1,5.53 15.1,6.5C15.1,7.43 14,8.21 13.03,8.21H9.41L10.1,4.76H13.03M12.34,10.28C13.3,10.28 14.41,11.05 14.41,12C14.41,12.95 13.3,13.72 12.34,13.72H8.72L9.41,10.28H12.34M10.97,15.79C11.92,15.79 13.03,16.57 13.03,17.5C13.03,18.47 11.92,19.24 10.97,19.24H7.5L8.21,15.79H10.97M18.55,13.72C19.5,13.72 20.62,14.5 20.62,15.45C20.62,16.4 19.5,17.17 18.55,17.17H15.1L15.79,13.72H18.55M19.93,8.21C20.88,8.21 22,9 22,9.93C22,10.88 20.88,11.66 19.93,11.66H16.5L17.17,8.21H19.93Z' })
  );
};