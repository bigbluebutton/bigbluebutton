import React, { Component, PropTyes } from 'react';
import ReactDOM from 'react-dom';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import styles from './styles';
import SettingsModal from '../settings/SettingsModal';
import SessionMenu from '../settings/submenus/SessionMenu';
import Dropdown from './Dropdown';
import DropdownContent from './DropdownContent';
import DropdownTrigger from './DropdownTrigger';

export default class SettingsDropdown extends Component {

  constructor(props) {
    super(props);
    this.menus = [];
  }

  componentWillMount() {
    this.setState({ activeMenu: -1, focusMenu: 0, });
    this.menus.push({ className: '',
      props: { title: 'Fullscreen', prependIconName: 'icon-',
                icon: 'bbb-full-screen', }, tabIndex: 1, });
    this.menus.push({ className: SettingsModal,
      props: { title: 'Settings/Options', prependIconName: 'icon-',
                icon: 'bbb-more', }, tabIndex: 2, });
    this.menus.push({ className: SessionMenu,
      props: { title: 'Leave Session', prependIconName: 'icon-',
                icon: 'bbb-logout', }, tabIndex: 3, });
  }

  componentWillUpdate() {
    if (!this.refs.dropdown.state.isMenuOpen && this.state.activeMenu > 0) {
      this.setState({ activeMenu: -1, focusMenu: 0, });
    }
  }

  // call focus
  setFocus() {
    ReactDOM.findDOMNode(this.refs[`menu${this.state.focusMenu}`]).focus();
  }

  handleListKeyDown(event) {
    const pressedKey = event.keyCode;
    let menusLength = this.menus.length - 1;

    // tab
    if (pressedKey === 9) {
      let newIndex = 0;
      if (this.state.focusMenu >= menusLength) {
        newIndex = 0;
        this.refs.dropdown.hideMenu();
      } else {
        newIndex = this.state.focusMenu;
      }

      this.setState({ focusMenu: newIndex });
      return;
    }

    // Down key
    if (pressedKey === 40) {
      if (this.state.focusMenu >= menusLength) { // checks if at end of menu
        this.setState({ focusMenu: 0 },
           () => { this.setFocus(); });
      } else {
        this.setState({ focusMenu: this.state.focusMenu + 1 },
           () => { this.setFocus(); });
      }

      return;
    }

    // shift + tab
    if (event.shiftKey && pressedKey === 9) {
      let newIndex = 0;
      if (this.state.focusMenu <= 0) {
        newIndex = menusLength;
      } else {
        newIndex = this.state.focusMenu - 1;
      }

      this.setState({ focusMenu: newIndex });
      return;
    }

    // Up key
    if (pressedKey === 38) {
      if (this.state.focusMenu <= 0) { // checks if at end of menu
        this.setState({ focusMenu: menusLength },
           () => { this.setFocus(); });
      } else {
        this.setState({ focusMenu: this.state.focusMenu - 1 },
           () => { this.setFocus(); });
      }

      return;
    }

    // Enter and SpaceBar
    if (pressedKey === 13 || pressedKey === 32) {
      this.clickMenu(this.state.focusMenu);
      return;
    }

    //ESC
    if (pressedKey == 27) {
      this.setState({ activeMenu: -1, focusMenu: 0 });
      this.refs.dropdown.hideMenu();
    }

  }

  handleFocus(index) {
    this.setState({ focusMenu: index },
       () => { this.setFocus(); });
  }

  clickMenu(i) {
    this.setState({ activeMenu: i });
    this.refs.dropdown.hideMenu();
  }

  createMenu() {
    const curr = this.state.activeMenu;
    if (curr === 0) {
      console.log(this.menus[curr].props.title);
    }

    if (curr === 1) {
      return <SettingsModal />;
    }

    if (curr === 2) {
      return <SessionMenu />;
    }
  }

  openWithKey(event) {

    // keep focus is located at the first menu
    if (event.keyCode === 9) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.setState({ focusMenu: 0 }, () => { this.setFocus(); });
  }

  render() {
    const keyChange = this.openWithKey.bind(this);
    return (
      <div>
        <Dropdown ref='dropdown' menuFocus={keyChange}>
          <DropdownTrigger labelBtn='setting' iconBtn='more' />
          <DropdownContent ref='content'>
            <div className={styles.triangleOnDropdown}></div>
            <div className={styles.dropdown_active_content}>
                <p id="dropdownModal" className={styles.descModal}>Settings dropdown</p>
                <ul className={styles.menuList} role="menu">
                  {this.menus.map((value, index) => (
                    <li key={index} role='menuitem'
                      tabIndex={value.tabIndex}
                      onClick={this.clickMenu.bind(this, index)}
                      onKeyDown={this.handleListKeyDown.bind(this)}
                      onFocus={this.handleFocus.bind(this, index)}
                      ref={'menu' + index}
                      className={styles.settingsMenuItem}>
                      <Icon key={index} prependIconName={value.props.prependIconName}
                        iconName={value.props.icon} title={value.props.title}/>
                      <span className={styles.settingsMenuItemText}>{value.props.title}</span>
                      {index == '0' ? <hr /> : null}
                    </li>
                  ))}
                </ul>
            </div>
          </DropdownContent>
        </Dropdown>
        <div>{this.createMenu()}</div>
      </div>
    );
  }
}
