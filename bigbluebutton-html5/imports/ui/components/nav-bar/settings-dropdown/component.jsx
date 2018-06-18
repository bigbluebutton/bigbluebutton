import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import _ from 'lodash';
import { withModalMounter } from '/imports/ui/components/modal/service';

import LogoutConfirmationContainer from '/imports/ui/components/logout-confirmation/container';
import AboutContainer from '/imports/ui/components/about/container';
import SettingsMenuContainer from '/imports/ui/components/settings/container';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import ShortcutHelpComponent from '/imports/ui/components/shortcut-help/component';

import { styles } from '../styles';

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
  exitFullscreenDesc: {
    id: 'app.navBar.settingsDropdown.exitFullscreenDesc',
    description: 'Describes exit fullscreen option',
  },
  exitFullscreenLabel: {
    id: 'app.navBar.settingsDropdown.exitFullscreenLabel',
    description: 'Exit fullscreen option label',
  },
  hotkeysLabel: {
    id: 'app.navBar.settingsDropdown.hotkeysLabel',
    description: 'Hotkeys options label',
  },
  hotkeysDesc: {
    id: 'app.navBar.settingsDropdown.hotkeysDesc',
    description: 'Describes hotkeys option',
  },
});

const SHORTCUTS_CONFIG = Meteor.settings.public.app.shortcuts;
const OPEN_OPTIONS_AK = SHORTCUTS_CONFIG.openOptions.accesskey;

class SettingsDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSettingOpen: false,
    };

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
  }

  componentWillMount() {
    const { intl, mountModal } = this.props;
    this.menuItems = [
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="settings"
        label={intl.formatMessage(intlMessages.settingsLabel)}
        description={intl.formatMessage(intlMessages.settingsDesc)}
        onClick={() => mountModal(<SettingsMenuContainer />)}
      />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="about"
        label={intl.formatMessage(intlMessages.aboutLabel)}
        description={intl.formatMessage(intlMessages.aboutDesc)}
        onClick={() => mountModal(<AboutContainer />)}
      />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="about"
        label={intl.formatMessage(intlMessages.hotkeysLabel)}
        description={intl.formatMessage(intlMessages.hotkeysDesc)}
        onClick={() => mountModal(<ShortcutHelpComponent />)}
      />),
      (<DropdownListSeparator key={_.uniqueId('list-separator-')} />),
      (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon="logout"
        label={intl.formatMessage(intlMessages.leaveSessionLabel)}
        description={intl.formatMessage(intlMessages.leaveSessionDesc)}
        onClick={() => mountModal(<LogoutConfirmationContainer />)}
      />),
    ];
    // Adds Fullscreen button if user is on Android.
    if (/android/i.test(navigator.userAgent)) {
      const { fullscreenLabel, fullscreenDesc, fullscreenIcon } = this.checkFullscreen(this.props);
      const newFullScreenButton = (<DropdownListItem
        key={_.uniqueId('list-item-')}
        icon={fullscreenIcon}
        label={fullscreenLabel}
        description={fullscreenDesc}
        onClick={this.props.handleToggleFullscreen}
      />);
      this.menuItems.unshift(newFullScreenButton);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Alters fullscreen button's label
    if (/android/i.test(navigator.userAgent)) {
      this.alterMenu(nextProps);
    }
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

  checkFullscreen(nextProps) {
    const { intl, isFullScreen } = nextProps;

    let fullscreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
    let fullscreenDesc = intl.formatMessage(intlMessages.fullscreenDesc);
    let fullscreenIcon = 'fullscreen';

    if (isFullScreen) {
      fullscreenLabel = intl.formatMessage(intlMessages.exitFullscreenLabel);
      fullscreenDesc = intl.formatMessage(intlMessages.exitFullscreenDesc);
      fullscreenIcon = 'exit_fullscreen';
    }
    return {
      fullscreenLabel,
      fullscreenDesc,
      fullscreenIcon,
    };
  }

  alterMenu(props) {
    const { fullscreenLabel, fullscreenDesc, fullscreenIcon } = this.checkFullscreen(props);

    const newFullScreenButton = (<DropdownListItem
      key={_.uniqueId('list-item-')}
      icon={fullscreenIcon}
      label={fullscreenLabel}
      description={fullscreenDesc}
      onClick={this.props.handleToggleFullscreen}
    />);
    this.menuItems = this.menuItems.slice(1);
    this.menuItems.unshift(newFullScreenButton);
  }

  render() {
    const { intl } = this.props;

    return (
      <Dropdown
        autoFocus
        isOpen={this.state.isSettingOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
      >
        <DropdownTrigger tabIndex={0} accessKey={OPEN_OPTIONS_AK}>
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
            {
              this.menuItems
            }
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

export default withModalMounter(injectIntl(SettingsDropdown));
