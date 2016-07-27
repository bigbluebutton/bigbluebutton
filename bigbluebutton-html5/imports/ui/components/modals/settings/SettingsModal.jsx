import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import BaseModal from '../BaseModal';
import AudioMenu from './submenus/AudioMenu';
import VideoMenu from './submenus/VideoMenu';
import ApplicationMenu from './submenus/ApplicationMenu';
import UsersMenu from './submenus/UsersMenu';
import SessionMenu from './submenus/SessionMenu';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import styles from './styles';

export default class SettingsModal extends BaseModal {
  constructor(props) {
    super(props);
    this.submenus = [];
  }

  componentWillMount() {
    this.setState({ activeSubmenu: 0 });
    this.setState({ focusSubmenu: 0 });
    this.submenus.push({ className: AudioMenu,
      props: { title: 'Audio', prependIconName: 'icon-', icon: 'bbb-audio', }, tabIndex: 3, });
    this.submenus.push({ className: VideoMenu,
      props: { title: 'Video', prependIconName: 'icon-', icon: 'bbb-video', }, tabIndex: 4, });
    this.submenus.push({ className: ApplicationMenu,
      props: { title: 'Application', prependIconName: 'icon-', icon: 'bbb-application', }, tabIndex: 5, });
    this.submenus.push({ className: UsersMenu,
      props: { title: 'Participants', prependIconName: 'icon-', icon: 'bbb-user', }, tabIndex: 6, });
    this.submenus.push({ className: SessionMenu,
      props: { title: 'Leave session', prependIconName: 'icon-', icon: 'bbb-logout', }, tabIndex: 7, });
  }

  componentDidMount() {
    ReactDOM.render(
      <Button style={{ transform: 'rotate(90deg)' }}
        onClick={this.openModal}
        icon={'more'}
        ghost={true}
        circle={true}
        hideLabel={true}
        label={'Settings'}
        aria-haspopup={'true'}
        aria-labelledby={'settingsLabel'}
        aria-describedby={'settingsDesc'}
      />
    , document.getElementById('settingsButtonPlaceHolder'));
  }

  createMenu() {
    const curr = this.state.activeSubmenu === undefined ? 0 : this.state.activeSubmenu;

    let props = {
      title: this.submenus[curr].props.title,
      prependIconName: this.submenus[curr].props.prependIconName,
      icon: this.submenus[curr].props.icon,
    };

    const Submenu = this.submenus[curr].className;
    return <Submenu {...props}/>;
  }

  clickSubmenu(i) {
    if (i <= 0) {
      this.setState({ activeSubmenu: 0 });
      this.setState({ focusSubmenu: 0 });
      return;
    }
    if (i >= this.submenus.length) {
      this.setState({ activeSubmenu: this.submenus.length - 1});
      this.setState({ focusSubmenu: this.submenus.length - 1});
      return;
    } else {
      this.setState({ activeSubmenu: i });
      this.setState({ focusSubmenu: i });
    }
  }

  handleKeyDown(index, value, event, unknown, target) {
    // tab
    if (event.keyCode =='9') {
      if (this.state.focusSubmenu >= this.submenus.length - 1) { // if at end of menu and tab is pressed, keep focus at end of menu
        this.setState({ focusSubmenu: this.submenus.length - 1 });
      }
      else {
        this.setState({ focusSubmenu: this.state.focusSubmenu + 1 });
      }
    }

    // shift+tab keyCode 16
    // if (event.keyCode == '16') {
    //
    // }

    // up arrow
    if (event.keyCode == '38') {
      if (this.state.focusSubmenu <= 0) { // checks if at beginning of menu
        this.setState({ focusSubmenu: this.submenus.length - 1 }, function() {
          ReactDOM.findDOMNode(this.refs[`submenu${this.state.focusSubmenu}`]).focus();
        }); // sets to end of menu
      } else {
        this.setState({ focusSubmenu: this.state.focusSubmenu - 1 }, function() {
          ReactDOM.findDOMNode(this.refs[`submenu${this.state.focusSubmenu}`]).focus();
        });
      }
    }

    // down arrow
    if (event.keyCode == '40') {
      if (this.state.focusSubmenu >= this.submenus.length - 1) { // checks if at end of menu
        this.setState({ focusSubmenu: 0 }, function() {
          ReactDOM.findDOMNode(this.refs[`submenu${this.state.focusSubmenu}`]).focus();
         }); // sets to beginning of menu
      } else {
        this.setState({ focusSubmenu: this.state.focusSubmenu + 1 }, function() {
          ReactDOM.findDOMNode(this.refs[`submenu${this.state.focusSubmenu}`]).focus();
        });
      }
    }

    //  spacebar or enter
    if (event.keyCode == '32' || event.keyCode == '13') {
      this.setState({ activeSubmenu: this.state.focusSubmenu });
    }

  }

  getContent() {
    return (
      <div style={{ clear: 'both', height: '100%' }} role='presentation'>
        <div className={styles.settingsMenuLeft}>
          <ul style={{ listStyleType: 'none', paddingLeft: '0px' }} role='menu'>
            {this.submenus.map((value, index) => (
              <li key={index} onClick={this.clickSubmenu.bind(this, index)} ref={"submenu" + index}
              tabIndex={value.tabIndex} role='menuitem' onKeyDown={this.handleKeyDown.bind(this, index, value)}
                className={classNames(styles.settingsSubmenuItem,
                  index == this.state.activeSubmenu ? styles.settingsSubmenuItemActive : null)}>
                <Icon key={index} prependIconName={value.props.prependIconName}
                  iconName={value.props.icon} title={value.props.title}/>
                <span className={styles.settingsSubmenuItemText}>{value.props.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.settingsMenuRight} role='presentation'>
          {this.createMenu()}
        </div>
      </div>
    );
  }
};

SettingsModal.defaultProps = { title: 'Settings' };
