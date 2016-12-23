import React from 'react';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/component';
import AudioMenu from './submenus/audio/component';
import VideoMenu from './submenus/video/component';
import ApplicationMenu from './submenus/application/component';
import UsersMenu from './submenus/users/component';
import ClosedCaptionsMenuContainer from './submenus/closed-captions/container';
import classNames from 'classnames';
import ReactDOM from 'react-dom';
import styles from './styles.scss';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.submenus = [];
    this.state = { activeSubmenu: 0, focusSubmenu: 0 };
  }

  renderSettingOptions() {
    const { isPresenter, role } = this.props;

    this.submenus = [];
    this.submenus.push(
      { componentName: AudioMenu, tabIndex: 3,
        props: { title: 'Audio', prependIconName: 'icon-', icon: 'bbb-audio', }, },
      { componentName: VideoMenu, tabIndex: 4,
        props: { title: 'Video', prependIconName: 'icon-', icon: 'bbb-video', }, },
      { componentName: ApplicationMenu, tabIndex: 5,
        props: { title: 'Application', prependIconName: 'icon-', icon: 'bbb-application', }, },
      { componentName: ClosedCaptionsMenuContainer, tabIndex: 7,
        props: { title: 'Closed Captions', prependIconName: 'icon-', icon: 'bbb-user', }, });

    if (isPresenter || role === 'MODERATOR') {
      this.submenus.push(
        { componentName: UsersMenu, tabIndex: 6,
          props: { title: 'Participants', prependIconName: 'icon-', icon: 'bbb-user', }, });
    }

    return (
      <div className={styles.full} role='presentation'>
        <div className={styles.settingsMenuLeft}>
          <ul className={styles.settingsSubmenu} role='menu'>
            {this.submenus.map((value, index) => (
              <li key={index} ref={'submenu' + index} role='menuitem' tabIndex={value.tabIndex}
                onClick={this.handleClickSubmenu.bind(this, index)}
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
          {this.renderMenu()}
        </div>
      </div>
    );
  }

  renderMenu() {
    let curr = this.state.activeSubmenu === undefined ? 0 : this.state.activeSubmenu;

    if (!this.submenus[curr]) {
      curr = (this.state.activeSubmenu - 1);
    }

    let props = {
      title: this.submenus[curr].props.title,
      prependIconName: this.submenus[curr].props.prependIconName,
      icon: this.submenus[curr].props.icon,
      handleIncreaseFontSize: this.props.handleIncreaseFontSize,
      handleDecreaseFontSize: this.props.handleDecreaseFontSize,
      handleGetFontSizeName: this.props.handleGetFontSizeName,
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
  handleClickSubmenu(i) {
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

  render() {

    return (
      <Modal
        title="Settings"
        confirm={{
          callback: (() => {
            this.setState({ activeSubmenu: 0, focusSubmenu: 0 });
            console.log('SHOULD APPLY SETTINGS CHANGES');
            this.props.handleSaveFontState();
          }),
          label: 'Save',
          description: 'Saves the changes and close the settings menu',
        }}
        dismiss={{
          callback: (() => {
            this.setState({ activeSubmenu: 0, focusSubmenu: 0 });
            console.log('SHOULD DISCART SETTINGS CHANGES');
            this.props.handleRevertFontState();
          }),
          label: 'Cancel',
          description: 'Discart the changes and close the settings menu',
        }}>
          {this.renderSettingOptions()}
      </Modal>
    );
  }
};

Settings.defaultProps = { title: 'Settings' };
