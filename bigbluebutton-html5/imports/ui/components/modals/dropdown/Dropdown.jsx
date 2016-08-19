import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Button from '/imports/ui/components/button/component';
import Icon from '/imports/ui/components/icon/component';
import classNames from 'classnames';
import styles from './styles';
import DropdownTrigger from './DropdownTrigger';
import DropdownContent from './DropdownContent';

export default class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = { isMenuOpen: false, };
    this.showMenu = this.showMenu.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
  }

  showMenu(event) {
    this.setState({ isMenuOpen: true, });
    let pressedKey = event.keyCode;

    if (pressedKey === 9 || pressedKey == 40) {
      this.props.menuFocus(event);
    }
  }

  hideMenu() {
    this.setState({ isMenuOpen: false, });
  }

  componentDidMount () {
    const { addEventListener } = window;
    addEventListener('click', this.onWindowClick.bind(this), false);
  }

  componentWillUnmount () {
    const { removeEventListener } = window;
    removeEventListener('click', this.onWindowClick.bind(this), false);
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
    const toggleMenu = this.toggle.bind(this);

    // stick callback on trigger element
    const boundChildren = React.Children.map(this.props.children, (child) => {
      if (child.type === DropdownTrigger) {
        child = React.cloneElement(child, {
          toggleMenu: toggleMenu,
        });
      }

      return child;
    });

    let trigger = boundChildren[0];
    let content = boundChildren[1];

    return (
      <div className={styles.dropdown}>
        {trigger}
        { this.state.isMenuOpen ?
          content : null }
      </div>
    );
  }
}
