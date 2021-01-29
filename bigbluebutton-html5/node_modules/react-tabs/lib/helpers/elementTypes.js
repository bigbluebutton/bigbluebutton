"use strict";

exports.__esModule = true;
exports.isTab = isTab;
exports.isTabPanel = isTabPanel;
exports.isTabList = isTabList;

function isTab(el) {
  return el.type && el.type.tabsRole === 'Tab';
}

function isTabPanel(el) {
  return el.type && el.type.tabsRole === 'TabPanel';
}

function isTabList(el) {
  return el.type && el.type.tabsRole === 'TabList';
}