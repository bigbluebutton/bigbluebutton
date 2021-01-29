"use strict";

exports.__esModule = true;
exports.default = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _uuid = _interopRequireDefault(require("../helpers/uuid"));

var _propTypes2 = require("../helpers/propTypes");

var _count = require("../helpers/count");

var _childrenDeepMap = require("../helpers/childrenDeepMap");

var _elementTypes = require("../helpers/elementTypes");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function isNode(node) {
  return node && 'getAttribute' in node;
} // Determine if a node from event.target is a Tab element


function isTabNode(node) {
  return isNode(node) && node.getAttribute('role') === 'tab';
} // Determine if a tab node is disabled


function isTabDisabled(node) {
  return isNode(node) && node.getAttribute('aria-disabled') === 'true';
}

var canUseActiveElement;

try {
  canUseActiveElement = !!(typeof window !== 'undefined' && window.document && window.document.activeElement);
} catch (e) {
  // Work around for IE bug when accessing document.activeElement in an iframe
  // Refer to the following resources:
  // http://stackoverflow.com/a/10982960/369687
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12733599
  canUseActiveElement = false;
}

var UncontrolledTabs =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(UncontrolledTabs, _Component);

  function UncontrolledTabs() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.tabNodes = [];

    _this.handleKeyDown = function (e) {
      if (_this.isTabFromContainer(e.target)) {
        var index = _this.props.selectedIndex;
        var preventDefault = false;
        var useSelectedIndex = false;

        if (e.keyCode === 32 || e.keyCode === 13) {
          preventDefault = true;
          useSelectedIndex = false;

          _this.handleClick(e);
        }

        if (e.keyCode === 37 || e.keyCode === 38) {
          // Select next tab to the left
          index = _this.getPrevTab(index);
          preventDefault = true;
          useSelectedIndex = true;
        } else if (e.keyCode === 39 || e.keyCode === 40) {
          // Select next tab to the right
          index = _this.getNextTab(index);
          preventDefault = true;
          useSelectedIndex = true;
        } else if (e.keyCode === 35) {
          // Select last tab (End key)
          index = _this.getLastTab();
          preventDefault = true;
          useSelectedIndex = true;
        } else if (e.keyCode === 36) {
          // Select first tab (Home key)
          index = _this.getFirstTab();
          preventDefault = true;
          useSelectedIndex = true;
        } // This prevents scrollbars from moving around


        if (preventDefault) {
          e.preventDefault();
        } // Only use the selected index in the state if we're not using the tabbed index


        if (useSelectedIndex) {
          _this.setSelected(index, e);
        }
      }
    };

    _this.handleClick = function (e) {
      var node = e.target; // eslint-disable-next-line no-cond-assign

      do {
        if (_this.isTabFromContainer(node)) {
          if (isTabDisabled(node)) {
            return;
          }

          var index = [].slice.call(node.parentNode.children).filter(isTabNode).indexOf(node);

          _this.setSelected(index, e);

          return;
        }
      } while ((node = node.parentNode) != null);
    };

    return _this;
  }

  var _proto = UncontrolledTabs.prototype;

  _proto.setSelected = function setSelected(index, event) {
    // Check index boundary
    if (index < 0 || index >= this.getTabsCount()) return;
    var _this$props = this.props,
        onSelect = _this$props.onSelect,
        selectedIndex = _this$props.selectedIndex; // Call change event handler

    onSelect(index, selectedIndex, event);
  };

  _proto.getNextTab = function getNextTab(index) {
    var count = this.getTabsCount(); // Look for non-disabled tab from index to the last tab on the right

    for (var i = index + 1; i < count; i++) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    } // If no tab found, continue searching from first on left to index


    for (var _i = 0; _i < index; _i++) {
      if (!isTabDisabled(this.getTab(_i))) {
        return _i;
      }
    } // No tabs are disabled, return index


    return index;
  };

  _proto.getPrevTab = function getPrevTab(index) {
    var i = index; // Look for non-disabled tab from index to first tab on the left

    while (i--) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    } // If no tab found, continue searching from last tab on right to index


    i = this.getTabsCount();

    while (i-- > index) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    } // No tabs are disabled, return index


    return index;
  };

  _proto.getFirstTab = function getFirstTab() {
    var count = this.getTabsCount(); // Look for non disabled tab from the first tab

    for (var i = 0; i < count; i++) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    return null;
  };

  _proto.getLastTab = function getLastTab() {
    var i = this.getTabsCount(); // Look for non disabled tab from the last tab

    while (i--) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    return null;
  };

  _proto.getTabsCount = function getTabsCount() {
    var children = this.props.children;
    return (0, _count.getTabsCount)(children);
  };

  _proto.getPanelsCount = function getPanelsCount() {
    var children = this.props.children;
    return (0, _count.getPanelsCount)(children);
  };

  _proto.getTab = function getTab(index) {
    return this.tabNodes["tabs-" + index];
  };

  _proto.getChildren = function getChildren() {
    var _this2 = this;

    var index = 0;
    var _this$props2 = this.props,
        children = _this$props2.children,
        disabledTabClassName = _this$props2.disabledTabClassName,
        focus = _this$props2.focus,
        forceRenderTabPanel = _this$props2.forceRenderTabPanel,
        selectedIndex = _this$props2.selectedIndex,
        selectedTabClassName = _this$props2.selectedTabClassName,
        selectedTabPanelClassName = _this$props2.selectedTabPanelClassName;
    this.tabIds = this.tabIds || [];
    this.panelIds = this.panelIds || [];
    var diff = this.tabIds.length - this.getTabsCount(); // Add ids if new tabs have been added
    // Don't bother removing ids, just keep them in case they are added again
    // This is more efficient, and keeps the uuid counter under control

    while (diff++ < 0) {
      this.tabIds.push((0, _uuid.default)());
      this.panelIds.push((0, _uuid.default)());
    } // Map children to dynamically setup refs


    return (0, _childrenDeepMap.deepMap)(children, function (child) {
      var result = child; // Clone TabList and Tab components to have refs

      if ((0, _elementTypes.isTabList)(child)) {
        var listIndex = 0; // Figure out if the current focus in the DOM is set on a Tab
        // If it is we should keep the focus on the next selected tab

        var wasTabFocused = false;

        if (canUseActiveElement) {
          wasTabFocused = _react.default.Children.toArray(child.props.children).filter(_elementTypes.isTab).some(function (tab, i) {
            return document.activeElement === _this2.getTab(i);
          });
        }

        result = (0, _react.cloneElement)(child, {
          children: (0, _childrenDeepMap.deepMap)(child.props.children, function (tab) {
            var key = "tabs-" + listIndex;
            var selected = selectedIndex === listIndex;
            var props = {
              tabRef: function tabRef(node) {
                _this2.tabNodes[key] = node;
              },
              id: _this2.tabIds[listIndex],
              panelId: _this2.panelIds[listIndex],
              selected: selected,
              focus: selected && (focus || wasTabFocused)
            };
            if (selectedTabClassName) props.selectedClassName = selectedTabClassName;
            if (disabledTabClassName) props.disabledClassName = disabledTabClassName;
            listIndex++;
            return (0, _react.cloneElement)(tab, props);
          })
        });
      } else if ((0, _elementTypes.isTabPanel)(child)) {
        var props = {
          id: _this2.panelIds[index],
          tabId: _this2.tabIds[index],
          selected: selectedIndex === index
        };
        if (forceRenderTabPanel) props.forceRender = forceRenderTabPanel;
        if (selectedTabPanelClassName) props.selectedClassName = selectedTabPanelClassName;
        index++;
        result = (0, _react.cloneElement)(child, props);
      }

      return result;
    });
  };

  /**
   * Determine if a node from event.target is a Tab element for the current Tabs container.
   * If the clicked element is not a Tab, it returns false.
   * If it finds another Tabs container between the Tab and `this`, it returns false.
   */
  _proto.isTabFromContainer = function isTabFromContainer(node) {
    // return immediately if the clicked element is not a Tab.
    if (!isTabNode(node)) {
      return false;
    } // Check if the first occurrence of a Tabs container is `this` one.


    var nodeAncestor = node.parentElement;

    do {
      if (nodeAncestor === this.node) return true;
      if (nodeAncestor.getAttribute('data-tabs')) break;
      nodeAncestor = nodeAncestor.parentElement;
    } while (nodeAncestor);

    return false;
  };

  _proto.render = function render() {
    var _this3 = this;

    // Delete all known props, so they don't get added to DOM
    var _this$props3 = this.props,
        children = _this$props3.children,
        className = _this$props3.className,
        disabledTabClassName = _this$props3.disabledTabClassName,
        domRef = _this$props3.domRef,
        focus = _this$props3.focus,
        forceRenderTabPanel = _this$props3.forceRenderTabPanel,
        onSelect = _this$props3.onSelect,
        selectedIndex = _this$props3.selectedIndex,
        selectedTabClassName = _this$props3.selectedTabClassName,
        selectedTabPanelClassName = _this$props3.selectedTabPanelClassName,
        attributes = _objectWithoutPropertiesLoose(_this$props3, ["children", "className", "disabledTabClassName", "domRef", "focus", "forceRenderTabPanel", "onSelect", "selectedIndex", "selectedTabClassName", "selectedTabPanelClassName"]);

    return _react.default.createElement("div", _extends({}, attributes, {
      className: (0, _classnames.default)(className),
      onClick: this.handleClick,
      onKeyDown: this.handleKeyDown,
      ref: function ref(node) {
        _this3.node = node;
        if (domRef) domRef(node);
      },
      "data-tabs": true
    }), this.getChildren());
  };

  return UncontrolledTabs;
}(_react.Component);

exports.default = UncontrolledTabs;
UncontrolledTabs.defaultProps = {
  className: 'react-tabs',
  focus: false
};
UncontrolledTabs.propTypes = process.env.NODE_ENV !== "production" ? {
  children: _propTypes2.childrenPropType,
  className: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.array, _propTypes.default.object]),
  disabledTabClassName: _propTypes.default.string,
  domRef: _propTypes.default.func,
  focus: _propTypes.default.bool,
  forceRenderTabPanel: _propTypes.default.bool,
  onSelect: _propTypes.default.func.isRequired,
  selectedIndex: _propTypes.default.number.isRequired,
  selectedTabClassName: _propTypes.default.string,
  selectedTabPanelClassName: _propTypes.default.string
} : {};