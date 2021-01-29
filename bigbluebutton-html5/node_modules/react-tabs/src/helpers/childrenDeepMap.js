import { Children, cloneElement } from 'react';
import { isTabPanel, isTab, isTabList } from './elementTypes';

function isTabChild(child) {
  return isTab(child) || isTabList(child) || isTabPanel(child);
}

export function deepMap(children, callback) {
  return Children.map(children, child => {
    // null happens when conditionally rendering TabPanel/Tab
    // see https://github.com/reactjs/react-tabs/issues/37
    if (child === null) return null;

    if (isTabChild(child)) {
      return callback(child);
    }

    if (
      child.props &&
      child.props.children &&
      typeof child.props.children === 'object'
    ) {
      // Clone the child that has children and map them too
      return cloneElement(child, {
        ...child.props,
        children: deepMap(child.props.children, callback),
      });
    }

    return child;
  });
}

export function deepForEach(children, callback) {
  return Children.forEach(children, child => {
    // null happens when conditionally rendering TabPanel/Tab
    // see https://github.com/reactjs/react-tabs/issues/37
    if (child === null) return;

    if (isTab(child) || isTabPanel(child)) {
      callback(child);
    } else if (
      child.props &&
      child.props.children &&
      typeof child.props.children === 'object'
    ) {
      if (isTabList(child)) callback(child);
      deepForEach(child.props.children, callback);
    }
  });
}
