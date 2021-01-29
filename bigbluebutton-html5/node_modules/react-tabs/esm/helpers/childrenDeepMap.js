function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { Children, cloneElement } from 'react';
import { isTabPanel, isTab, isTabList } from './elementTypes';

function isTabChild(child) {
  return isTab(child) || isTabList(child) || isTabPanel(child);
}

export function deepMap(children, callback) {
  return Children.map(children, function (child) {
    // null happens when conditionally rendering TabPanel/Tab
    // see https://github.com/reactjs/react-tabs/issues/37
    if (child === null) return null;

    if (isTabChild(child)) {
      return callback(child);
    }

    if (child.props && child.props.children && typeof child.props.children === 'object') {
      // Clone the child that has children and map them too
      return cloneElement(child, _objectSpread({}, child.props, {
        children: deepMap(child.props.children, callback)
      }));
    }

    return child;
  });
}
export function deepForEach(children, callback) {
  return Children.forEach(children, function (child) {
    // null happens when conditionally rendering TabPanel/Tab
    // see https://github.com/reactjs/react-tabs/issues/37
    if (child === null) return;

    if (isTab(child) || isTabPanel(child)) {
      callback(child);
    } else if (child.props && child.props.children && typeof child.props.children === 'object') {
      if (isTabList(child)) callback(child);
      deepForEach(child.props.children, callback);
    }
  });
}