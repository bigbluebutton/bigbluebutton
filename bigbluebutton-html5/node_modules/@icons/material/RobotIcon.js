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
    _react2.default.createElement('path', { d: 'M12,2C13.1,2 14,2.9 14,4C14,4.74 13.6,5.39 13,5.73V7H14C17.87,7 21,10.13 21,14H22C22.55,14 23,14.45 23,15V18C23,18.55 22.55,19 22,19H21V20C21,21.1 20.1,22 19,22H5C3.9,22 3,21.1 3,20V19H2C1.45,19 1,18.55 1,18V15C1,14.45 1.45,14 2,14H3C3,10.13 6.13,7 10,7H11V5.73C10.4,5.39 10,4.74 10,4C10,2.9 10.9,2 12,2M7.5,13C6.12,13 5,14.12 5,15.5C5,16.88 6.12,18 7.5,18C8.88,18 10,16.88 10,15.5C10,14.12 8.88,13 7.5,13M16.5,13C15.12,13 14,14.12 14,15.5C14,16.88 15.12,18 16.5,18C17.88,18 19,16.88 19,15.5C19,14.12 17.88,13 16.5,13Z' })
  );
};