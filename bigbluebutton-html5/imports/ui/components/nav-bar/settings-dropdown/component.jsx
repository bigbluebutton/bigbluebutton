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
  exitFullScreenDesc: {
    id: 'app.navBar.settingsDropdown.exitFullScreenDesc',
    defaultMessage: 'exit fullscreen mode',
  },
  exitFullScreenLabel: {
    id: 'app.navBar.settingsDropdown.exitFullScreenLabel',
    defaultMessage: 'Exit fullscreen',
  },
});

const openSettings = () => showModal(<SettingsMenuContainer  />);

const openAbout = () => showModal(<AboutContainer />);

const openLogoutConfirmation = () => showModal(<LogoutConfirmation />);

class SettingsDropdown extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    const { intl, isFullScreen } = this.props;

    let fullScreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
    let fullScreenDesc = intl.formatMessage(intlMessages.fullscreenDesc);

    if (isFullScreen) {
      fullScreenLabel = intl.formatMessage(intlMessages.exitFullScreenLabel);
      fullScreenDesc = intl.formatMessage(intlMessages.exitFullScreenDesc);
    }

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
              label={fullScreenLabel}
              description={fullScreenDesc}
              onClick={this.props.handleToggleFullscreen}
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
