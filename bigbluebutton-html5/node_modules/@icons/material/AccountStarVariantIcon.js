'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccountStarVariantIcon = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DEFAULT_SIZE = 24;

var AccountStarVariantIcon = function AccountStarVariantIcon(_ref) {
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
    _react2.default.createElement('path', { d: 'M9,14C11.67,14 17,15.33 17,18V20H1V18C1,15.33 6.33,14 9,14M9,12C6.79,12 5,10.21 5,8C5,5.79 6.79,4 9,4C11.21,4 13,5.79 13,8C13,10.21 11.21,12 9,12M19,13.28L16.54,14.77L17.2,11.96L15,10.08L17.89,9.83L19,7.19L20.13,9.83L23,10.08L20.82,11.96L21.5,14.77L19,13.28Z' })
  );
};
exports.AccountStarVariantIcon = AccountStarVariantIcon;