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
    _react2.default.createElement('path', { d: 'M12,14C11,14 9,15 9,16C9,18 12,18 12,18V17C11.45,17 11,16.55 11,16C11,15.45 11.45,15 12,15V14M12,19C12,19 8,18.5 8,16.5C8,13.5 11,12.75 12,12.75V11.5C11,11.5 7,13 7,16C7,20 12,20 12,20V19M10.07,7.03L11.26,7.56C11.69,5.12 12.84,3.5 12.84,3.5C12.41,4.53 12.13,5.38 11.95,6.05C13.16,3.55 15.61,2 15.61,2C14.43,3.18 13.56,4.46 12.97,5.53C14.55,3.85 16.74,2.75 16.74,2.75C14.05,4.47 12.84,7.2 12.54,7.96L13.09,8.04C13.09,8.56 13.09,9.04 13.34,9.42C14.1,11.31 18,11.47 18,16C18,20.53 13.97,22 11.83,22C9.69,22 5,21.03 5,16C5,10.97 9.95,10.93 10.83,8.92C10.95,8.54 10.07,7.03 10.07,7.03Z' })
  );
};