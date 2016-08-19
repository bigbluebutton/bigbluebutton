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
    /* activeSubmenu represents the submenu in the submenus array to be displayed to the user,
     * initialized to 0
     */
    this.setState({ activeSubmenu: 0 });
    /* focusSubmenu represents the submenu in the submenus array which currently has focus,
     * initialized to 0
     */
    this.setState({ focusSubmenu: 0 });
    this.submenus.push({ componentName: AudioMenu, tabIndex: 3,
      props: { title: 'Audio', prependIconName: 'icon-', icon: 'bbb-audio', }, });
    this.submenus.push({ componentName: VideoMenu, tabIndex: 4,
      props: { title: 'Video', prependIconName: 'icon-', icon: 'bbb-video', }, });
    this.submenus.push({ componentName: ApplicationMenu, tabIndex: 5,
      props: { title: 'Application', prependIconName: 'icon-', icon: 'bbb-application', }, });
    this.submenus.push({ componentName: UsersMenu, tabIndex: 6,
      props: { title: 'Participants', prependIconName: 'icon-', icon: 'bbb-user', }, });
    this.submenus.push({ componentName: SessionMenu, tabIndex: 7,
      props: { title: 'Leave session', prependIconName: 'icon-', icon: 'bbb-logout', }, });
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
      />, document.getElementById('settingsButtonPlaceHolder'));
  }

  createMenu() {
    const curr = this.state.activeSubmenu === undefined ? 0 : this.state.activeSubmenu;

    let props = {
      title: this.submenus[curr].props.title,
      prependIconName: this.submenus[curr].props.prependIconName,
      icon: this.submenus[curr].props.icon,
    };

    const Submenu = this.submenus[curr].componentName;
    return <Submenu {...props}/>;
  }

  /* When an option in the menu is clicked, set the activeSubmenu and focusSubmenu
   * to the value of index. If clicked out of bounds set to 0 or end of submenus array accordingly.
   *
   * activeSubmenu: the submenu to be displayed to the user
   * focusSubmenu: the submenu to set focus to
   */
  clickSubmenu(i) {
    if (i <= 0) {
      this.setState({ activeSubmenu: 0, focusSubmenu: 0, });
      return;
    }

    if (i >= this.submenus.length) {
      this.setState({ activeSubmenu: this.submenus.length - 1,
        focusSubmenu: this.submenus.length - 1, });
      return;
    } else {
      this.setState({ activeSubmenu: i, focusSubmenu: i, });
    }
  }

  /* calls the focus method on an object in the submenu */
  setFocus() {
    ReactDOM.findDOMNode(this.refs[`submenu${this.state.focusSubmenu}`]).focus();
  }

  /* Checks for key presses within the submenu list. Key behaviour varies.
   *
   * Tab: changes focus to next submenu or element outside of menu
   * Shift+Tab: changes focus to previous submenu or element outside of menu
   * Up Arrow: changes focus to previous submenu, can cycle through menu
   * Down Arrow: changes focus to next submenu, can cycle through menu
   * Spacebar: selects submenu in focus and sets as active
   * Enter: selects submenu in focus and sets as active
   */
  handleKeyDown(event) {
    // tab
    if (event.keyCode === 9) {
      let newIndex = 0;
      if (this.state.focusSubmenu >= this.submenus.length - 1) {
        newIndex = this.submenus.length - 1;
      } else {
        newIndex = this.state.focusSubmenu + 1;
      }

      this.setState({ focusSubmenu: newIndex });
      return;
    }

    // shift+tab
    if (event.shiftKey && event.keyCode === 9) {
      let newIndex = 0;
      if (this.state.focusSubmenu <= 0) {
        newIndex = 0;
      } else {
        newIndex = this.state.focusSubmenu - 1;
      }

      this.setState({ focusSubmenu: newIndex });
      return;
    }

    // up arrow
    if (event.keyCode === 38) {
      if (this.state.focusSubmenu <= 0) {
        this.setState({ focusSubmenu: this.submenus.length - 1 }, function () {
          this.setFocus();
        });
      } else {
        this.setState({ focusSubmenu: this.state.focusSubmenu - 1 }, function () {
          this.setFocus();
        });
      }

      return;
    }

    // down arrow
    if (event.keyCode === 40) {
      if (this.state.focusSubmenu >= this.submenus.length - 1) {
        this.setState({ focusSubmenu: 0 }, function () {
          this.setFocus();
        });
      } else {
        this.setState({ focusSubmenu: this.state.focusSubmenu + 1 }, function () {
          this.setFocus();
        });
      }

      return;
    }

    // spacebar or enter
    if (event.keyCode === 32 || event.keyCode === 13) {
      this.setState({ activeSubmenu: this.state.focusSubmenu });
      return;
    }
  }

  /* Keeps the focusSubmenu variable at the correct value when
   * tabbing or shift-tabbing out of the submenu array
   */
  handleFocus(index) {
    this.setState({ focusSubmenu: index });
  }

  getContent() {
    return (
      <div style={{ clear: 'both', height: '100%' }} role='presentation'>
        <div className={styles.settingsMenuLeft}>
          <ul style={{ listStyleType: 'none', paddingLeft: '0px' }} role='menu'>
            {this.submenus.map((value, index) => (
              <li key={index} ref={'submenu' + index} role='menuitem' tabIndex={value.tabIndex}
                onClick={this.clickSubmenu.bind(this, index)}
                onKeyDown={this.handleKeyDown.bind(this)}
                onFocus={this.handleFocus.bind(this, index)}
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
