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
    description: 'Options button label',
  },
  fullscreenLabel: {
    id: 'app.navBar.settingsDropdown.fullscreenLabel',
    description: 'Make fullscreen option label',
  },
  settingsLabel: {
    id: 'app.navBar.settingsDropdown.settingsLabel',
    description: 'Open settings option label',
  },
  aboutLabel: {
    id: 'app.navBar.settingsDropdown.aboutLabel',
    description: 'About option label',
  },
  aboutDesc: {
    id: 'app.navBar.settingsDropdown.aboutDesc',
    description: 'Describes about option',
  },
  leaveSessionLabel: {
    id: 'app.navBar.settingsDropdown.leaveSessionLabel',
    description: 'Leave session button label',
  },
  fullscreenDesc: {
    id: 'app.navBar.settingsDropdown.fullscreenDesc',
    description: 'Describes fullscreen option',
  },
  settingsDesc: {
    id: 'app.navBar.settingsDropdown.settingsDesc',
    description: 'Describes settings option',
  },
  leaveSessionDesc: {
    id: 'app.navBar.settingsDropdown.leaveSessionDesc',
    description: 'Describes leave session option',
  },
  exitFullScreenDesc: {
    id: 'app.navBar.settingsDropdown.exitFullScreenDesc',
    description: 'Describes exit fullscreen option',
  },
  exitFullScreenLabel: {
    id: 'app.navBar.settingsDropdown.exitFullScreenLabel',
    description: 'Exit fullscreen option label',
  },
});

const openSettings = () => showModal(<SettingsMenuContainer />);

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
    let fullScreenIcon = 'fullscreen';

    if (isFullScreen) {
      fullScreenLabel = intl.formatMessage(intlMessages.exitFullScreenLabel);
      fullScreenDesc = intl.formatMessage(intlMessages.exitFullScreenDesc);
      fullScreenIcon = 'exit_fullscreen';
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
              icon={fullScreenIcon}
              label={fullScreenLabel}
              description={fullScreenDesc}
              onClick={this.props.handleToggleFullscreen}
            />
            <DropdownListItem
              icon="settings"
              label={intl.formatMessage(intlMessages.settingsLabel)}
              description={intl.formatMessage(intlMessages.settingsDesc)}
              onClick={openSettings.bind(this)}
            />
            <DropdownListItem
              icon="about"
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
