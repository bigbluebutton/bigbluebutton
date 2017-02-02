import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import styles from '../styles';

import { showModal } from '/imports/ui/components/app/service';
import LogoutConfirmation from '/imports/ui/components/logout-confirmation/component';
import AboutContainer from '/imports/ui/components/about/container';
import SettingsMenuContainer from '/imports/ui/components/settings/container';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.navBar.settingsDropdown.optionsLabel',
    defaultMessage: 'Options',
  },
  fullscreenLabel: {
    id: 'app.navBar.settingsDropdown.fullscreenLabel',
    defaultMessage: 'Make fullscreen',
  },
  settingsLabel: {
    id: 'app.navBar.settingsDropdown.settingsLabel',
    defaultMessage: 'Open settings',
  },
  aboutLabel: {
    id: 'app.navBar.settingsDropdown.aboutLabel',
    defaultMessage: 'About',
  },
  aboutDesc: {
    id: 'app.navBar.settingsDropdown.aboutDesc',
    defaultMessage: 'About',
  },
  leaveSessionLabel: {
    id: 'app.navBar.settingsDropdown.leaveSessionLabel',
    defaultMessage: 'Logout',
  },
  fullscreenDesc: {
    id: 'app.navBar.settingsDropdown.fullscreenDesc',
    defaultMessage: 'Make the settings menu fullscreen',
  },
  settingsDesc: {
    id: 'app.navBar.settingsDropdown.settingsDesc',
    defaultMessage: 'Change the general settings',
  },
  leaveSessionDesc: {
    id: 'app.navBar.settingsDropdown.leaveSessionDesc',
    defaultMessage: 'Leave the meeting',
  },
});

const toggleFullScreen = () => {
  let element = document.documentElement;

  if (document.fullscreenEnabled
    || document.mozFullScreenEnabled
    || document.webkitFullscreenEnabled) {

    // If the page is already fullscreen, exit fullscreen
    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {

      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }

    // If the page is not currently fullscreen, make fullscreen
    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  }
};

const openSettings = () => showModal(<SettingsMenuContainer  />);

const openAbout = () => showModal(<AboutContainer />);

const openLogoutConfirmation = () => showModal(<LogoutConfirmation />);

class SettingsDropdown extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { intl } = this.props;
    return (
      <Dropdown ref="dropdown">
        <DropdownTrigger>
          <Button
            label={intl.formatMessage(intlMessages.optionsLabel)}
            icon="more"
            ghost={true}
            circle={true}
            hideLabel={true}
            className={cx(styles.btn, styles.btnSettings)}

            // FIXME: Without onClick react proptypes keep warning
            // even after the DropdownTrigger inject an onClick handler
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="bottom right">
          <DropdownList>
            <DropdownListItem
              icon="fullscreen"
              label={intl.formatMessage(intlMessages.fullscreenLabel)}
              description={intl.formatMessage(intlMessages.fullscreenDesc)}
              onClick={toggleFullScreen.bind(this)}
            />
            <DropdownListItem
              icon="more"
              label={intl.formatMessage(intlMessages.settingsLabel)}
              description={intl.formatMessage(intlMessages.settingsDesc)}
              onClick={openSettings.bind(this)}
            />
            <DropdownListItem
              label={intl.formatMessage(intlMessages.aboutLabel)}
              description={intl.formatMessage(intlMessages.aboutDesc)}
              onClick={openAbout.bind(this)}
            />
            <DropdownListSeparator />
            <DropdownListItem
              icon="logout"
              label={intl.formatMessage(intlMessages.leaveSessionLabel)}
              description={intl.formatMessage(intlMessages.leaveSessionDesc)}
              onClick={openLogoutConfirmation.bind(this)}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default injectIntl(SettingsDropdown);
