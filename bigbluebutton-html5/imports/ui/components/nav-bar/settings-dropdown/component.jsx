import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import styles from '../styles';

import { withModalMounter } from '/imports/ui/components/modal/service';

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

class SettingsDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSettingOpen: false,
    };

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
  }

  onActionsShow() {
    this.setState({
      isSettingOpen: true,
    });
  }

  onActionsHide() {
    this.setState({
      isSettingOpen: false,
    });
  }

  render() {
    const { intl, mountModal, isFullScreen } = this.props;

    let fullScreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
    let fullScreenDesc = intl.formatMessage(intlMessages.fullscreenDesc);
    let fullScreenIcon = 'fullscreen';

    if (isFullScreen) {
      fullScreenLabel = intl.formatMessage(intlMessages.exitFullScreenLabel);
      fullScreenDesc = intl.formatMessage(intlMessages.exitFullScreenDesc);
      fullScreenIcon = 'exit_fullscreen';
    }

    return (
      <Dropdown autoFocus={true}
                isOpen={this.state.isSettingOpen}
                onShow={this.onActionsShow}
                onHide={this.onActionsHide}>
        <DropdownTrigger tabIndex={0}>
          <Button
            label={intl.formatMessage(intlMessages.optionsLabel)}
            icon="more"
            ghost
            circle
            hideLabel
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
              onClick={() => mountModal(<SettingsMenuContainer />)}
            />
            <DropdownListItem
              icon="about"
              label={intl.formatMessage(intlMessages.aboutLabel)}
              description={intl.formatMessage(intlMessages.aboutDesc)}
              onClick={() => mountModal(<AboutContainer />)}
            />
            <DropdownListSeparator />
            <DropdownListItem
              icon="logout"
              label={intl.formatMessage(intlMessages.leaveSessionLabel)}
              description={intl.formatMessage(intlMessages.leaveSessionDesc)}
              onClick={() => mountModal(<LogoutConfirmation />)}
            />
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default withModalMounter(injectIntl(SettingsDropdown));
