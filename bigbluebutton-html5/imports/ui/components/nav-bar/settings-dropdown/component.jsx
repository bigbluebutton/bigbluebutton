import React, { PureComponent } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';
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
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import logoutRouteHandler from '/imports/utils/logoutRouteHandler';

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
  helpLabel: {
    id: 'app.navBar.settingsDropdown.helpLabel',
    description: 'Help options label',
  },
  helpDesc: {
    id: 'app.navBar.settingsDropdown.helpDesc',
    description: 'Describes help option',
  },
  endMeetingLabel: {
    id: 'app.navBar.settingsDropdown.endMeetingLabel',
    description: 'End meeting options label',
  },
  endMeetingDesc: {
    id: 'app.navBar.settingsDropdown.endMeetingDesc',
    description: 'Describes settings option closing the current meeting',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  isFullScreen: PropTypes.bool,
  isAndroid: PropTypes.bool,
  amIModerator: PropTypes.bool,
  shortcuts: PropTypes.string,
};

const defaultProps = {
  isFullScreen: false,
  isAndroid: false,
  amIModerator: false,
  shortcuts: '',
};

class SettingsDropdown extends PureComponent {
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

  getFullscreenItem() {
    const {
      intl,
      isFullScreen,
      isAndroid,
      handleToggleFullscreen,
    } = this.props;

    let fullscreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
    let fullscreenDesc = intl.formatMessage(intlMessages.fullscreenDesc);
    let fullscreenIcon = 'fullscreen';

    if (isFullScreen) {
      fullscreenLabel = intl.formatMessage(intlMessages.exitFullscreenLabel);
      fullscreenDesc = intl.formatMessage(intlMessages.exitFullscreenDesc);
      fullscreenIcon = 'exit_fullscreen';
    }

    if (!isAndroid) return null;
    return (
      <DropdownListItem
        key="list-item-fullscreen"
        icon={fullscreenIcon}
        label={fullscreenLabel}
        description={fullscreenDesc}
        onClick={handleToggleFullscreen}
      />
    );
  }

  renderMenuItems() {
    const {
      intl, mountModal, amIModerator,
    } = this.props;

    const { showHelpButton: helpButton } = Meteor.settings.public.app;

    return _.compact([
      this.getFullscreenItem(),
      (<DropdownListItem
        key="list-item-settings"
        icon="settings"
        label={intl.formatMessage(intlMessages.settingsLabel)}
        description={intl.formatMessage(intlMessages.settingsDesc)}
        onClick={() => mountModal(<SettingsMenuContainer />)}
      />),
      (<DropdownListItem
        key="list-item-about"
        icon="about"
        label={intl.formatMessage(intlMessages.aboutLabel)}
        description={intl.formatMessage(intlMessages.aboutDesc)}
        onClick={() => mountModal(<AboutContainer />)}
      />),
      !helpButton ? null
        : (
          <DropdownListItem
            key="list-item-help"
            icon="help"
            label={intl.formatMessage(intlMessages.helpLabel)}
            description={intl.formatMessage(intlMessages.helpDesc)}
            onClick={() => window.open('https://bigbluebutton.org/videos/')}
          />
        ),
      (<DropdownListItem
        key="list-item-shortcuts"
        icon="shortcuts"
        label={intl.formatMessage(intlMessages.hotkeysLabel)}
        description={intl.formatMessage(intlMessages.hotkeysDesc)}
        onClick={() => mountModal(<ShortcutHelpComponent />)}
      />),
      (<DropdownListSeparator key={_.uniqueId('list-separator-')} />),
      !amIModerator ? null
        : (
          <DropdownListItem
            key="list-item-end-meeting"
            icon="application"
            label={intl.formatMessage(intlMessages.endMeetingLabel)}
            description={intl.formatMessage(intlMessages.endMeetingDesc)}
            onClick={() => mountModal(<EndMeetingConfirmationContainer />)}
          />
        ),
      (<DropdownListItem
        key="list-item-logout"
        icon="logout"
        label={intl.formatMessage(intlMessages.leaveSessionLabel)}
        description={intl.formatMessage(intlMessages.leaveSessionDesc)}
        onClick={logoutRouteHandler}
      />),
    ]);
  }

  render() {
    const {
      intl,
      shortcuts: OPEN_OPTIONS_AK,
    } = this.props;

    const { isSettingOpen } = this.state;

    return (
      <Dropdown
        autoFocus
        keepOpen={isSettingOpen}
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
            className={styles.btn}

            // FIXME: Without onClick react proptypes keep warning
            // even after the DropdownTrigger inject an onClick handler
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="bottom right">
          <DropdownList>
            {this.renderMenuItems()}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}
SettingsDropdown.propTypes = propTypes;
SettingsDropdown.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(SettingsDropdown)), 'openOptions');
