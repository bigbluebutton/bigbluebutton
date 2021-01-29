"use strict";

exports.__esModule = true;
exports.Flip = exports.Zoom = exports.Slide = exports.Bounce = void 0;

var _cssTransition = _interopRequireDefault(require("./../utils/cssTransition"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bounce = (0, _cssTransition.default)({
  enter: 'Toastify__bounce-enter',
  exit: 'Toastify__bounce-exit',
  appendPosition: true
});
exports.Bounce = Bounce;
var Slide = (0, _cssTransition.default)({
  enter: 'Toastify__slide-enter',
  exit: 'Toastify__slide-exit',
  duration: [450, 750],
  appendPosition: true
});
exports.Slide = Slide;
var Zoom = (0, _cssTransition.default)({
  enter: 'Toastify__zoom-enter',
  exit: 'Toastify__zoom-exit'
});
exports.Zoom = Zoom;
var Flip = (0, _cssTransition.default)({
  enter: 'Toastify__flip-enter',
  exit: 'Toastify__flip-exit'
});
exports.Flip = Flip;