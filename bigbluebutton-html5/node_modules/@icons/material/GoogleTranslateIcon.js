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
    _react2.default.createElement('path', { d: 'M3,1C1.89,1 1,1.89 1,3V17C1,18.11 1.89,19 3,19H15L9,1H3M12.34,5L13,7H21V21H12.38L13.03,23H21C22.11,23 23,22.11 23,21V7C23,5.89 22.11,5 21,5H12.34M7.06,5.91C8.16,5.91 9.09,6.31 9.78,7L8.66,8.03C8.37,7.74 7.87,7.41 7.06,7.41C5.67,7.41 4.56,8.55 4.56,9.94C4.56,11.33 5.67,12.5 7.06,12.5C8.68,12.5 9.26,11.33 9.38,10.75H7.06V9.38H10.88C10.93,9.61 10.94,9.77 10.94,10.06C10.94,12.38 9.38,14 7.06,14C4.81,14 3,12.19 3,9.94C3,7.68 4.81,5.91 7.06,5.91M16,10V11H14.34L14.66,12H18C17.73,12.61 17.63,13.17 16.81,14.13C16.41,13.66 16.09,13.25 16,13H15C15.12,13.43 15.62,14.1 16.22,14.78C16.09,14.91 15.91,15.08 15.75,15.22L16.03,16.06C16.28,15.84 16.53,15.61 16.78,15.38C17.8,16.45 18.88,17.44 18.88,17.44L19.44,16.84C19.44,16.84 18.37,15.79 17.41,14.75C18.04,14.05 18.6,13.2 19,12H20V11H17V10H16Z' })
  );
};