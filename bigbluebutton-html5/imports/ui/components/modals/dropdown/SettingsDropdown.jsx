import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import styles from './styles';
import SettingsModal from '../settings/SettingsModal';
import SessionMenu from '../settings/submenus/SessionMenu';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  content: {
    position: 'absolute',
    top: '5%',
    left: '83%',
    right: '10%',
    bottom: 'auto',
    background: '#ffffff',
    border: '1px solid #ffffff',
    transform: 'translate(5%, 5%)',
  },
};

export default class SettingsDropdown extends Component {

  constructor(props) {
    super(props);
    this.state = { isMenuOpen: false, };
    this.menus = [];
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
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

  componentDidMount() {
    ReactDOM.render(
      <div>
        <p id="settingButton" className={styles.descModal}>Setting Menu</p>
        <Button
          style={{ transform: 'rotate(90deg)' }}
          onClick={this.openMenu}
          onKeyDown={this.openMenu}
          icon={'more'}
          role='button'
          ghost={true}
          circle={true}
          hideLabel={true}
          label={'Settings'}
          aria-haspopup={'true'}
          aria-labelledby={'settingButton'}
          aria-describedby={'settingButton'}
          />
      </div>, document.getElementById('settingsButtonPlaceHolder'));
  }

  // when dropdown is closed, set activeMenu to -1
  // if I don't, the focus is fixed at the last choice.
  componentWillUpdate() {
    if (!this.state.isMenuOpen) {
      this.setState({ activeMenu: -1, focusMenu: 0, });
    }
  }

  handleListKeyDown(event) {
    let code = event.keyCode;
    let menusLength = this.menus.length - 1;

    // tab
    if (code === 9) {
      let newIndex = 0;
      if (this.state.focusMenu >= menusLength) {
        // this.setState({ focusMenu: this.state.focusMenu - menusLength });
        newIndex = menusLength;
      } else {
        // this.setState({ focusMenu: this.state.focusMenu + 1 });
        newIndex = this.state.focusMenu + 1;
      }

      this.setState({ focusMenu: newIndex });
      return;
    }

    // shift + tab
    if (event.shiftKey && code === 9) {
      let newIndex = 0;
      if (this.state.focusMenu <= 0) {
        newIndex = 0;
      } else {
        newIndex = this.state.focusMenu - 1;
      }

      this.setState({ focusMenu: newIndex });
      return;
    }

    // Up key
    if (code === 38) {
      if (this.state.focusMenu <= 0) { // checks if at end of menu
        this.setState({ focusMenu: menusLength },
           function () { ReactDOM.findDOMNode(this.refs[`menu${this.state.focusMenu}`]).focus();
         });
      } else {
        this.setState({ focusMenu: this.state.focusMenu - 1 },
           function () { ReactDOM.findDOMNode(this.refs[`menu${this.state.focusMenu}`]).focus(); });
      }

      return;
    }

    // Down key
    if (code === 40) {
      if (this.state.focusMenu >= menusLength) { // checks if at end of menu
        this.setState({ focusMenu: 0 },
           function () { ReactDOM.findDOMNode(this.refs[`menu${this.state.focusMenu}`]).focus();
         });
      } else {
        this.setState({ focusMenu: this.state.focusMenu + 1 },
           function () { ReactDOM.findDOMNode(this.refs[`menu${this.state.focusMenu}`]).focus(); });
      }

      return;
    }

    // Enter and SpaceBar
    if (code === 13 || code === 32) {
      this.clickMenu(this.state.focusMenu);
      return;
    }
  }

  handleFocus(index) {
    this.setState({ focusMenu: index });
  }

  clickMenu(i) {

    if (i < 0) {
      this.setState({ activeMenu: -1, focusMenu: 0, });
    }

    if (i >= this.menus.length) {
      this.setState({ activeMenu: this.menus.length - 1,
          focusMenu: this.menus.length - 1, });
    } else {
      this.setState({ activeMenu: i, focusMenu: i, });
    }

    this.closeMenu();
  }

  createMenu() {
    const curr = this.state.activeMenu;

    if (curr == 0) {
      return console.log('full screen trigger');
    }

    if (curr == 1) {
      return <SettingsModal />;
    }

    if (curr == 2) {
      return <SessionMenu />;
    }
  }

  openMenu(event) {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });

    if (event.keyCode == 13 || event.keyCode == 40) {
      this.setState({ focusMenu: 0 },
         function () { ReactDOM.findDOMNode(this.refs[`menu${this.state.focusMenu}`]).focus(); });
    }
  }

  closeMenu() {
    this.setState({ isMenuOpen: false });
  }

  render() {
    return (
      <div style={{ clear: 'both', height: '100%' }} role='presentation'>
        <p id="dropdownModal" className={styles.descModal}>Setting dropdown</p>
        <Modal isOpen={this.state.isMenuOpen}
              onRequestClose={this.closeMenu}
              style={customStyles}
              className={styles.settingsMenuLeft}
              role="Settingmenu"
              aria-labelledby="dropdownModal"
              aria-describedby="dropdownModal">
              <ul style={{ listStyleType: 'none', paddingLeft: '0px' }} role="menu">
                {this.menus.map((value, index) => (
                  <li key={index} role='menuitem'
                    tabIndex={value.tabIndex}
                    ref={'menu' + index}
                    onClick={this.clickMenu.bind(this, index)}
                    onKeyDown={this.handleListKeyDown.bind(this)}
                    onFocus={this.handleFocus.bind(this, index)}
                    aria-hidden={this.state.isMenuOpen ? true : false}
                    className={styles.settingsMenuItem}>
                    <Icon key={index} prependIconName={value.props.prependIconName}
                      iconName={value.props.icon} title={value.props.title}/>
                    <span className={styles.settingsMenuItemText}>{value.props.title}</span>
                    {index == '0' ? <hr /> : null}
                  </li>
                ))}
              </ul>
        </Modal>
        <div role='presentation'>{this.createMenu()}</div>
      </div>
    );
  }
}
