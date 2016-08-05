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
    this.submenus.push({ className: AudioMenu,
      props: { title: 'Audio', prependIconName: 'ion-', icon: 'ios-mic-outline', }, });
    this.submenus.push({ className: VideoMenu,
      props: { title: 'Video', prependIconName: 'ion-', icon: 'ios-videocam-outline', }, });
    this.submenus.push({ className: ApplicationMenu,
      props: { title: 'App', prependIconName: 'ion-', icon: 'ios-folder-outline', }, });
    this.submenus.push({ className: UsersMenu,
      props: { title: 'Participants', prependIconName: 'ion-', icon: 'person', }, });
  }

  componentDidMount() {
      return (<div onClick={this.openModal}></div>);
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
    this.setState({ activeSubmenu: i });
  }
  getContent() {
    return (
      <div style={{ clear: 'both' }}>
        <div className={styles.settingsMenuLeft}>
          <ul style={{ listStyleType: 'none' }}>
            {this.submenus.map((value, index) => (
              <li key={index} onClick={this.clickSubmenu.bind(this, index)}
                className={classNames(styles.settingsSubmenuItem,
                  index == this.state.activeSubmenu ? styles.settingsSubmenuItemActive : null)}>
                <Icon key={index} prependIconName={value.props.prependIconName}
                  iconName={value.props.icon} title={value.props.title}/>
                <span>{value.props.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.settingsMenuRight}>{this.createMenu()}</div>
      </div>
    );
  }
};

SettingsModal.defaultProps = { title: 'Settings' };
