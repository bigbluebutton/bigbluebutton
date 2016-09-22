import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import styles from '../styles';

import { showModal } from '/imports/ui/components/app/service';
import LogoutConfirmation from '/imports/ui/components/logout-confirmation/component';
import Settings from '/imports/ui/components/settings/component';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.dropdown.optionsLabel',
    defaultMessage: 'Options',
  },
  fullscreenLabel: {
    id: 'app.dropdown.fullscreenLabel',
    defaultMessage: 'Make fullscreen',
  },
  settingsLabel: {
    id: 'app.dropdown.settingsLabel',
    defaultMessage: 'Open settings',
  },
  leaveSessionLabel: {
    id: 'app.dropdown.leaveSessionLabel',
    defaultMessage: 'Logout',
  },
  fullscreenDesc: {
    id: 'app.dropdown.fullscreenDesc',
    defaultMessage: 'Make the settings menu fullscreen',
  },
  settingsDesc: {
    id: 'app.dropdown.settingsDesc',
    defaultMessage: 'Change the general settings',
  },
  leaveSessionDesc: {
    id: 'app.dropdown.leaveSessionDesc',
    defaultMessage: 'Leave the meeting',
  },
});

const toggleFullScreen = () => {
  let element = document.documentElement;

  if (document.fullscreenEnabled
    || document.mozFullScreenEnabled
    || document.webkitFullscreenEnabled) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
};

const openSettings = () => showModal(<Settings />);

const openLogoutConfirmation = () => showModal(<LogoutConfirmation />);

export default class SettingsDropdown extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { intl } = this.props;
    return (
      <Dropdown ref="dropdown">
        <DropdownTrigger>
          <Button
            role="button"
            label={intl.formatMessage(intlMessages.optionsLabel)}
            icon="more"
            ghost={true}
            circle={true}
            hideLabel={true}
            className={styles.settingBtn}

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
