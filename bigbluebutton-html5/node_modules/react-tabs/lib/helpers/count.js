"use strict";

exports.__esModule = true;
exports.getTabsCount = getTabsCount;
exports.getPanelsCount = getPanelsCount;

var _childrenDeepMap = require("./childrenDeepMap");

var _elementTypes = require("./elementTypes");

function getTabsCount(children) {
  var tabCount = 0;
  (0, _childrenDeepMap.deepForEach)(children, function (child) {
    if ((0, _elementTypes.isTab)(child)) tabCount++;
  });
  return tabCount;
}

function getPanelsCount(children) {
  var panelCount = 0;
  (0, _childrenDeepMap.deepForEach)(children, function (child) {
    if ((0, _elementTypes.isTabPanel)(child)) panelCount++;
  });
  return panelCount;
}