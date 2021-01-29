import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  childrenPropType,
  onSelectPropType,
  selectedIndexPropType,
} from '../helpers/propTypes';
import UncontrolledTabs from './UncontrolledTabs';
import { getTabsCount } from '../helpers/count';

export default class Tabs extends Component {
  static defaultProps = {
    defaultFocus: false,
    forceRenderTabPanel: false,
    selectedIndex: null,
    defaultIndex: null,
  };

  static propTypes = {
    children: childrenPropType,
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
    ]),
    defaultFocus: PropTypes.bool,
    defaultIndex: PropTypes.number,
    disabledTabClassName: PropTypes.string,
    domRef: PropTypes.func,
    forceRenderTabPanel: PropTypes.bool,
    onSelect: onSelectPropType,
    selectedIndex: selectedIndexPropType,
    selectedTabClassName: PropTypes.string,
    selectedTabPanelClassName: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = Tabs.copyPropsToState(this.props, {}, props.defaultFocus);
  }

  componentWillReceiveProps(newProps) {
    if (
      process.env.NODE_ENV !== 'production' &&
      Tabs.inUncontrolledMode(newProps) !== Tabs.inUncontrolledMode(this.props)
    ) {
      throw new Error(
        `Switching between controlled mode (by using \`selectedIndex\`) and uncontrolled mode is not supported in \`Tabs\`.
For more information about controlled and uncontrolled mode of react-tabs see the README.`,
      );
    }
    // Use a transactional update to prevent race conditions
    // when reading the state in copyPropsToState
    // See https://github.com/reactjs/react-tabs/issues/51
    this.setState(state => Tabs.copyPropsToState(newProps, state));
  }

  static inUncontrolledMode(props) {
    return props.selectedIndex === null;
  }

  handleSelected = (index, last, event) => {
    const { onSelect } = this.props;

    // Call change event handler
    if (typeof onSelect === 'function') {
      // Check if the change event handler cancels the tab change
      if (onSelect(index, last, event) === false) return;
    }

    const state = {
      // Set focus if the change was triggered from the keyboard
      focus: event.type === 'keydown',
    };

    if (Tabs.inUncontrolledMode(this.props)) {
      // Update selected index
      state.selectedIndex = index;
    }

    this.setState(state);
  };

  // preserve the existing selectedIndex from state.
  // If the state has not selectedIndex, default to the defaultIndex or 0
  static copyPropsToState(props, state, focus = false) {
    const newState = {
      focus,
    };

    if (Tabs.inUncontrolledMode(props)) {
      const maxTabIndex = getTabsCount(props.children) - 1;
      let selectedIndex = null;

      if (state.selectedIndex != null) {
        selectedIndex = Math.min(state.selectedIndex, maxTabIndex);
      } else {
        selectedIndex = props.defaultIndex || 0;
      }
      newState.selectedIndex = selectedIndex;
    }

    return newState;
  }

  render() {
    const { children, defaultIndex, defaultFocus, ...props } = this.props;
    const { focus, selectedIndex } = this.state;

    props.focus = focus;
    props.onSelect = this.handleSelected;

    if (selectedIndex != null) {
      props.selectedIndex = selectedIndex;
    }

    return <UncontrolledTabs {...props}>{children}</UncontrolledTabs>;
  }
}

Tabs.tabsRole = 'Tabs';
