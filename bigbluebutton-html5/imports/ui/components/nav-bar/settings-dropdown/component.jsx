import React, { Component, PropTyes } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import styles from './styles';

import { showModal } from '/imports/ui/components/app/service';
import LogoutConfirmation from '/imports/ui/components/logout-confirmation/component';
import Settings from '/imports/ui/components/settings/component';

import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';

export default class SettingsDropdown extends Component {
  constructor(props) {
    super(props);
    this.menus = [
      {
        callback: (() => { console.log('SHOULD ENTER FULLSCREEN MODE'); }),
        props: {
          title: 'Fullscreen',
          icon: 'full-screen',
          ariaLabelleby: 'fullscreenLabel',
          ariaDescribedby: 'fullscreenDesc',
        },
        tabIndex: 1,
      },
      {
        callback: (() => { showModal(<Settings />); }),
        props: {
          title: 'Settings',
          icon: 'more',
          ariaLabelleby: 'settingsLabel',
          ariaDescribedby: 'settingsDesc',
        },
        tabIndex: 2,
      },
      {
        callback: (() => { showModal(<LogoutConfirmation />); }),
        props: {
          title: 'Leave Session',
          icon: 'logout',
          ariaLabelleby: 'leaveSessionLabel',
          ariaDescribedby: 'leaveSessionDesc',
        },
        tabIndex: 3,
      },
    ];
    this.openWithKey = this.openWithKey.bind(this);
  }

  componentWillMount() {
    this.setState({ activeMenu: -1, focusedMenu: 0, });
  }

  componentWillUpdate() {
    const DROPDOWN = this.refs.dropdown;
    if (DROPDOWN.state.isMenuOpen && this.state.activeMenu >= 0) {
      this.setState({ activeMenu: -1, focusedMenu: 0, });
    }
  }

  setFocus() {
    ReactDOM.findDOMNode(this.refs[`menu${this.state.focusedMenu}`]).focus();
  }

  handleListKeyDown(event) {
    const pressedKey = event.keyCode;
    let numOfMenus = this.menus.length - 1;

    // User pressed tab
    if (pressedKey === 9) {
      let newIndex = 0;
      if (this.state.focusedMenu >= numOfMenus) { // Checks if at end of menu
        newIndex = 0;
        if (!event.shiftKey) {
          this.refs.dropdown.handleHide(); // FIXME: We should not use internal functions by ref
        }
      } else {
        newIndex = this.state.focusedMenu;
      }

      this.setState({ focusedMenu: newIndex, });
      return;
    }

    // User pressed shift + tab
    if (event.shiftKey && pressedKey === 9) {
      let newIndex = 0;
      if (this.state.focusedMenu <= 0) { // Checks if at beginning of menu
        newIndex = numOfMenus;
      } else {
        newIndex = this.state.focusedMenu - 1;
      }

      this.setState({ focusedMenu: newIndex, });
      return;
    }

    // User pressed up key
    if (pressedKey === 38) {
      if (this.state.focusedMenu <= 0) { // Checks if at beginning of menu
        this.setState({ focusedMenu: numOfMenus, },
           () => { this.setFocus(); });
      } else {
        this.setState({ focusedMenu: this.state.focusedMenu - 1, },
           () => { this.setFocus(); });
      }

      return;
    }

    // User pressed down key
    if (pressedKey === 40) {
      if (this.state.focusedMenu >= numOfMenus) { // Checks if at end of menu
        this.setState({ focusedMenu: 0, },
           () => { this.setFocus(); });
      } else {
        this.setState({ focusedMenu: this.state.focusedMenu + 1, },
           () => { this.setFocus(); });
      }

      return;
    }

    // User pressed enter and spaceBar
    if (pressedKey === 13 || pressedKey === 32) {
      this.clickMenu(this.state.focusedMenu);
      return;
    }

    //User pressed ESC
    if (pressedKey == 27) {
      this.setState({ activeMenu: -1, focusedMenu: 0, });
      this.refs.dropdown.handleHide(); // FIXME: We should not use internal functions by ref
    }

    return;
  }

  handleFocus(index) {
    this.setState({ focusedMenu: index, },
       () => { this.setFocus(); });
  }

  clickMenu(i) {
    this.setState({ activeMenu: i, });
    this.refs.dropdown.handleHide(); // FIXME: We should not use internal functions by ref
    this.menus[i].callback();
  }

  openWithKey(event) {
    // Focus first menu option
    if (event.keyCode === 9) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.setState({ focusedMenu: 0 }, () => { this.setFocus(); });
  }

  renderAriaLabelsDescs() {
    return (
      <div>

        {/* aria-labelledby */}
        <p id="fullscreenLabel" hidden>
        <FormattedMessage
          id="app.dropdown.fullscreenLabel"
          description="Aria label for fullscreen"
          defaultMessage="Make fullscreen"
        />
        </p>
        <p id="settingsLabel" hidden>
          <FormattedMessage
            id="app.dropdown.settingsLabel"
            description="Aria label for settings"
            defaultMessage="Open Settings"
          />
        </p>
        <p id="leaveSessionLabel" hidden>
          <FormattedMessage
            id="app.dropdown.leaveSessionLabel"
            description="Aria label for logout"
            defaultMessage="Logout"
          />
        </p>

        {/* aria-describedby */}
        <p id="fullscreenDesc" hidden>
        <FormattedMessage
          id="app.dropdown.fullscreenDesc"
          description="Aria label for fullscreen"
          defaultMessage="Make the settings menu fullscreen"
        />
        </p>
        <p id="settingsDesc" hidden>
          <FormattedMessage
            id="app.dropdown.settingsDesc"
            description="Aria label for settings"
            defaultMessage="Change the general settings"
          />
        </p>
        <p id="leaveSessionDesc" hidden>
          <FormattedMessage
            id="app.dropdown.leaveSessionDesc"
            description="Aria label for logout"
            defaultMessage="Leave the meeting"
          />
        </p>
      </div>
    );

  }

  render() {
    return (
      <Dropdown ref="dropdown">
        <DropdownTrigger>
          <Button
            role="button"
            label="Settings"
            icon="more"
            ghost={true}
            circle={true}
            hideLabel={true}
          />
        </DropdownTrigger>
        <DropdownContent>
          <div className={styles.triangleOnDropdown}></div>
          <div className={styles.dropdownActiveContent}>
            <ul className={styles.menuList} role="menu">
              {this.menus.map((value, index) => (
                <li
                  key={index}
                  role='menuitem'
                  tabIndex={value.tabIndex}
                  onClick={this.clickMenu.bind(this, index)}
                  onKeyDown={this.handleListKeyDown.bind(this)}
                  onFocus={this.handleFocus.bind(this, index)}
                  ref={'menu' + index}
                  className={styles.settingsMenuItem}
                  aria-labelledby={value.props.ariaLabelleby}
                  aria-describedby={value.props.ariaDescribedby}>

                  <Icon
                    key={index}
                    prependIconName={value.props.prependIconName}
                    iconName={value.props.icon}
                    title={value.props.title}
                    className={styles.iconColor}/>

                  <span className={styles.settingsMenuItemText}>{value.props.title}</span>
                  {index == '0' ? <hr className={styles.hrDropdown}/> : null}
                </li>
              ))}
            </ul>
            {this.renderAriaLabelsDescs()}
          </div>
        </DropdownContent>
      </Dropdown>
    );
  }
}
