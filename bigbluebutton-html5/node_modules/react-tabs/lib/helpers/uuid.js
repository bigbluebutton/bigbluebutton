"use strict";

exports.__esModule = true;
exports.default = uuid;
exports.reset = reset;
// Get a universally unique identifier
var count = 0;

function uuid() {
  return "react-tabs-" + count++;
}

function reset() {
  count = 0;
}