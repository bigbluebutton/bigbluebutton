function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

var TabList =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(TabList, _Component);

  function TabList() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = TabList.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        children = _this$props.children,
        className = _this$props.className,
        attributes = _objectWithoutPropertiesLoose(_this$props, ["children", "className"]);

    return React.createElement("ul", _extends({}, attributes, {
      className: cx(className),
      role: "tablist"
    }), children);
  };

  return TabList;
}(Component);

TabList.defaultProps = {
  className: 'react-tabs__tab-list'
};
export { TabList as default };
TabList.propTypes = process.env.NODE_ENV !== "production" ? {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object])
} : {};
TabList.tabsRole = 'TabList';