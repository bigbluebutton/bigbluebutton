import PropTypes from 'prop-types';
import React, { cloneElement, Component } from 'react';
import cx from 'classnames';
import uuid from '../helpers/uuid';
import { childrenPropType } from '../helpers/propTypes';
import { getPanelsCount, getTabsCount } from '../helpers/count';
import { deepMap } from '../helpers/childrenDeepMap';
import { isTabList, isTabPanel, isTab } from '../helpers/elementTypes';

function isNode(node) {
  return node && 'getAttribute' in node;
}

// Determine if a node from event.target is a Tab element
function isTabNode(node) {
  return isNode(node) && node.getAttribute('role') === 'tab';
}

// Determine if a tab node is disabled
function isTabDisabled(node) {
  return isNode(node) && node.getAttribute('aria-disabled') === 'true';
}

let canUseActiveElement;
try {
  canUseActiveElement = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.activeElement
  );
} catch (e) {
  // Work around for IE bug when accessing document.activeElement in an iframe
  // Refer to the following resources:
  // http://stackoverflow.com/a/10982960/369687
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12733599
  canUseActiveElement = false;
}
export default class UncontrolledTabs extends Component {
  static defaultProps = {
    className: 'react-tabs',
    focus: false,
  };

  static propTypes = {
    children: childrenPropType,
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
    ]),
    disabledTabClassName: PropTypes.string,
    domRef: PropTypes.func,
    focus: PropTypes.bool,
    forceRenderTabPanel: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    selectedIndex: PropTypes.number.isRequired,
    selectedTabClassName: PropTypes.string,
    selectedTabPanelClassName: PropTypes.string,
  };

  tabNodes = [];

  setSelected(index, event) {
    // Check index boundary
    if (index < 0 || index >= this.getTabsCount()) return;

    const { onSelect, selectedIndex } = this.props;

    // Call change event handler
    onSelect(index, selectedIndex, event);
  }

  getNextTab(index) {
    const count = this.getTabsCount();

    // Look for non-disabled tab from index to the last tab on the right
    for (let i = index + 1; i < count; i++) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    // If no tab found, continue searching from first on left to index
    for (let i = 0; i < index; i++) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    // No tabs are disabled, return index
    return index;
  }

  getPrevTab(index) {
    let i = index;

    // Look for non-disabled tab from index to first tab on the left
    while (i--) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    // If no tab found, continue searching from last tab on right to index
    i = this.getTabsCount();
    while (i-- > index) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    // No tabs are disabled, return index
    return index;
  }

  getFirstTab() {
    const count = this.getTabsCount();

    // Look for non disabled tab from the first tab
    for (let i = 0; i < count; i++) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    return null;
  }

  getLastTab() {
    let i = this.getTabsCount();

    // Look for non disabled tab from the last tab
    while (i--) {
      if (!isTabDisabled(this.getTab(i))) {
        return i;
      }
    }

    return null;
  }

  getTabsCount() {
    const { children } = this.props;
    return getTabsCount(children);
  }

  getPanelsCount() {
    const { children } = this.props;
    return getPanelsCount(children);
  }

  getTab(index) {
    return this.tabNodes[`tabs-${index}`];
  }

  getChildren() {
    let index = 0;
    const {
      children,
      disabledTabClassName,
      focus,
      forceRenderTabPanel,
      selectedIndex,
      selectedTabClassName,
      selectedTabPanelClassName,
    } = this.props;

    this.tabIds = this.tabIds || [];
    this.panelIds = this.panelIds || [];
    let diff = this.tabIds.length - this.getTabsCount();

    // Add ids if new tabs have been added
    // Don't bother removing ids, just keep them in case they are added again
    // This is more efficient, and keeps the uuid counter under control
    while (diff++ < 0) {
      this.tabIds.push(uuid());
      this.panelIds.push(uuid());
    }

    // Map children to dynamically setup refs
    return deepMap(children, child => {
      let result = child;

      // Clone TabList and Tab components to have refs
      if (isTabList(child)) {
        let listIndex = 0;

        // Figure out if the current focus in the DOM is set on a Tab
        // If it is we should keep the focus on the next selected tab
        let wasTabFocused = false;

        if (canUseActiveElement) {
          wasTabFocused = React.Children.toArray(child.props.children)
            .filter(isTab)
            .some((tab, i) => document.activeElement === this.getTab(i));
        }

        result = cloneElement(child, {
          children: deepMap(child.props.children, tab => {
            const key = `tabs-${listIndex}`;
            const selected = selectedIndex === listIndex;

            const props = {
              tabRef: node => {
                this.tabNodes[key] = node;
              },
              id: this.tabIds[listIndex],
              panelId: this.panelIds[listIndex],
              selected,
              focus: selected && (focus || wasTabFocused),
            };

            if (selectedTabClassName)
              props.selectedClassName = selectedTabClassName;
            if (disabledTabClassName)
              props.disabledClassName = disabledTabClassName;

            listIndex++;

            return cloneElement(tab, props);
          }),
        });
      } else if (isTabPanel(child)) {
        const props = {
          id: this.panelIds[index],
          tabId: this.tabIds[index],
          selected: selectedIndex === index,
        };

        if (forceRenderTabPanel) props.forceRender = forceRenderTabPanel;
        if (selectedTabPanelClassName)
          props.selectedClassName = selectedTabPanelClassName;

        index++;

        result = cloneElement(child, props);
      }

      return result;
    });
  }

  handleKeyDown = e => {
    if (this.isTabFromContainer(e.target)) {
      let { selectedIndex: index } = this.props;
      let preventDefault = false;
      let useSelectedIndex = false;

      if (e.keyCode === 32 || e.keyCode === 13) {
        preventDefault = true;
        useSelectedIndex = false;
        this.handleClick(e);
      }

      if (e.keyCode === 37 || e.keyCode === 38) {
        // Select next tab to the left
        index = this.getPrevTab(index);
        preventDefault = true;
        useSelectedIndex = true;
      } else if (e.keyCode === 39 || e.keyCode === 40) {
        // Select next tab to the right
        index = this.getNextTab(index);
        preventDefault = true;
        useSelectedIndex = true;
      } else if (e.keyCode === 35) {
        // Select last tab (End key)
        index = this.getLastTab();
        preventDefault = true;
        useSelectedIndex = true;
      } else if (e.keyCode === 36) {
        // Select first tab (Home key)
        index = this.getFirstTab();
        preventDefault = true;
        useSelectedIndex = true;
      }

      // This prevents scrollbars from moving around
      if (preventDefault) {
        e.preventDefault();
      }

      // Only use the selected index in the state if we're not using the tabbed index
      if (useSelectedIndex) {
        this.setSelected(index, e);
      }
    }
  };

  handleClick = e => {
    let node = e.target;
    // eslint-disable-next-line no-cond-assign
    do {
      if (this.isTabFromContainer(node)) {
        if (isTabDisabled(node)) {
          return;
        }

        const index = [].slice
          .call(node.parentNode.children)
          .filter(isTabNode)
          .indexOf(node);
        this.setSelected(index, e);
        return;
      }
    } while ((node = node.parentNode) != null);
  };

  /**
   * Determine if a node from event.target is a Tab element for the current Tabs container.
   * If the clicked element is not a Tab, it returns false.
   * If it finds another Tabs container between the Tab and `this`, it returns false.
   */
  isTabFromContainer(node) {
    // return immediately if the clicked element is not a Tab.
    if (!isTabNode(node)) {
      return false;
    }

    // Check if the first occurrence of a Tabs container is `this` one.
    let nodeAncestor = node.parentElement;
    do {
      if (nodeAncestor === this.node) return true;
      if (nodeAncestor.getAttribute('data-tabs')) break;

      nodeAncestor = nodeAncestor.parentElement;
    } while (nodeAncestor);

    return false;
  }

  render() {
    // Delete all known props, so they don't get added to DOM
    const {
      children, // unused
      className,
      disabledTabClassName, // unused
      domRef,
      focus, // unused
      forceRenderTabPanel, // unused
      onSelect, // unused
      selectedIndex, // unused
      selectedTabClassName, // unused
      selectedTabPanelClassName, // unused
      ...attributes
    } = this.props;

    return (
      <div
        {...attributes}
        className={cx(className)}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        ref={node => {
          this.node = node;
          if (domRef) domRef(node);
        }}
        data-tabs
      >
        {this.getChildren()}
      </div>
    );
  }
}
