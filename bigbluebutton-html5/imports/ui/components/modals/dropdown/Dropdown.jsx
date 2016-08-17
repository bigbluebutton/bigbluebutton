import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import Icon from '/imports/ui/components/icon/component';
import cx from 'classnames';
import styles from './styles';
import DropdownContent from './DropdownContent';
import DropdownTrigger from './DropdownTrigger';

export default class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = { isMenuOpen: false, };
    this.showMenu = this.showMenu.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
  }

  showMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen, });

  }

  hideMenu() {
    this.setState({ isMenuOpen: false, });
  }

  componentDidMount () {
    const { addEventListener } = window;
    addEventListener( 'click', this.onWindowClick.bind(this), false );
  }

  componentWillUnmount () {
    const { removeEventListener } = window;
    removeEventListener( 'click', this.onWindowClick.bind(this), false );
  }

  onWindowClick(event) {
    const dropdown_element = findDOMNode(this);
    const shouldUpdateState = event.target !== dropdown_element &&
                              !dropdown_element.contains(event.target) &&
                              this.state.isMenuOpen;

    if(shouldUpdateState) {
      this.hideMenu();
    }
  }

  toggle() {
    if(this.state.isMenuOpen) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }

  render() {
    const toggleMenu = this.toggle.bind(this);

    // // stick callback on trigger element
    const boundChildren = React.Children.map( this.props.children, (child) => {
      if( child.type === DropdownTrigger ){
        child = React.cloneElement( child, {
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
          content : null}
      </div>
    );
  }
}
