import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import styles from '../styles';
import DropdownTrigger from '../dropdown-trigger/component';

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { isMenuOpen: false, };
    this.showMenu = this.showMenu.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onWindowClick = this.onWindowClick.bind(this);
  }

  showMenu(event) {
    let pressedKey = event.keyCode;
    this.setState({ isMenuOpen: true, });

    // User pressed tab
    if (pressedKey === 9) {
      this.hideMenu();
    }

    // User pressed down arrow or enter or space
    if (pressedKey === 40 || pressedKey === 13 || pressedKey === 32) {
      this.props.focusMenu(event);
    }
  }

  hideMenu() {
    this.setState({ isMenuOpen: false, });
  }

  componentDidMount () {
    const { addEventListener } = window;
    addEventListener('click', this.onWindowClick, false);
  }

  componentWillUnmount () {
    const { removeEventListener } = window;
    removeEventListener('click', this.onWindowClick, false);
  }

  onWindowClick(event) {
    const dropdownElement = findDOMNode(this);
    const shouldUpdateState = event.target !== dropdownElement &&
                                !dropdownElement.contains(event.target) &&
                                  this.state.isMenuOpen;

    if (shouldUpdateState) {
      this.hideMenu();
    }
  }

  toggle(event) {
    if (this.state.isMenuOpen) {
      this.hideMenu();
    } else {
      this.showMenu(event);
    }
  }

  render() {
    const toggle = this.toggle;

    // stick callback on trigger element
    const boundChildren = React.Children.map(this.props.children, (child) => {
      if (child.type === DropdownTrigger) {
        child = React.cloneElement(child, {
          toggle: toggle,
        });
      }

      return child;
    });

    let trigger = boundChildren[0];
    let content = boundChildren[1];

    return (
      <div className={styles.dropdown}>
        {trigger}
        {this.state.isMenuOpen ?
          content : null}
      </div>
    );
  }
}
