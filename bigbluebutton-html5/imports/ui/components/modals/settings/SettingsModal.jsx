import React from 'react';
import Modal from 'react-modal';
import {Icon} from '/imports/ui/components/shared/Icon.jsx';
import {Button} from '/imports/ui/components/shared/Button.jsx';
import BaseModal from '../BaseModal.jsx';
import AudioMenu from './submenus/AudioMenu.jsx';
import VideoMenu from './submenus/VideoMenu.jsx';
import ApplicationMenu from './submenus/ApplicationMenu.jsx';
import UsersMenu from './submenus/UsersMenu.jsx';
import SessionMenu from './submenus/SessionMenu.jsx';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

export default class SettingsModal extends BaseModal {
  constructor(props) {
    super(props);
    this.submenus = [];
  }

  componentWillMount() {
    this.setState({ activeSubmenu: 0 });
    this.submenus.push({ className: AudioMenu,
      props: { title: 'Audio', prependIconName: 'ion-', icon: 'ios-mic-outline', }, });
    this.submenus.push({ className: VideoMenu,
      props: { title: 'Video', prependIconName: 'ion-', icon: 'ios-videocam-outline', }, });
    this.submenus.push({ className: ApplicationMenu,
      props: { title: 'App', prependIconName: 'ion-', icon: 'ios-folder-outline', }, });
    this.submenus.push({ className: UsersMenu,
      props: { title: 'Participants', prependIconName: 'ion-', icon: 'person', }, });
    this.submenus.push({ className: SessionMenu,
      props: { title: 'Session', prependIconName: 'ion-', icon: 'android-exit', }, });
  }

  componentDidMount() {
    ReactDOM.render(
      <Button componentClass='span' onClick={this.refs['settingsModal'].openModal} className='btn settingsIcon navbarButton' i_class='icon ion-gear-b' rel='tooltip' title='Settings'>
        <Icon iconName='icon ion-gear-b' className='mediumFont icon ion-gear-b'/>
      </Button>, document.getElementById('settingsButtonPlaceHolder'));
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

  openModal() {
    super.openModal();
  }

  closeModal() {
    super.closeModal();
  }

  afterOpenModal() {
    super.afterOpenModal();
  }

  handleModalCloseRequest() {
    super.handleModalCloseRequest();
  }

  clickSubmenu(i) {
    this.setState({ activeSubmenu: i });
  }

  getContent() {
    return (
      <div>
        <div className="settingsMenuLeft">
          <ul style={{ listStyleType: 'none' }}>
            {this.submenus.map((value, index) => (
              <li key={index} onClick={this.clickSubmenu.bind(this, index)}
                className={classNames('settingsSubmenuItem',
                  { settingsSubmenuItemActive: index == this.state.activeSubmenu })}>
                <Icon key={index} prependIconName={value.props.prependIconName}
                  iconName={value.props.icon} title={value.props.title}/>
                <span> - {value.props.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="settingsMenuRight">{this.createMenu()}</div>
      </div>
    );
  }
};
